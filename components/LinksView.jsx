'use client'
import { useState, useMemo } from 'react'
import {
  Plus, Search, ExternalLink, Pencil, Trash2, Bookmark, X,
  FolderPlus, Globe, Pin, PinOff, Chrome, Loader2, Download,
  CheckCircle2, AlertTriangle, Upload, Puzzle, ChevronDown, ChevronUp
} from 'lucide-react'
import { useData } from '../lib/DataContext'
import { generateId } from '../lib/utils'

/* ─── Bookmarks Bar ────────────────────────────────────────── */

function BookmarksBar({ bookmarks, onTogglePin }) {
  const pinned = bookmarks.filter(b => b.pinned)
  const [contextMenu, setContextMenu] = useState(null)

  if (pinned.length === 0) return null

  function handleContextMenu(e, bm) {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, bookmark: bm })
  }

  function handleUnpin() {
    if (contextMenu?.bookmark) {
      onTogglePin(contextMenu.bookmark.id)
    }
    setContextMenu(null)
  }

  return (
    <div className="flex-shrink-0 border-b border-cream-300 dark:border-gray-800 bg-cream-200/50 dark:bg-gray-900/50" onClick={() => setContextMenu(null)}>
      <div className="flex items-center gap-1 px-4 py-2 overflow-x-auto">
        <Bookmark size={13} className="text-notion-muted dark:text-gray-600 flex-shrink-0 mr-1" />
        {pinned.map(bm => {
          let favicon = null
          try { favicon = `https://www.google.com/s2/favicons?sz=16&domain=${new URL(bm.url).hostname}` } catch {}
          return (
            <a
              key={bm.id}
              href={bm.url}
              target="_blank"
              rel="noopener noreferrer"
              onContextMenu={(e) => handleContextMenu(e, bm)}
              className="group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-notion-text/80 dark:text-gray-300 hover:text-notion-text dark:hover:text-white hover:bg-cream-200 dark:hover:bg-gray-800 transition-all flex-shrink-0 max-w-[160px]"
            >
              {favicon && <img src={favicon} alt="" className="w-4 h-4 flex-shrink-0" />}
              <span className="truncate">{bm.title}</span>
            </a>
          )
        })}
      </div>

      {/* Right-click context menu */}
      {contextMenu && (
        <>
          <div className="fixed inset-0 z-50" onClick={() => setContextMenu(null)} onContextMenu={e => { e.preventDefault(); setContextMenu(null) }} />
          <div
            className="fixed z-50 bg-cream-200 dark:bg-gray-800 border border-cream-400 dark:border-gray-700 rounded-xl shadow-2xl py-1 min-w-[160px]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <div className="px-3 py-1.5 text-xs text-notion-muted dark:text-gray-500 truncate max-w-[200px]">
              {contextMenu.bookmark.title}
            </div>
            <div className="h-px bg-cream-300 dark:bg-gray-700 my-1" />
            <button
              onClick={handleUnpin}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-notion-text/80 dark:text-gray-300 hover:bg-cream-300 dark:hover:bg-gray-700 hover:text-notion-text dark:hover:text-white transition-colors text-left"
            >
              <PinOff size={13} /> Unpin from bar
            </button>
            <a
              href={contextMenu.bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setContextMenu(null)}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-notion-text/80 dark:text-gray-300 hover:bg-cream-300 dark:hover:bg-gray-700 hover:text-notion-text dark:hover:text-white transition-colors text-left"
            >
              <ExternalLink size={13} /> Open in new tab
            </a>
          </div>
        </>
      )}
    </div>
  )
}

/* ─── Chrome Import Modal ──────────────────────────────────── */

/* ─── Extension Download Card ──────────────────────────────── */

