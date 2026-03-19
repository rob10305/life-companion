export function generateId(prefix = 'id') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function formatDate(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((d - now) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff === -1) return 'Yesterday'
  if (diff < 0) return `${Math.abs(diff)}d overdue`
  if (diff < 7) return `In ${diff}d`
  return d.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })
}

export function isOverdue(dateStr) {
  if (!dateStr) return false
  return new Date(dateStr) < new Date(new Date().toDateString())
}

export const LINK_TYPES = {
  files:   { label: 'Files / Folder',   icon: 'Folder',       badge: 'badge-files' },
  hosting: { label: 'Hosting / Deploy', icon: 'Globe',        badge: 'badge-hosting' },
  git:     { label: 'Git Repository',   icon: 'GitBranch',    badge: 'badge-git' },
  live:    { label: 'Live Site',        icon: 'ExternalLink', badge: 'badge-live' },
  docs:    { label: 'Documentation',    icon: 'FileText',     badge: 'badge-docs' },
  figma:   { label: 'Design / Figma',   icon: 'Palette',      badge: 'badge-custom' },
  api:     { label: 'API / Backend',    icon: 'Code2',        badge: 'badge-custom' },
  custom:  { label: 'Custom Link',      icon: 'Link',         badge: 'badge-custom' },
}

export const PROJECT_COLORS = [
  '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B',
  '#EC4899', '#06B6D4', '#EF4444', '#84CC16',
  '#F97316', '#14B8A6', '#6366F1', '#A78BFA',
]

export const PROJECT_EMOJIS = [
  '🌐', '🚀', '🛠️', '📱', '💡', '🎨', '📊', '🔧',
  '💼', '🏆', '⚡', '🎯', '📦', '🔐', '🤖', '🌟',
]

export const PRIORITY_CONFIG = {
  high:   { label: 'High',   color: 'text-red-400',    dot: 'bg-red-400' },
  medium: { label: 'Medium', color: 'text-yellow-400', dot: 'bg-yellow-400' },
  low:    { label: 'Low',    color: 'text-gray-400',   dot: 'bg-gray-500' },
}
