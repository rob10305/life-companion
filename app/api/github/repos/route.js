import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const GITHUB_API = 'https://api.github.com'

export async function GET(request) {
  const token = process.env.GITHUB_TOKEN
  if (!token) {
    return NextResponse.json(
      { error: 'GITHUB_TOKEN not configured. Add it to .env.local' },
      { status: 401 }
    )
  }

  try {
    // Fetch from /user/repos (authenticated user's repos)
    let allRepos = []
    let page = 1
    while (true) {
      const res = await fetch(
        `${GITHUB_API}/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator,organization_member&page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github+json',
          },
          cache: 'no-store',
        }
      )

      if (!res.ok) {
        const msg = res.status === 401
          ? 'GitHub token is invalid or expired. Update GITHUB_TOKEN in .env.local'
          : `GitHub API error: ${res.status}`
        return NextResponse.json({ error: msg }, { status: res.status })
      }

      const repos = await res.json()
      if (repos.length === 0) break
      allRepos = allRepos.concat(repos)
      if (repos.length < 100) break
      page++
    }

    // Also get the authenticated username and fetch via /users/:user/repos
    // as a fallback — some token scopes miss repos from /user/repos
    try {
      const userRes = await fetch(`${GITHUB_API}/user`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' },
        cache: 'no-store',
      })
      if (userRes.ok) {
        const user = await userRes.json()
        const knownIds = new Set(allRepos.map(r => r.id))
        let fallbackPage = 1
        while (true) {
          const fbRes = await fetch(
            `${GITHUB_API}/users/${user.login}/repos?per_page=100&sort=updated&page=${fallbackPage}`,
            {
              headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' },
              cache: 'no-store',
            }
          )
          if (!fbRes.ok) break
          const fbRepos = await fbRes.json()
          if (fbRepos.length === 0) break
          for (const r of fbRepos) {
            if (!knownIds.has(r.id)) {
              allRepos.push(r)
              knownIds.add(r.id)
            }
          }
          if (fbRepos.length < 100) break
          fallbackPage++
        }
      }
    } catch {
      // Fallback failed, continue with what we have
    }

    const simplified = allRepos.map(r => ({
      full_name: r.full_name,
      name: r.name,
      description: r.description || '',
      html_url: r.html_url,
      homepage: r.homepage || '',
      isPrivate: r.private,
      language: r.language || '',
      topics: r.topics || [],
      updated_at: r.updated_at,
    }))

    const response = NextResponse.json(simplified)
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    return response
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to connect to GitHub. Check your internet connection.' },
      { status: 502 }
    )
  }
}
