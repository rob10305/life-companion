import { NextResponse } from 'next/server'
import { readFile, readdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import os from 'os'

// Find all Chrome bookmark files: profiles + snapshots
async function getChromeBookmarkPaths() {
  const home = os.homedir()
  const base = path.join(home, 'AppData', 'Local', 'Google', 'Chrome', 'User Data')
  const paths = []

  if (!existsSync(base)) return paths

  // Check Default and numbered profiles
  const profiles = ['Default', 'Profile 1', 'Profile 2', 'Profile 3', 'Profile 4', 'Profile 5']
  for (const profile of profiles) {
    const bookmarksFile = path.join(base, profile, 'Bookmarks')
    if (existsSync(bookmarksFile)) {
      paths.push({ profile, path: bookmarksFile })
    }
  }

  // Also check Chrome's snapshot backups (often have bookmarks even when live file is empty)
  const snapshotsDir = path.join(base, 'Snapshots')
  if (existsSync(snapshotsDir)) {
    try {
      const snapshots = await readdir(snapshotsDir)
      // Sort by version to get latest first
      const sorted = snapshots.sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))
      for (const snapshot of sorted) {
        for (const profile of profiles) {
          const bookmarksFile = path.join(snapshotsDir, snapshot, profile, 'Bookmarks')
          if (existsSync(bookmarksFile)) {
            paths.push({ profile: `Snapshot ${snapshot} / ${profile}`, path: bookmarksFile })
          }
        }
        // Only check the latest snapshot to avoid duplicates
        break
      }
    } catch { /* ignore snapshot read errors */ }
  }

  // Also check Microsoft Edge (same format)
  const edgeBase = path.join(home, 'AppData', 'Local', 'Microsoft', 'Edge', 'User Data')
  if (existsSync(edgeBase)) {
    for (const profile of profiles) {
      const bookmarksFile = path.join(edgeBase, profile, 'Bookmarks')
      if (existsSync(bookmarksFile)) {
        paths.push({ profile: `Edge / ${profile}`, path: bookmarksFile })
      }
    }
  }

  return paths
}

// Recursively flatten Chrome's nested bookmark tree
function flattenBookmarks(node, folderPath = '') {
  const results = []
  if (!node) return results

  const currentPath = folderPath ? `${folderPath} / ${node.name}` : node.name

  if (node.type === 'url') {
    results.push({
      title: node.name || 'Untitled',
      url: node.url,
      folder: folderPath,
      dateAdded: node.date_added
        ? new Date(Number(node.date_added) / 1000 - 11644473600000).toISOString()
        : null,
    })
  }

  if (node.children) {
    for (const child of node.children) {
      results.push(...flattenBookmarks(child, currentPath))
    }
  }
  return results
}

function extractBookmarks(data, profileLabel) {
  const roots = data.roots || {}
  return [
    ...flattenBookmarks(roots.bookmark_bar, 'Bookmarks Bar'),
    ...flattenBookmarks(roots.other, 'Other Bookmarks'),
    ...flattenBookmarks(roots.synced, 'Mobile Bookmarks'),
  ].map(b => ({ ...b, profile: profileLabel }))
}

export async function GET() {
  try {
    const profilePaths = await getChromeBookmarkPaths()

    if (profilePaths.length === 0) {
      return NextResponse.json({
        error: 'No Chrome or Edge bookmarks files found. Make sure a Chromium browser is installed.',
        bookmarks: [],
        profiles: [],
      }, { status: 404 })
    }

    const allBookmarks = []
    const profileResults = []

    for (const { profile, path: filePath } of profilePaths) {
      try {
        const raw = await readFile(filePath, 'utf-8')
        const data = JSON.parse(raw)
        const bookmarks = extractBookmarks(data, profile)
        profileResults.push({ profile, count: bookmarks.length })
        allBookmarks.push(...bookmarks)
      } catch {
        profileResults.push({ profile, count: 0, error: 'Could not read' })
      }
    }

    // Deduplicate by URL (keep first occurrence)
    const seen = new Set()
    const unique = allBookmarks.filter(b => {
      if (seen.has(b.url)) return false
      seen.add(b.url)
      return true
    })

    if (unique.length === 0) {
      return NextResponse.json({
        error: 'Found bookmark files but they contain no bookmarks. Try the file upload option instead.',
        bookmarks: [],
        profiles: profileResults,
      }, { status: 404 })
    }

    return NextResponse.json({
      bookmarks: unique,
      profiles: profileResults,
      total: unique.length,
    })
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to read bookmarks files.', bookmarks: [], profiles: [] },
      { status: 500 }
    )
  }
}