function ExtensionCard() {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-2xl overflow-hidden">
      <div className="p-4 flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
          <Puzzle size={20} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-notion-text dark:text-white">Chrome Extension</h3>
          <p className="text-xs text-notion-muted dark:text-gray-400 mt-0.5">Auto-import bookmarks from any machine</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <a
            href="/downloads/life-companion-extension.zip"
            download
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors"
          >
            <Download size={13} /> Download
          </a>
          <button
            onClick={() => setExpanded(v => !v)}
            className="p-2 rounded-lg hover:bg-cream-200 dark:hover:bg-gray-800 text-notion-muted dark:text-gray-400 hover:text-notion-text dark:hover:text-white transition-colors"
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 pt-0">
          <div className="bg-cream-200 dark:bg-gray-900/60 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-semibold text-notion-text/80 dark:text-gray-300">Install Instructions</h4>
            <ol className="space-y-2 text-xs text-notion-muted dark:text-gray-400 leading-relaxed">
              <li className="flex gap-2">
                <span className="text-blue-400 font-bold flex-shrink-0">1.</span>
                <span>Download the zip above and <strong className="text-notion-text/80 dark:text-gray-300">extract</strong> it to a folder</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-400 font-bold flex-shrink-0">2.</span>
                <span>Go to <code className="bg-cream-300 dark:bg-gray-800 px-1.5 py-0.5 rounded text-blue-300">chrome://extensions</code> in Chrome</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-400 font-bold flex-shrink-0">3.</span>
                <span>Toggle <strong className="text-notion-text/80 dark:text-gray-300">Developer mode</strong> ON (top right)</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-400 font-bold flex-shrink-0">4.</span>
                <span>Click <strong className="text-notion-text/80 dark:text-gray-300">Load unpacked</strong> → select the extracted folder</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-400 font-bold flex-shrink-0">5.</span>
                <span>Click the <strong className="text-notion-text/80 dark:text-gray-300">LC</strong> icon in toolbar → enter your Supabase URL and key → Import!</span>
              </li>
            </ol>
            <p className="text-xs text-notion-muted dark:text-gray-500 pt-1 border-t border-cream-300 dark:border-gray-800">
              Works on any PC with Chrome. Install once per machine — bookmarks sync to your dashboard automatically.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Chrome Import Modal ──────────────────────────────────── */

function parseBookmarksHtml(html) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const results = []

  function walk(node, folder) {
    for (const child of node.children) {
      if (child.tagName === 'DT') {
        const a = child.querySelector(':scope > A')
        const dl = child.querySelector(':scope > DL')
        const h3 = child.querySelector(':scope > H3')
        if (a) {
          results.push({
            title: a.textContent.trim() || 'Untitled',
            url: a.getAttribute('HREF') || '',
            folder: folder,
            dateAdded: a.getAttribute('ADD_DATE')
              ? new Date(Number(a.getAttribute('ADD_DATE')) * 1000).toISOString()
              : null,
          })
        }
        if (h3 && dl) {
          const subFolder = folder ? `${folder} / ${h3.textContent.trim()}` : h3.textContent.trim()
          walk(dl, subFolder)
        } else if (dl) {
          walk(dl, folder)
        }
      } else if (child.tagName === 'DL') {
        walk(child, folder)
      }
    }
  }

  walk(doc.body, '')
  return results.filter(b => b.url && b.url.startsWith('http'))
}

