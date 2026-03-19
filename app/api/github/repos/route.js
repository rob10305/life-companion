import { NextResponse } from 'next/server'

const GITHUB_API = 'https://api.github.com'

export async function GET() {
  const token = process.env.GITHUB_TOKEN
  if (!token) {
    return NextResponse.json(
      { error: 'GITHUB_TOKEN not configured. Add it to .env.local' },
      { status: 401 }
    )
  }

  try {
    const res = await fetch(
      `${GITHUB_API}/user/repos?per_page=100&sort=updated&affiliation=owner`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
        },
        next: { revalidate: 60 },
      }
    )

    if (!res.ok) {
      const msg = res.status === 401
        ? 'GitHub token is invalid or expired. Update GITHUB_TOKEN in .env.local'
        : `GitHub API error: ${res.status}`
      return NextResponse.json({ error: msg }, { status: res.status })
    }

    const repos = await res.json()

    const simplified = repos.map(r => ({
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

    return NextResponse.json(simplified)
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to connect to GitHub. Check your internet connection.' },
      { status: 502 }
    )
  }
}
