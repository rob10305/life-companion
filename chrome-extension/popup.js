// Life Companion — Chrome Bookmark Sync Extension

let SUPABASE_URL = ''
let SUPABASE_KEY = ''
let APP_URL = ''

// ─── DOM REFS ──────────────────────────────────────────────────

const configView = document.getElementById('config-view')
const mainView = document.getElementById('main-view')
const supabaseUrlInput = document.getElementById('supabase-url')
const supabaseKeyInput = document.getElementById('supabase-key')
const saveConfigBtn = document.getElementById('save-config')
const importBtn = document.getElementById('import-btn')
const refreshBtn = document.getElementById('refresh-btn')
const chromeCountEl = document.getElementById('chrome-count')
const supabaseCountEl = document.getElementById('supabase-count')
const newCountEl = document.getElementById('new-count')
const statusMessage = document.getElementById('status-message')
const progressBar = document.getElementById('progress-bar')
const progressFill = document.getElementById('progress-fill')
const openAppLink = document.getElementById('open-app')

// ─── INIT ──────────────────────────────────────────────────────

chrome.storage.local.get(['supabase_url', 'supabase_key', 'app_url'], (data) => {
  if (data.supabase_url && data.supabase_key) {
    SUPABASE_URL = data.supabase_url
    SUPABASE_KEY = data.supabase_key
    APP_URL = data.app_url || ''
    openAppLink.href = APP_URL || '#'
    showMainView()
  } else {
    configView.classList.remove('hidden')
    mainView.classList.add('hidden')
  }
})

// ─── CONFIG ────────────────────────────────────────────────────

