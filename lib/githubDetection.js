import { generateId, PROJECT_COLORS, PROJECT_EMOJIS } from './utils'

// Maps dependency names to tech stack labels and optional metadata
const DEPENDENCY_MAP = {
  // Frameworks
  next:                 { label: 'Next.js',       emoji: '🚀', color: '#000000' },
  react:                { label: 'React',         emoji: '🌐', color: '#3B82F6' },
  vue:                  { label: 'Vue.js',        emoji: '💚', color: '#10B981' },
  svelte:               { label: 'Svelte',        emoji: '🔥', color: '#F97316' },
  '@sveltejs/kit':      { label: 'SvelteKit',     emoji: '🔥', color: '#F97316' },
  angular:              { label: 'Angular',       emoji: '🅰️', color: '#EF4444' },
  '@angular/core':      { label: 'Angular',       emoji: '🅰️', color: '#EF4444' },
  express:              { label: 'Express',       emoji: '🛠️', color: '#6B7280' },
  fastify:              { label: 'Fastify',       emoji: '⚡', color: '#F59E0B' },

  // CSS / UI
  tailwindcss:          { label: 'Tailwind CSS' },
  'styled-components':  { label: 'Styled Components' },
  sass:                 { label: 'Sass' },
  '@mui/material':      { label: 'Material UI' },
  '@chakra-ui/react':   { label: 'Chakra UI' },

  // Languages / Build
  typescript:           { label: 'TypeScript',    emoji: '📘', color: '#3B82F6' },
  vite:                 { label: 'Vite' },
  webpack:              { label: 'Webpack' },

  // Databases / ORMs
  prisma:               { label: 'Prisma' },
  '@prisma/client':     { label: 'Prisma' },
  mongoose:             { label: 'MongoDB' },
  mongodb:              { label: 'MongoDB' },
  pg:                   { label: 'PostgreSQL' },
  mysql2:               { label: 'MySQL' },
  sequelize:            { label: 'Sequelize' },
  drizzle:              { label: 'Drizzle ORM' },
  'drizzle-orm':        { label: 'Drizzle ORM' },

  // Backend services
  '@supabase/supabase-js': { label: 'Supabase' },
  firebase:             { label: 'Firebase' },
  'firebase-admin':     { label: 'Firebase' },
  '@aws-sdk/client-s3': { label: 'AWS S3' },

  // Payments / AI / APIs
  stripe:               { label: 'Stripe' },
  openai:               { label: 'OpenAI' },
  '@anthropic-ai/sdk':  { label: 'Anthropic' },

  // Auth
  'next-auth':          { label: 'NextAuth.js' },
  '@auth/core':         { label: 'Auth.js' },
  passport:             { label: 'Passport.js' },
  jsonwebtoken:         { label: 'JWT Auth' },
  '@clerk/nextjs':      { label: 'Clerk Auth' },

  // Testing
  jest:                 { label: 'Jest' },
  vitest:               { label: 'Vitest' },
  '@testing-library/react': { label: 'Testing Library' },
  cypress:              { label: 'Cypress' },
  playwright:           { label: 'Playwright' },

  // CMS / Content
  '@sanity/client':     { label: 'Sanity CMS' },
  contentful:           { label: 'Contentful' },
  '@notionhq/client':   { label: 'Notion API' },
}

function titleCase(str) {
  return str
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

function detectTechStack(packageJson) {
  if (!packageJson) return []
  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  }
  const seen = new Set()
  const stack = []
  for (const dep of Object.keys(allDeps)) {
    const match = DEPENDENCY_MAP[dep]
    if (match && !seen.has(match.label)) {
      seen.add(match.label)
      stack.push(match)
    }
  }
  return stack
}

function inferHostingFromUrl(homepage) {
  if (!homepage) return null
  const lower = homepage.toLowerCase()
  if (lower.includes('.vercel.app') || lower.includes('vercel.app')) {
    return { platform: 'Vercel', dashboardBase: 'https://vercel.com/dashboard' }
  }
  if (lower.includes('.netlify.app') || lower.includes('netlify.app')) {
    return { platform: 'Netlify', dashboardBase: 'https://app.netlify.com' }
  }
  return null
}

export function detectProjectDetails(repoData, packageJson) {
  const techStack = detectTechStack(packageJson)

  // Pick emoji and color from the primary framework detection
  const primaryFramework = techStack.find(t => t.emoji)
  const suggestedEmoji = primaryFramework?.emoji || '📁'
  const suggestedColor = primaryFramework?.color || PROJECT_COLORS[0]

  // Build links
  const links = []

  // 1. Always add git link
  links.push({
    id: generateId('link'),
    label: 'GitHub Repository',
    url: repoData.html_url,
    type: 'git',
    note: repoData.isPrivate ? 'Private repo' : 'Public repo',
  })

  // 2. Live site from homepage
  if (repoData.homepage && repoData.homepage.startsWith('http')) {
    links.push({
      id: generateId('link'),
      label: 'Live Site',
      url: repoData.homepage,
      type: 'live',
      note: '',
    })
  }

  // 3. Hosting dashboard (inferred from homepage URL)
  const hosting = inferHostingFromUrl(repoData.homepage)
  if (hosting) {
    links.push({
      id: generateId('link'),
      label: `${hosting.platform} Dashboard`,
      url: hosting.dashboardBase,
      type: 'hosting',
      note: `Deployed on ${hosting.platform}`,
    })
  }

  // 4. If package.json has a docs script or we detect docs tools
  if (packageJson?.scripts?.docs || packageJson?.scripts?.storybook) {
    links.push({
      id: generateId('link'),
      label: 'Documentation',
      url: repoData.html_url + '#readme',
      type: 'docs',
      note: 'README / Docs',
    })
  }

  // Build notes
  const stackLabels = techStack.map(t => t.label)
  const noteParts = []
  if (repoData.language) noteParts.push(`Primary language: ${repoData.language}`)
  if (stackLabels.length > 0) noteParts.push(`Tech stack: ${stackLabels.join(', ')}`)
  if (repoData.isPrivate) noteParts.push('Private repository')
  if (repoData.topics?.length > 0) noteParts.push(`Topics: ${repoData.topics.join(', ')}`)
  const notes = noteParts.join('\n') || `Imported from GitHub: ${repoData.full_name}`

  return {
    name: titleCase(repoData.name),
    description: repoData.description || `${repoData.language || 'Code'} project from GitHub`,
    suggestedEmoji,
    suggestedColor,
    links,
    techStack: stackLabels,
    notes,
  }
}
