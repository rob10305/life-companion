import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import os from 'os'

// Chrome bookmarks file locations by profile
function getChromeBookmarkPaths() {
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

export async function GET() {
  try {
    const profilePaths = getChromeBookmarkPaths()

    if (profilePaths.length === 0) {
      return NextResponse.json({
        error: 'Chrome bookmarks file not found. Make sure Chrome is installed.',
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
        const roots = data.roots || {}

        const bookmarks = [
          ...flattenBookmarks(roots.bookmark_bar, 'Bookmarks Bar'),
          ...flattenBookmarks(roots.other, 'Other Bookmarks'),
          ...flattenBookmarks(roots.synced, 'Mobile Bookmarks'),
        ]

        profileResults.push({ profile, count: bookmarks.length })
        allBookmarks.push(...bookmarks.map(b => ({ ...b, profile })))
      } catch {
        profileResults.push({ profile, count: 0, error: 'Could not read' })
      }
    }

    // Deduplicate by URL
    const seen = new Set()
    const unique = allBookmarks.filter(b => {
      if (seen.has(b.url)) return false
      seen.add(b.url)
      return true
    })

    return NextResponse.json({
      bookmarks: unique,
      profiles: profileResults,
      total: unique.length,
    })
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to read Chrome bookmarks.', bookmarks: [], profiles: [] },
      { status: 500 }
    )
  }
}
