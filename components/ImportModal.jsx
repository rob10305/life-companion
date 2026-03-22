'use client'
import { useState, useEffect } from 'react'
import {
  X, Plus, Search, Loader2, AlertTriangle, GitBranch, Lock, Globe2,
  ExternalLink, Trash2, ChevronLeft, RefreshCw, Check, Square, CheckSquare
} from 'lucide-react'
import { useData } from '../lib/DataContext'
import { detectProjectDetails } from '../lib/githubDetection'
import { generateId, LINK_TYPES, PROJECT_COLORS, PROJECT_EMOJIS } from '../lib/utils'

// How long ago in human terms
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 30) return `${days}d ago`
  if (days < 365) return `${Math.floor(days / 30)}mo ago`
  return `${Math.floor(days / 365)}y ago`
}

export default function ImportModal({ onClose }) {
  const { addProject, projects } = useData()

  // State machine: 'loading-repos' | 'select' | 'loading-details' | 'preview' | 'importing' | 'error'
  const [phase, setPhase] = useState('loading-repos')
  const [repos, setRepos] = useState([])
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [selectedRepo, setSelectedRepo] = useState(null)
  const [selected, setSelected] = useState(new Set())
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 })

  // Preview form state (populated after detection)
  const [form, setForm] = useState(null)
  const [techStack, setTechStack] = useState([])
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  // Check if a repo is already imported by matching its GitHub URL against project links
  function isRepoImported(repo) {
    return projects.some(p =>
      p.links?.some(l => l.type === 'git' && l.url === repo.html_url)
    )
  }

  // Always fetch fresh repos on mount so new repos appear
  useEffect(() => {
    fetchRepos()
  }, [])

  async function fetchRepos() {
    setPhase('loading-repos')
    setError('')
    try {
      // Always cache-bust to pick up newly created repos
      const res = await fetch('/api/github/repos?t=' + Date.now())
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to load repos')
        setPhase('error')
        return
      }
      setRepos(data)
      setSelected(new Set())
      setPhase('select')
    } catch {
      setError('Network error. Check your connection.')
      setPhase('error')
    }
  }

  function toggleSelect(repoFullName) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(repoFullName)) {
        next.delete(repoFullName)
      } else {
        next.add(repoFullName)
      }
      return next
    })
  }

  function selectAllNew() {
    const newRepoNames = repos.filter(r => !isRepoImported(r)).map(r => r.full_name)
    setSelected(new Set(newRepoNames))
  }

  function deselectAll() {
    setSelected(new Set())
  }

  async function handleImportSelected() {
    const toImport = repos.filter(r => selected.has(r.full_name))
    if (toImport.length === 0) return
    setPhase('importing')
    setImportProgress({ current: 0, total: toImport.length })
    for (let i = 0; i < toImport.length; i++) {
      setImportProgress({ current: i + 1, total: toImport.length })
      try {
        const res = await fetch(`/api/github/repo-details?repo=${encodeURIComponent(toImport[i].full_name)}`)
        const data = await res.json()
        if (res.ok) {
          const detected = detectProjectDetails(data.repo, data.packageJson)
          addProject({
            name: detected.name,
            description: detected.description,
            emoji: detected.suggestedEmoji,
            color: detected.suggestedColor,
            status: 'active',
            notes: detected.notes,
            links: detected.links,
          })
        }
      } catch {
        // Skip failed repos silently, continue with the rest
      }
    }
    onClose()
  }

  async function handleSelectRepo(repo) {
    setSelectedRepo(repo)
    setPhase('loading-details')
    setError('')
    try {
      const res = await fetch(`/api/github/repo-details?repo=${encodeURIComponent(repo.full_name)}`)
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to load repo details')
        setPhase('error')
        return
      }
      const detected = detectProjectDetails(data.repo, data.packageJson)
      setForm({
        name: detected.name,
        description: detected.description,
        emoji: detected.suggestedEmoji,
        color: detected.suggestedColor,
        status: 'active',
        notes: detected.notes,
        links: detected.links,
      })
      setTechStack(detected.techStack)
      setPhase('preview')
    } catch {
      setError('Failed to analyze repository.')
      setPhase('error')
    }
  }

  function addLink() {
    setForm(f => ({
      ...f,
      links: [...f.links, { id: generateId('link'), label: '', url: '', type: 'custom', note: '' }],
    }))
  }

  function updateLink(id, field, value) {
    setForm(f => ({
      ...f,
      links: f.links.map(l => l.id === id ? { ...l, [field]: value } : l),
    }))
  }

  function removeLink(id) {
    setForm(f => ({ ...f, links: f.links.filter(l => l.id !== id) }))
  }

  function handleImportSingle() {
    if (!form || !form.name.trim()) return
    addProject(form)
    onClose()
  }

  function goBack() {
    setPhase('select')
    setForm(null)
    setTechStack([])
    setSelectedRepo(null)
  }

  const filteredRepos = repos.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    (r.description && r.description.toLowerCase().includes(search.toLowerCase()))
  )

  const newCount = repos.filter(r => !isRepoImported(r)).length

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 border border-cream-300 dark:border-gray-700 rounded-2xl w-full max-w-xl shadow-2xl my-4">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-cream-300 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            {phase === 'preview' && (
              <button onClick={goBack} className="p-1.5 rounded-lg hover:bg-cream-200 dark:hover:bg-gray-800 text-notion-muted dark:text-gray-400 hover:text-notion-text dark:hover:text-white mr-1">
                <ChevronLeft size={18} />
              </button>
            )}
            <GitBranch size={18} className="text-blue-400" />
            <h2 className="text-lg font-semibold">
              {phase === 'preview' ? 'Import Preview' : 'Import from GitHub'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-cream-200 dark:hover:bg-gray-800 text-notion-muted dark:text-gray-400 hover:text-notion-text dark:hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Loading repos */}
        {phase === 'loading-repos' && (
          <div className="flex flex-col items-center justify-center py-16 text-notion-muted dark:text-gray-400">
            <Loader2 size={28} className="animate-spin text-blue-400 mb-3" />
            <p className="text-sm">Loading your repositories...</p>
          </div>
        )}

        {/* Error */}
        {phase === 'error' && (
          <div className="p-6">
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
              <AlertTriangle size={24} className="mx-auto text-red-400 mb-2" />
              <p className="text-sm text-red-300 mb-3">{error}</p>
              <button
                onClick={selectedRepo ? () => handleSelectRepo(selectedRepo) : () => fetchRepos()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-cream-200 dark:bg-gray-800 hover:bg-cream-300 dark:hover:bg-gray-700 text-notion-text dark:text-white rounded-xl text-sm transition-colors"
              >
                <RefreshCw size={14} /> Try again
              </button>
            </div>
          </div>
        )}

        {/* Repo selection with checkboxes */}
        {phase === 'select' && (
          <div className="p-5">
            {/* Search + refresh */}
            <div className="flex gap-2 mb-3">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-notion-muted dark:text-gray-500" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search repositories..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-cream-200 dark:bg-gray-800 border border-cream-400 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-notion-text dark:text-white placeholder-notion-muted dark:placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <button
                onClick={() => fetchRepos()}
                title="Refresh repo list"
                className="p-2.5 rounded-xl border border-cream-400 dark:border-gray-700 hover:bg-cream-200 dark:hover:bg-gray-800 text-notion-muted dark:text-gray-400 hover:text-notion-text dark:hover:text-white transition-colors"
              >
                <RefreshCw size={15} />
              </button>
            </div>

            {/* Selection actions bar */}
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-3">
                <span className="text-xs text-notion-muted dark:text-gray-400">
                  {repos.length} repos &middot; {newCount} available
                </span>
                {newCount > 0 && (
                  <button
                    onClick={selected.size === newCount ? deselectAll : selectAllNew}
                    className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    {selected.size === newCount ? 'Deselect all' : 'Select all new'}
                  </button>
                )}
              </div>
              {selected.size > 0 && (
                <span className="text-xs font-medium text-blue-400">
                  {selected.size} selected
                </span>
              )}
            </div>

            {/* Repo list */}
            <div className="max-h-80 overflow-y-auto space-y-1 -mx-1 px-1">
              {filteredRepos.length === 0 ? (
                <p className="text-center text-notion-muted dark:text-gray-600 text-sm py-8">
                  {search ? 'No repos match your search' : 'No repositories found'}
                </p>
              ) : (
                filteredRepos.map(repo => {
                  const imported = isRepoImported(repo)
                  const checked = selected.has(repo.full_name)
                  return (
                    <div
                      key={repo.full_name}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all group ${
                        imported
                          ? 'opacity-50 cursor-default border-transparent'
                          : checked
                            ? 'border-blue-500/30 bg-blue-500/5 dark:bg-blue-500/10'
                            : 'border-transparent hover:bg-cream-200 dark:hover:bg-gray-800 hover:border-cream-400 dark:hover:border-gray-700 cursor-pointer'
                      }`}
                    >
                      {/* Checkbox */}
                      {imported ? (
                        <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                          <Check size={14} className="text-green-400" />
                        </div>
                      ) : (
                        <button
                          onClick={() => toggleSelect(repo.full_name)}
                          className="flex-shrink-0 w-5 h-5 flex items-center justify-center"
                        >
                          {checked ? (
                            <CheckSquare size={16} className="text-blue-400" />
                          ) : (
                            <Square size={16} className="text-notion-muted dark:text-gray-600 group-hover:text-notion-text dark:group-hover:text-gray-400 transition-colors" />
                          )}
                        </button>
                      )}

                      {/* Repo info — clicking opens preview for single import */}
                      <button
                        onClick={() => !imported && handleSelectRepo(repo)}
                        disabled={imported}
                        className="flex-1 min-w-0 text-left"
                      >
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium truncate transition-colors ${
                            imported
                              ? 'text-notion-muted dark:text-gray-500'
                              : 'text-notion-text dark:text-white group-hover:text-blue-400 dark:group-hover:text-blue-300'
                          }`}>
                            {repo.name}
                          </span>
                          {repo.isPrivate ? (
                            <Lock size={11} className="text-yellow-500 flex-shrink-0" />
                          ) : (
                            <Globe2 size={11} className="text-notion-muted dark:text-gray-500 flex-shrink-0" />
                          )}
                          {imported && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/15 text-green-400 border border-green-500/20 font-medium flex-shrink-0">
                              Imported
                            </span>
                          )}
                        </div>
                        {repo.description && (
                          <p className="text-xs text-notion-muted dark:text-gray-500 truncate mt-0.5">{repo.description}</p>
                        )}
                      </button>

                      {/* Meta */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {repo.language && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-cream-200 dark:bg-gray-800 text-notion-muted dark:text-gray-400">
                            {repo.language}
                          </span>
                        )}
                        <span className="text-xs text-notion-muted dark:text-gray-600 hidden sm:inline">
                          {timeAgo(repo.updated_at)}
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Import selected button — sticky at bottom */}
            {selected.size > 0 && (
              <div className="mt-4 pt-4 border-t border-cream-300 dark:border-gray-800">
                <button
                  onClick={handleImportSelected}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                >
                  <Plus size={15} />
                  Import {selected.size} {selected.size === 1 ? 'project' : 'projects'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Importing selected repos */}
        {phase === 'importing' && (
          <div className="flex flex-col items-center justify-center py-16 text-notion-muted dark:text-gray-400">
            <Loader2 size={28} className="animate-spin text-blue-400 mb-3" />
            <p className="text-sm">
              Importing repo {importProgress.current} of {importProgress.total}...
            </p>
            <div className="w-48 bg-cream-300 dark:bg-gray-800 rounded-full h-1.5 mt-3">
              <div
                className="bg-blue-400 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Loading details */}
        {phase === 'loading-details' && (
          <div className="flex flex-col items-center justify-center py-16 text-notion-muted dark:text-gray-400">
            <Loader2 size={28} className="animate-spin text-blue-400 mb-3" />
            <p className="text-sm">Analyzing <span className="text-notion-text dark:text-white font-medium">{selectedRepo?.name}</span>...</p>
            <p className="text-xs text-notion-muted dark:text-gray-600 mt-1">Checking package.json, detecting services...</p>
          </div>
        )}

        {/* Preview / Edit single repo */}
        {phase === 'preview' && form && (
          <div className="p-5 space-y-4">
            {/* Name + Emoji */}
            <div className="flex gap-3">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(v => !v)}
                  className="w-12 h-12 text-2xl flex items-center justify-center bg-cream-200 dark:bg-gray-800 border border-cream-400 dark:border-gray-700 rounded-xl hover:border-cream-400 dark:hover:border-gray-500 transition-colors"
                >
                  {form.emoji}
                </button>
                {showEmojiPicker && (
                  <div className="absolute top-full left-0 mt-2 z-20 bg-cream-200 dark:bg-gray-800 border border-cream-400 dark:border-gray-700 rounded-xl p-2 grid grid-cols-8 gap-1 shadow-xl">
                    {PROJECT_EMOJIS.map(e => (
                      <button
                        key={e}
                        type="button"
                        onClick={() => { setForm(f => ({ ...f, emoji: e })); setShowEmojiPicker(false) }}
                        className={`w-8 h-8 text-lg flex items-center justify-center rounded-lg hover:bg-cream-300 dark:hover:bg-gray-700 ${form.emoji === e ? 'bg-cream-300 dark:bg-gray-600' : ''}`}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="flex-1 bg-cream-200 dark:bg-gray-800 border border-cream-400 dark:border-gray-700 rounded-xl px-4 py-3 text-notion-text dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Color picker */}
            <div>
              <label className="block text-xs text-notion-muted dark:text-gray-400 mb-2">Color</label>
              <div className="flex gap-2 flex-wrap">
                {PROJECT_COLORS.map(c => (
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

            {/* Description */}
            <div>
              <label className="block text-xs text-notion-muted dark:text-gray-400 mb-1.5">Description</label>
              <input
                type="text"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full bg-cream-200 dark:bg-gray-800 border border-cream-400 dark:border-gray-700 rounded-xl px-3 py-2.5 text-notion-text dark:text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Tech stack badges */}
            {techStack.length > 0 && (
              <div>
                <label className="block text-xs text-notion-muted dark:text-gray-400 mb-2">Detected Tech Stack</label>
                <div className="flex gap-2 flex-wrap">
                  {techStack.map(t => (
                    <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/20 font-medium">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Links */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-notion-muted dark:text-gray-400">
                  Detected Links <span className="text-notion-muted dark:text-gray-600">({form.links.length})</span>
                </label>
                <button
                  type="button"
                  onClick={addLink}
                  className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                >
                  <Plus size={13} /> Add link
                </button>
              </div>
              <div className="space-y-2">
                {form.links.map(link => (
                  <div key={link.id} className="bg-cream-200 dark:bg-gray-800 rounded-xl p-3 space-y-2">
                    <div className="flex gap-2">
                      <select
                        value={link.type}
                        onChange={e => updateLink(link.id, 'type', e.target.value)}
                        className="bg-cream-300 dark:bg-gray-700 border border-cream-400 dark:border-gray-600 rounded-lg px-2 py-1.5 text-notion-text dark:text-white text-xs focus:outline-none focus:border-blue-500 flex-shrink-0"
                      >
                        {Object.entries(LINK_TYPES).map(([key, val]) => (
                          <option key={key} value={key}>{val.label}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="Label"
                        value={link.label}
                        onChange={e => updateLink(link.id, 'label', e.target.value)}
                        className="flex-1 bg-cream-300 dark:bg-gray-700 border border-cream-400 dark:border-gray-600 rounded-lg px-2 py-1.5 text-notion-text dark:text-white placeholder-notion-muted dark:placeholder-gray-500 text-xs focus:outline-none focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeLink(link.id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/20 text-notion-muted dark:text-gray-500 hover:text-red-400 transition-colors flex-shrink-0"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={link.url}
                      onChange={e => updateLink(link.id, 'url', e.target.value)}
                      className="w-full bg-cream-300 dark:bg-gray-700 border border-cream-400 dark:border-gray-600 rounded-lg px-2 py-1.5 text-notion-text dark:text-white placeholder-notion-muted dark:placeholder-gray-500 text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs text-notion-muted dark:text-gray-400 mb-1.5">Notes</label>
              <textarea
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                rows={3}
                className="w-full bg-cream-200 dark:bg-gray-800 border border-cream-400 dark:border-gray-700 rounded-xl px-3 py-2.5 text-notion-text dark:text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={goBack}
                className="flex-1 py-2.5 rounded-xl border border-cream-400 dark:border-gray-700 text-notion-muted dark:text-gray-400 hover:text-notion-text dark:hover:text-white hover:border-cream-400 dark:hover:border-gray-600 transition-colors text-sm font-medium"
              >
                Back
              </button>
              <button
                onClick={handleImportSingle}
                className="flex-1 py-2.5 rounded-xl font-medium transition-colors text-sm text-white flex items-center justify-center gap-2"
                style={{ background: form.color }}
              >
                <Plus size={15} /> Import Project
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