function ChromeImportModal({ existingUrls, bookmarkCategories, onImport, onClose }) {
  const [phase, setPhase] = useState('idle') // idle | loading | preview | error
  const [chromeBookmarks, setChromeBookmarks] = useState([])
  const [selected, setSelected] = useState(new Set())
  const [defaultCategory, setDefaultCategory] = useState('uncategorized')
  const [error, setError] = useState('')

  async function fetchChromeBookmarks() {
    setPhase('loading')
    setError('')
    try {
      const res = await fetch('/api/chrome/bookmarks')
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to read Chrome bookmarks')
        setPhase('error')
        return
      }
      const fresh = data.bookmarks.filter(b => !existingUrls.has(b.url))
      setChromeBookmarks(fresh)
      setSelected(new Set(fresh.map((_, i) => i)))
      setPhase('preview')
    } catch {
      setError('Failed to connect. Try uploading an exported bookmarks file instead.')
      setPhase('error')
    }
  }

  function handleFileUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhase('loading')
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = parseBookmarksHtml(ev.target.result)
        const fresh = parsed.filter(b => !existingUrls.has(b.url))
        setChromeBookmarks(fresh)
        setSelected(new Set(fresh.map((_, i) => i)))
        setPhase('preview')
      } catch {
        setError('Could not parse the bookmarks file. Make sure it\'s a Chrome HTML export.')
        setPhase('error')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  function toggleSelect(idx) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(idx) ? next.delete(idx) : next.add(idx)
      return next
    })
  }

  function toggleAll() {
    if (selected.size === chromeBookmarks.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(chromeBookmarks.map((_, i) => i)))
    }
  }

  function handleImport() {
    const toImport = chromeBookmarks
      .filter((_, i) => selected.has(i))
      .map(bm => ({
        id: generateId('bm'),
        title: bm.title,
        url: bm.url,
        description: bm.folder || '',
        category: defaultCategory,
        pinned: false,
        createdAt: bm.dateAdded || new Date().toISOString(),
      }))
    onImport(toImport)
    setImportCount(toImport.length)
    setPhase('idle')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 border border-cream-300 dark:border-gray-700 rounded-2xl w-full max-w-lg shadow-2xl my-4">
        <div className="flex items-center justify-between p-5 border-b border-cream-300 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <Chrome size={18} className="text-blue-400" />
            <h2 className="text-lg font-semibold">Import from Chrome</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-cream-200 dark:hover:bg-gray-800 text-notion-muted dark:text-gray-400 hover:text-notion-text dark:hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Idle — two import options */}
        {phase === 'idle' && (
          <div className="p-6 space-y-4">
            {/* Option 1: Local script (recommended) */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <Download size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-notion-text dark:text-white mb-1">Auto-import (recommended)</h3>
                  <p className="text-xs text-notion-muted dark:text-gray-400 leading-relaxed mb-2">
                    Run <code className="bg-cream-300 dark:bg-gray-800 px-1.5 py-0.5 rounded text-blue-300">import-chrome-bookmarks.bat</code> from
                    the project folder on your PC. It reads Chrome bookmarks and pushes them straight to Supabase.
                  </p>
                  <p className="text-xs text-notion-muted dark:text-gray-500">
                    Requires a <code className="bg-cream-300 dark:bg-gray-800 px-1 rounded">.env.local</code> file with your Supabase credentials.
                  </p>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-cream-300 dark:bg-gray-800" />
              <span className="text-xs text-notion-muted dark:text-gray-600">or upload manually</span>
              <div className="flex-1 h-px bg-cream-300 dark:bg-gray-800" />
            </div>

            {/* Option 2: Upload exported file */}
            <div className="bg-cream-200 dark:bg-gray-800 rounded-xl p-5 text-center">
              <Upload size={24} className="mx-auto text-notion-muted dark:text-gray-400 mb-3" />
              <h3 className="text-sm font-medium text-notion-text dark:text-white mb-1">Upload bookmarks file</h3>
              <p className="text-xs text-notion-muted dark:text-gray-400 mb-2 max-w-sm mx-auto leading-relaxed">
                In Chrome: <span className="text-notion-text/80 dark:text-gray-300">chrome://bookmarks</span> → three dots → Export bookmarks.
              </p>
              <p className="text-xs text-notion-muted dark:text-gray-500 mb-4">
                Default export location: <code className="bg-cream-300 dark:bg-gray-700 px-1.5 py-0.5 rounded text-notion-text/80 dark:text-gray-300 text-[10px]">Downloads\bookmarks_*.html</code>
              </p>
              <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-cream-300 dark:bg-gray-700 hover:bg-cream-300 dark:hover:bg-gray-600 text-notion-text dark:text-white rounded-xl text-sm font-medium transition-colors cursor-pointer">
                <Upload size={15} /> Choose File
                <input type="file" accept=".html,.htm" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>
        )}

        {/* Loading */}
        {phase === 'loading' && (
          <div className="flex flex-col items-center justify-center py-12 text-notion-muted dark:text-gray-400">
            <Loader2 size={28} className="animate-spin text-blue-400 mb-3" />
            <p className="text-sm">Reading Chrome bookmarks...</p>
          </div>
        )}

        {/* Error */}
        {phase === 'error' && (
          <div className="p-6">
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
              <AlertTriangle size={24} className="mx-auto text-red-400 mb-2" />
              <p className="text-sm text-red-300 mb-3">{error}</p>
              <button
                onClick={fetchChromeBookmarks}
                className="inline-flex items-center gap-2 px-4 py-2 bg-cream-200 dark:bg-gray-800 hover:bg-cream-300 dark:hover:bg-gray-700 text-notion-text dark:text-white rounded-xl text-sm transition-colors"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Preview */}
        {phase === 'preview' && (
          <div className="p-5 space-y-4">
            {chromeBookmarks.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 size={28} className="mx-auto text-green-400 mb-3" />
                <p className="text-sm text-notion-text dark:text-white font-medium">All caught up!</p>
                <p className="text-xs text-notion-muted dark:text-gray-400 mt-1">
                  No new bookmarks found in Chrome (or they're all already imported).
                </p>
              </div>
            ) : (
              <>
                {/* Category selector */}
                <div>
                  <label className="block text-xs text-notion-muted dark:text-gray-400 mb-1.5">Import into category</label>
                  <select
                    value={defaultCategory}
                    onChange={e => setDefaultCategory(e.target.value)}
                    className="w-full bg-cream-200 dark:bg-gray-800 border border-cream-400 dark:border-gray-700 rounded-xl px-3 py-2.5 text-notion-text dark:text-white text-sm focus:outline-none focus:border-blue-500"
                  >
                    {bookmarkCategories.map(c => (
                      <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
                    ))}
                  </select>
                </div>

                {/* Select all / count */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={toggleAll}
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    {selected.size === chromeBookmarks.length ? 'Deselect all' : 'Select all'}
                  </button>
                  <span className="text-xs text-notion-muted dark:text-gray-500">
                    {selected.size} of {chromeBookmarks.length} selected
                  </span>
                </div>

                {/* Bookmark list */}
                <div className="max-h-64 overflow-y-auto space-y-1 -mx-1 px-1">
                  {chromeBookmarks.map((bm, idx) => {
                    let favicon = null
                    try { favicon = `https://www.google.com/s2/favicons?sz=16&domain=${new URL(bm.url).hostname}` } catch {}
                    return (
                      <button
                        key={idx}
                        onClick={() => toggleSelect(idx)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                          selected.has(idx)
                            ? 'bg-blue-600/10 border border-blue-600/30'
                            : 'border border-transparent hover:bg-cream-200 dark:hover:bg-gray-800'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                          selected.has(idx) ? 'bg-blue-600 border-blue-600' : 'border-cream-400 dark:border-gray-600'
                        }`}>
                          {selected.has(idx) && (
                            <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </div>
                        {favicon && <img src={favicon} alt="" className="w-4 h-4 flex-shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-notion-text dark:text-white truncate">{bm.title}</div>
                          <div className="text-xs text-notion-muted dark:text-gray-500 truncate">{bm.folder}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>

                {/* Import button */}
                <button
                  onClick={handleImport}
                  disabled={selected.size === 0}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <Download size={15} />
                  Import {selected.size} Bookmark{selected.size !== 1 ? 's' : ''}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Link Modal ───────────────────────────────────────────── */

function LinkModal({ bookmark, categories, onSave, onClose }) {
  const isEdit = !!bookmark
  const [form, setForm] = useState({
    title: bookmark?.title || '',
    url: bookmark?.url || '',
    description: bookmark?.description || '',
    category: bookmark?.category || (categories[0]?.id || 'uncategorized'),
  })

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim() || !form.url.trim()) return
    let url = form.url.trim()
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url
    onSave({ ...form, url })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 border border-cream-300 dark:border-gray-700 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-cream-300 dark:border-gray-800">
          <h2 className="text-lg font-semibold">{isEdit ? 'Edit Link' : 'Add Link'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-cream-200 dark:hover:bg-gray-800 text-notion-muted dark:text-gray-400 hover:text-notion-text dark:hover:text-white">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs text-notion-muted dark:text-gray-400 mb-1.5">Title</label>
            <input
              autoFocus
              type="text"
              placeholder="e.g. Hacker News"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full bg-cream-200 dark:bg-gray-800 border border-cream-400 dark:border-gray-700 rounded-xl px-4 py-3 text-notion-text dark:text-white placeholder-notion-muted dark:placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-notion-muted dark:text-gray-400 mb-1.5">URL</label>
            <input
              type="text"
              placeholder="https://..."
              value={form.url}
              onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
              className="w-full bg-cream-200 dark:bg-gray-800 border border-cream-400 dark:border-gray-700 rounded-xl px-4 py-3 text-notion-text dark:text-white placeholder-notion-muted dark:placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-notion-muted dark:text-gray-400 mb-1.5">Description (optional)</label>
            <input
              type="text"
              placeholder="A short note about this link"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full bg-cream-200 dark:bg-gray-800 border border-cream-400 dark:border-gray-700 rounded-xl px-4 py-3 text-notion-text dark:text-white placeholder-notion-muted dark:placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-notion-muted dark:text-gray-400 mb-1.5">Category</label>
            <select
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="w-full bg-cream-200 dark:bg-gray-800 border border-cream-400 dark:border-gray-700 rounded-xl px-3 py-2.5 text-notion-text dark:text-white text-sm focus:outline-none focus:border-blue-500"
            >
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-cream-400 dark:border-gray-700 text-notion-muted dark:text-gray-400 hover:text-notion-text dark:hover:text-white hover:border-cream-400 dark:hover:border-gray-600 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors text-sm flex items-center justify-center gap-2"
            >
              <Plus size={15} />
              {isEdit ? 'Save Changes' : 'Add Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ─── Category Modal ───────────────────────────────────────── */

function CategoryModal({ categories, onSave, onClose }) {
  const [form, setForm] = useState({ label: '', emoji: '📁', color: '#6B7280' })
  const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4', '#F97316', '#84CC16', '#6B7280']
  const EMOJIS = ['📁', '💻', '🏎️', '🤖', '🛠️', '📚', '🎮', '🎨', '🏠', '💰', '🔒', '🌍', '📱', '⚡', '🎵', '🎬']

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.label.trim()) return
    onSave(form)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 border border-cream-300 dark:border-gray-700 rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-cream-300 dark:border-gray-800">
          <h2 className="text-lg font-semibold">New Category</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-cream-200 dark:hover:bg-gray-800 text-notion-muted dark:text-gray-400 hover:text-notion-text dark:hover:text-white">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs text-notion-muted dark:text-gray-400 mb-1.5">Name</label>
            <input
              autoFocus
              type="text"
              placeholder="e.g. Gaming Stuff"
              value={form.label}
              onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
              className="w-full bg-cream-200 dark:bg-gray-800 border border-cream-400 dark:border-gray-700 rounded-xl px-4 py-3 text-notion-text dark:text-white placeholder-notion-muted dark:placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-notion-muted dark:text-gray-400 mb-2">Icon</label>
            <div className="flex gap-1.5 flex-wrap">
              {EMOJIS.map(e => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, emoji: e }))}
                  className={`w-9 h-9 text-lg flex items-center justify-center rounded-lg transition-all ${
                    form.emoji === e ? 'bg-cream-300 dark:bg-gray-600 ring-2 ring-blue-500' : 'bg-cream-200 dark:bg-gray-800 hover:bg-cream-300 dark:hover:bg-gray-700'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs text-notion-muted dark:text-gray-400 mb-2">Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, color: c }))}
                  className={`w-7 h-7 rounded-full transition-all ${form.color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-cream-50 dark:ring-offset-gray-900 scale-110' : 'hover:scale-110'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-cream-400 dark:border-gray-700 text-notion-muted dark:text-gray-400 hover:text-notion-text dark:hover:text-white hover:border-cream-400 dark:hover:border-gray-600 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors text-sm"
            >
              Create Category
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ─── Link Card ────────────────────────────────────────────── */

function LinkCard({ bookmark, category, onEdit, onDelete, onTogglePin }) {
  let favicon = null
  try {
    const host = new URL(bookmark.url).hostname
    favicon = `https://www.google.com/s2/favicons?sz=32&domain=${host}`
  } catch {}

  return (
    <div className="group flex items-center gap-3 px-4 py-3 rounded-xl border border-cream-300 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-cream-400 dark:hover:border-gray-700 transition-all">
      {/* Favicon */}
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden"
        style={{ background: (category?.color || '#6B7280') + '15' }}
      >
        {favicon ? (
          <img src={favicon} alt="" className="w-5 h-5" onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }} />
        ) : null}
        <Globe size={14} style={{ color: category?.color || '#6B7280', display: favicon ? 'none' : 'block' }} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <a
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-notion-text dark:text-white hover:text-blue-300 transition-colors truncate block"
        >
          {bookmark.title}
        </a>
        {bookmark.description && (
          <p className="text-xs text-notion-muted dark:text-gray-500 truncate mt-0.5">{bookmark.description}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button
          onClick={() => onTogglePin(bookmark.id)}
          className={`p-1.5 rounded-lg transition-colors ${
            bookmark.pinned
              ? 'text-yellow-400 hover:bg-yellow-500/20'
              : 'text-notion-muted dark:text-gray-500 hover:bg-cream-300 dark:hover:bg-gray-700 hover:text-yellow-400'
          }`}
          title={bookmark.pinned ? 'Unpin from bar' : 'Pin to bookmarks bar'}
        >
          {bookmark.pinned ? <PinOff size={13} /> : <Pin size={13} />}
        </button>
        <a
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-lg hover:bg-cream-300 dark:hover:bg-gray-700 text-notion-muted dark:text-gray-500 hover:text-blue-400 transition-colors"
        >
          <ExternalLink size={13} />
        </a>
        <button
          onClick={() => onEdit(bookmark)}
          className="p-1.5 rounded-lg hover:bg-cream-300 dark:hover:bg-gray-700 text-notion-muted dark:text-gray-500 hover:text-notion-text dark:hover:text-white transition-colors"
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={() => onDelete(bookmark.id)}
          className="p-1.5 rounded-lg hover:bg-red-500/20 text-notion-muted dark:text-gray-500 hover:text-red-400 transition-colors"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}

/* ─── Main LinksView ───────────────────────────────────────── */

export default function LinksView() {
  const {
    bookmarks, bookmarkCategories,
    addBookmark, updateBookmark, deleteBookmark, toggleBookmarkPin, importBookmarks,
    addBookmarkCategory, deleteBookmarkCategory,
  } = useData()

  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('all')
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [editingLink, setEditingLink] = useState(null)
  const [showCatModal, setShowCatModal] = useState(false)
  const [showChromeImport, setShowChromeImport] = useState(false)

  const existingUrls = useMemo(() => new Set(bookmarks.map(b => b.url)), [bookmarks])

  const filtered = useMemo(() => {
    return bookmarks.filter(b => {
      if (filterCat !== 'all' && b.category !== filterCat) return false
      if (search) {
        const q = search.toLowerCase()
        return b.title.toLowerCase().includes(q) || (b.description || '').toLowerCase().includes(q) || b.url.toLowerCase().includes(q)
      }
      return true
    })
  }, [bookmarks, filterCat, search])

  const grouped = useMemo(() => {
    if (filterCat !== 'all') return null
    const map = {}
    for (const bm of filtered) {
      const cat = bm.category || 'uncategorized'
      if (!map[cat]) map[cat] = []
      map[cat].push(bm)
    }
    return map
  }, [filtered, filterCat])

  function handleSaveLink(data) {
    if (editingLink) {
      updateBookmark({ ...editingLink, ...data })
    } else {
      addBookmark(data)
    }
  }

  function handleEditLink(bm) {
    setEditingLink(bm)
    setShowLinkModal(true)
  }

  function handleCloseLink() {
    setShowLinkModal(false)
    setEditingLink(null)
  }

  function handleDeleteCategory(catId) {
    if (catId === 'uncategorized') return
    const count = bookmarks.filter(b => b.category === catId).length
    const msg = count > 0
      ? `Delete this category? ${count} link(s) will be moved to "Other".`
      : 'Delete this empty category?'
    if (confirm(msg)) deleteBookmarkCategory(catId)
  }

  function getCat(id) {
    return bookmarkCategories.find(c => c.id === id) || { label: 'Other', color: '#6B7280', emoji: '📌' }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Bookmarks Bar */}
      <BookmarksBar bookmarks={bookmarks} onTogglePin={toggleBookmarkPin} />

      {/* Extension card */}
      <div className="flex-shrink-0 px-6 pt-4">
        <ExtensionCard />
      </div>

      {/* Header */}
      <div className="flex-shrink-0 p-6 pb-0">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold text-notion-text dark:text-white">Links</h1>
            <p className="text-sm text-notion-muted dark:text-gray-400 mt-0.5">
              {bookmarks.length} saved · {bookmarks.filter(b => b.pinned).length} pinned
            </p>
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            <button
              onClick={() => setShowChromeImport(true)}
              className="flex items-center gap-2 px-3 py-2.5 bg-cream-200 dark:bg-gray-800 hover:bg-cream-300 dark:hover:bg-gray-700 border border-cream-400 dark:border-gray-700 text-notion-text dark:text-white rounded-xl font-medium text-sm transition-colors"
            >
              <Chrome size={15} />
              <span className="hidden sm:inline">Import Chrome</span>
            </button>
            <button
              onClick={() => setShowCatModal(true)}
              className="flex items-center gap-2 px-3 py-2.5 bg-cream-200 dark:bg-gray-800 hover:bg-cream-300 dark:hover:bg-gray-700 border border-cream-400 dark:border-gray-700 text-notion-text dark:text-white rounded-xl font-medium text-sm transition-colors"
            >
              <FolderPlus size={15} />
              <span className="hidden sm:inline">Category</span>
            </button>
            <button
              onClick={() => { setEditingLink(null); setShowLinkModal(true) }}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium text-sm transition-colors shadow-lg shadow-blue-500/20"
            >
              <Plus size={16} />
              Add Link
            </button>
          </div>
        </div>

        {/* Pinning hint */}
        {bookmarks.length > 0 && bookmarks.filter(b => b.pinned).length === 0 && (
          <div className="bg-white dark:bg-gray-900 border border-cream-300 dark:border-gray-800 rounded-xl px-4 py-3 mb-4 flex items-center gap-3">
            <Pin size={14} className="text-yellow-400 flex-shrink-0" />
            <p className="text-xs text-notion-muted dark:text-gray-400">
              <span className="text-notion-text/80 dark:text-gray-300 font-medium">Tip:</span> Hover over any link and click the pin icon to add it to your bookmarks bar at the top.
            </p>
          </div>
        )}

        {/* Search */}
        <div className="relative mb-4">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-notion-muted dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search links..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-gray-900 border border-cream-300 dark:border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-notion-text dark:text-white placeholder-notion-muted dark:placeholder-gray-500 text-sm focus:outline-none focus:border-cream-400 dark:focus:border-gray-700"
          />
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 pb-4 overflow-x-auto">
          <button
            onClick={() => setFilterCat('all')}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filterCat === 'all' ? 'bg-cream-300 dark:bg-gray-700 text-notion-text dark:text-white' : 'text-notion-muted dark:text-gray-400 hover:text-notion-text dark:hover:text-white'
            }`}
          >
            All
          </button>
          {bookmarkCategories.map(cat => {
            const count = bookmarks.filter(b => b.category === cat.id).length
            return (
              <button
                key={cat.id}
                onClick={() => setFilterCat(cat.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  filterCat === cat.id ? 'text-notion-text dark:text-white' : 'text-notion-muted dark:text-gray-400 hover:text-notion-text dark:hover:text-white'
                }`}
                style={filterCat === cat.id ? { background: cat.color + '30', color: cat.color } : {}}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
                {count > 0 && (
                  <span className="text-xs px-1.5 rounded-full" style={{ background: cat.color + '30', color: cat.color }}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Links list */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-notion-muted dark:text-gray-600">
            <Bookmark size={32} className="mb-3 opacity-40" />
            <p className="text-sm">{search ? 'No links match your search' : 'No links saved yet'}</p>
            <div className="flex gap-3 mt-3">
              <button onClick={() => setShowLinkModal(true)} className="text-xs text-blue-400 hover:text-blue-300">
                Add manually
              </button>
              <button onClick={() => setShowChromeImport(true)} className="text-xs text-blue-400 hover:text-blue-300">
                Import from Chrome
              </button>
            </div>
          </div>
        ) : grouped ? (
          <div className="space-y-6">
            {bookmarkCategories
              .filter(cat => grouped[cat.id]?.length > 0)
              .map(cat => (
                <div key={cat.id}>
                  <div className="flex items-center justify-between mb-2 group">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{cat.emoji}</span>
                      <h2 className="text-sm font-semibold" style={{ color: cat.color }}>{cat.label}</h2>
                      <span className="text-xs text-notion-muted dark:text-gray-600">{grouped[cat.id].length}</span>
                    </div>
                    {cat.id !== 'uncategorized' && (
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="p-1 rounded-lg hover:bg-red-500/10 text-cream-400 dark:text-gray-700 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete category"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    {grouped[cat.id].map(bm => (
                      <LinkCard
                        key={bm.id}
                        bookmark={bm}
                        category={cat}
                        onEdit={handleEditLink}
                        onDelete={deleteBookmark}
                        onTogglePin={toggleBookmarkPin}
                      />
                    ))}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="space-y-1.5">
            {filtered.map(bm => (
              <LinkCard
                key={bm.id}
                bookmark={bm}
                category={getCat(bm.category)}
                onEdit={handleEditLink}
                onDelete={deleteBookmark}
                onTogglePin={toggleBookmarkPin}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showLinkModal && (
        <LinkModal
          bookmark={editingLink}
          categories={bookmarkCategories}
          onSave={handleSaveLink}
          onClose={handleCloseLink}
        />
      )}
      {showCatModal && (
        <CategoryModal
          categories={bookmarkCategories}
          onSave={(data) => addBookmarkCategory(data)}
          onClose={() => setShowCatModal(false)}
        />
      )}
      {showChromeImport && (
        <ChromeImportModal
          existingUrls={existingUrls}
          bookmarkCategories={bookmarkCategories}
          onImport={importBookmarks}
          onClose={() => setShowChromeImport(false)}
        />
      )}
    </div>
  )
}
