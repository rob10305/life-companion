import { NextResponse } from 'next/server'

const GITHUB_API = 'https://api.github.com'

export async function GET(request) {
  const token = process.env.GITHUB_TOKEN
  if (!token) {
    return NextResponse.json(
      { error: 'GITHUB_TOKEN not configured. Add it to .env.local' },
      { status: 401 }
    )
  }

  const { searchParams } = new URL(request.url)
  const repo = searchParams.get('repo')

  if (!repo || !repo.includes('/')) {
    return NextResponse.json(
      { error: 'Missing or invalid repo parameter. Expected format: owner/name' },
      { status: 400 }
    )
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
  }

  try {
    const [repoRes, pkgRes, topicsRes] = await Promise.allSettled([
      fetch(`${GITHUB_API}/repos/${repo}`, { headers }),
      fetch(`${GITHUB_API}/repos/${repo}/contents/package.json`, { headers }),
      fetch(`${GITHUB_API}/repos/${repo}/topics`, {
        headers: { ...headers, Accept: 'application/vnd.github.mercy-preview+json' },
      }),
    ])

    // Repo metadata is required
    if (repoRes.status !== 'fulfilled' || !repoRes.value.ok) {
      const status = repoRes.value?.status || 502
      return NextResponse.json(
        { error: `Could not fetch repo: ${repo}` },
        { status }
      )
    }

    const repoData = await repoRes.value.json()

    // package.json is optional (not all repos have one)
    let packageJson = null
    if (pkgRes.status === 'fulfilled' && pkgRes.value.ok) {
      try {
        const pkgData = await pkgRes.value.json()
        const decoded = atob(pkgData.content.replace(/\n/g, ''))
        packageJson = JSON.parse(decoded)
      } catch {
        // Malformed package.json, skip
      }
    }

    // Topics are optional
    let topics = []
    if (topicsRes.status === 'fulfilled' && topicsRes.value.ok) {
      const topicsData = await topicsRes.value.json()
      topics = topicsData.names || []
    }

    return NextResponse.json({
      repo: {
        full_name: repoData.full_name,
        name: repoData.name,
        description: repoData.description || '',
        html_url: repoData.html_url,
        homepage: repoData.homepage || '',
        isPrivate: repoData.private,
        language: repoData.language || '',
        default_branch: repoData.default_branch,
        created_at: repoData.created_at,
        updated_at: repoData.updated_at,
        topics,
      },
      packageJson,
    })
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to connect to GitHub.' },
      { status: 502 }
    )
  }
}