saveConfigBtn.addEventListener('click', async () => {
  const url = supabaseUrlInput.value.trim()
  const key = supabaseKeyInput.value.trim()

  if (!url || !key) {
    showStatus('Please fill in both fields.', 'error')
    return
  }

  // Test connection
  saveConfigBtn.innerHTML = '<div class="spinner"></div> Connecting...'
  saveConfigBtn.disabled = true

  try {
    const res = await fetch(`${url}/rest/v1/bookmarks?select=id&limit=1`, {
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    SUPABASE_URL = url
    SUPABASE_KEY = key
    chrome.storage.local.set({ supabase_url: url, supabase_key: key })
    showMainView()
  } catch (e) {
    showStatus(`Connection failed: ${e.message}. Check your credentials.`, 'error')
    saveConfigBtn.innerHTML = 'Save & Connect'
    saveConfigBtn.disabled = false
  }
})

// ─── MAIN VIEW ─────────────────────────────────────────────────

async function showMainView() {
  configView.classList.add('hidden')
  mainView.classList.remove('hidden')
  await refreshCounts()
}

// ─── READ CHROME BOOKMARKS ─────────────────────────────────────

function getAllChromeBookmarks() {
  return new Promise((resolve) => {
    chrome.bookmarks.getTree((tree) => {
      const results = []
      function walk(nodes, folder) {
        for (const node of nodes) {
          if (node.url) {
            results.push({
              title: node.title || 'Untitled',
              url: node.url,
              folder: folder,
            })
          }
          if (node.children) {
            const childFolder = folder ? `${folder} / ${node.title}` : (node.title || '')
            walk(node.children, childFolder)
          }
        }
      }
      walk(tree, '')
      // Filter to only http(s) URLs
      resolve(results.filter(b => b.url.startsWith('http')))
    })
  })
}

// ─── SUPABASE HELPERS ──────────────────────────────────────────

function supaHeaders() {
  return {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal',
  }
}

async function getExistingUrls() {
  const urls = new Set()
  let offset = 0
  const limit = 1000
  while (true) {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/bookmarks?select=url&offset=${offset}&limit=${limit}`,
      { headers: supaHeaders() }
    )
    const data = await res.json()
    for (const row of data) urls.add(row.url)
    if (data.length < limit) break
    offset += limit
  }
  return urls
}

async function getSupabaseCount() {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/bookmarks?select=id`,
    { headers: { ...supaHeaders(), 'Prefer': 'count=exact' } }
  )
  const count = res.headers.get('content-range')
  if (count) {
    const match = count.match(/\/(\d+)/)
    return match ? parseInt(match[1]) : 0
  }
  const data = await res.json()
  return data.length
}

function categorize(folder) {
  const lower = (folder || '').toLowerCase()
  if (/car|auto|restomod|vehicle/.test(lower)) return 'cars'
  if (/ai|claude|chatgpt|openai|machine.?learn/.test(lower)) return 'ai'
  if (/tech|dev|tool|code|github|programming/.test(lower)) return 'dev-tools'
  if (/learn|course|tutorial|education/.test(lower)) return 'learning'
  if (/shop|amazon|buy|store|product/.test(lower)) return 'tech'
  return 'uncategorized'
}

// ─── REFRESH COUNTS ────────────────────────────────────────────

async function refreshCounts() {
  try {
    const [chromeBookmarks, existingUrls] = await Promise.all([
      getAllChromeBookmarks(),
      getExistingUrls(),
    ])

    const newBookmarks = chromeBookmarks.filter(b => !existingUrls.has(b.url))

    chromeCountEl.textContent = chromeBookmarks.length
    supabaseCountEl.textContent = existingUrls.size
    newCountEl.textContent = newBookmarks.length

    if (newBookmarks.length === 0) {
      importBtn.disabled = true
      importBtn.textContent = 'All Synced!'
      showStatus('All your Chrome bookmarks are already imported.', 'success')
    } else {
      importBtn.disabled = false
      importBtn.innerHTML = `Import ${newBookmarks.length} New Bookmark${newBookmarks.length !== 1 ? 's' : ''}`
    }
  } catch (e) {
    showStatus(`Error: ${e.message}`, 'error')
  }
}

refreshBtn.addEventListener('click', refreshCounts)

// ─── IMPORT ────────────────────────────────────────────────────

importBtn.addEventListener('click', async () => {
  importBtn.disabled = true
  importBtn.innerHTML = '<div class="spinner"></div> Importing...'
  progressBar.classList.remove('hidden')
  progressFill.style.width = '0%'

  try {
    const chromeBookmarks = await getAllChromeBookmarks()
    const existingUrls = await getExistingUrls()
    const newBookmarks = chromeBookmarks.filter(b => !existingUrls.has(b.url))

    if (newBookmarks.length === 0) {
      showStatus('Nothing new to import!', 'success')
      importBtn.innerHTML = 'All Synced!'
      progressBar.classList.add('hidden')
      return
    }

    let success = 0
    let failed = 0
    const timestamp = new Date().toISOString()

    for (let i = 0; i < newBookmarks.length; i++) {
      const bm = newBookmarks[i]
      const id = `bm-ext-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

      const payload = [{
        id,
        title: bm.title.slice(0, 500),
        url: bm.url.slice(0, 2000),
        description: (bm.folder || '').slice(0, 500),
        category: categorize(bm.folder),
        pinned: (bm.folder || '').includes('Bookmarks Bar'),
        created_at: timestamp,
      }]

      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/bookmarks`, {
          method: 'POST',
          headers: supaHeaders(),
          body: JSON.stringify(payload),
        })
        if (res.ok) {
          success++
        } else {
          failed++
        }
      } catch {
        failed++
      }

      // Update progress
      const pct = Math.round(((i + 1) / newBookmarks.length) * 100)
      progressFill.style.width = `${pct}%`
    }

    progressBar.classList.add('hidden')

    let msg = `Imported ${success} bookmark${success !== 1 ? 's' : ''}.`
    if (failed > 0) msg += ` Skipped ${failed}.`
    showStatus(msg, failed > 0 ? 'info' : 'success')

    await refreshCounts()
  } catch (e) {
    showStatus(`Import failed: ${e.message}`, 'error')
    progressBar.classList.add('hidden')
    importBtn.disabled = false
    importBtn.textContent = 'Retry Import'
  }
})

// ─── OPEN APP ──────────────────────────────────────────────────

openAppLink.addEventListener('click', (e) => {
  if (APP_URL) {
    chrome.tabs.create({ url: APP_URL })
  } else {
    // Ask for URL
    const url = prompt('Enter your Life Companion URL (e.g. https://life-companion.vercel.app):')
    if (url) {
      APP_URL = url.trim()
      chrome.storage.local.set({ app_url: APP_URL })
      openAppLink.href = APP_URL
      chrome.tabs.create({ url: APP_URL })
    }
  }
  e.preventDefault()
})

// ─── HELPERS ───────────────────────────────────────────────────

function showStatus(text, type) {
  statusMessage.innerHTML = `<div class="message ${type}">${text}</div>`
}
