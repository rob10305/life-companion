'use client'
import { useState, useEffect } from 'react'
import {
  X, Plus, Search, Loader2, AlertTriangle, GitBranch, Lock, Globe2,
  ExternalLink, Trash2, ChevronLeft, RefreshCw
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
  const { addProject } = useData()

  // State machine: 'loading-repos' | 'select' | 'loading-details' | 'preview' | 'error'
  const [phase, setPhase] = useState('loading-repos')
  const [repos, setRepos] = useState([])
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [selectedRepo, setSelectedRepo] = useState(null)

  // Preview form state (populated after detection)
  const [form, setForm] = useState(null)
  const [techStack, setTechStack] = useState([])
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  // Fetch repos on mount
  useEffect(() => {
    fetchRepos()
  }, [])

  async function fetchRepos() {
    setPhase('loading-repos')
    setError('')
    try {
      const res = await fetch('/api/github/repos')
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to load repos')
        setPhase('error')
        return
      }
      setRepos(data)
      setPhase('select')
    } catch {
      setError('Network error. Check your connection.')
      setPhase('error')
    }
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

  function handleImport() {
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

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-xl shadow-2xl my-4">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800 sticky top-0 bg-gray-900 rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            {phase === 'preview' && (
              <button onClick={goBack} className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white mr-1">
                <ChevronLeft size={18} />
              </button>
            )}
            <GitBranch size={18} className="text-blue-400" />
            <h2 className="text-lg font-semibold">
              {phase === 'preview' ? 'Import Preview' : 'Import from GitHub'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Loading repos */}
        {phase === 'loading-repos' && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
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
                onClick={selectedRepo ? () => handleSelectRepo(selectedRepo) : fetchRepos}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-sm transition-colors"
              >
                <RefreshCw size={14} /> Try again
              </button>
            </div>
          </div>
        )}

        {/* Repo selection */}
        {phase === 'select' && (
          <div className="p-5">
            {/* Search */}
            <div className="relative mb-3">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                autoFocus
                type="text"
                placeholder="Search repositories..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Repo list */}
            <div className="max-h-80 overflow-y-auto space-y-1.5 -mx-1 px-1">
              {filteredRepos.length === 0 ? (
                <p className="text-center text-gray-600 text-sm py-8">
                  {search ? 'No repos match your search' : 'No repositories found'}
                </p>
              ) : (
                filteredRepos.map(repo => (
                  <button
                    key={repo.full_name}
                    onClick={() => handleSelectRepo(repo)}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl border border-transparent hover:bg-gray-800 hover:border-gray-700 text-left transition-all group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white truncate group-hover:text-blue-300 transition-colors">
                          {repo.name}
                        </span>
                        {repo.isPrivate ? (
                          <Lock size={11} className="text-yellow-500 flex-shrink-0" />
                        ) : (
                          <Globe2 size={11} className="text-gray-500 flex-shrink-0" />
                        )}
                      </div>
                      {repo.description && (
                        <p className="text-xs text-gray-500 truncate mt-0.5">{repo.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {repo.language && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">
                          {repo.language}
                        </span>
                      )}
                      <span className="text-xs text-gray-600">
                        {timeAgo(repo.updated_at)}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Loading details */}
        {phase === 'loading-details' && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Loader2 size={28} className="animate-spin text-blue-400 mb-3" />
            <p className="text-sm">Analyzing <span className="text-white font-medium">{selectedRepo?.name}</span>...</p>
            <p className="text-xs text-gray-600 mt-1">Checking package.json, detecting services...</p>
          </div>
        )}

        {/* Preview / Edit */}
        {phase === 'preview' && form && (
          <div className="p-5 space-y-4">
            {/* Name + Emoji */}
            <div className="flex gap-3">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(v => !v)}
                  className="w-12 h-12 text-2xl flex items-center justify-center bg-gray-800 border border-gray-700 rounded-xl hover:border-gray-500 transition-colors"
                >
                  {form.emoji}
                </button>
                {showEmojiPicker && (
                  <div className="absolute top-full left-0 mt-2 z-20 bg-gray-800 border border-gray-700 rounded-xl p-2 grid grid-cols-8 gap-1 shadow-xl">
                    {PROJECT_EMOJIS.map(e => (
                      <button
                        key={e}
                        type="button"
                        onClick={() => { setForm(f => ({ ...f, emoji: e })); setShowEmojiPicker(false) }}
                        className={`w-8 h-8 text-lg flex items-center justify-center rounded-lg hover:bg-gray-700 ${form.emoji === e ? 'bg-gray-600' : ''}`}
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
                className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Color picker */}
            <div>
              <label className="block text-xs text-gray-400 mb-2">Color</label>
              <div className="flex gap-2 flex-wrap">
                {PROJECT_COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, color: c }))}
                    className={`w-7 h-7 rounded-full transition-all ${form.color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900 scale-110' : 'hover:scale-110'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Description</label>
              <input
                type="text"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Tech stack badges */}
            {techStack.length > 0 && (
              <div>
                <label className="block text-xs text-gray-400 mb-2">Detected Tech Stack</label>
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
                <label className="text-xs text-gray-400">
                  Detected Links <span className="text-gray-600">({form.links.length})</span>
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
                  <div key={link.id} className="bg-gray-800 rounded-xl p-3 space-y-2">
                    <div className="flex gap-2">
                      <select
                        value={link.type}
                        onChange={e => updateLink(link.id, 'type', e.target.value)}
                        className="bg-gray-700 border border-gray-600 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500 flex-shrink-0"
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
                        className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-2 py-1.5 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeLink(link.id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors flex-shrink-0"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={link.url}
                      onChange={e => updateLink(link.id, 'url', e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-2 py-1.5 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Notes</label>
              <textarea
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                rows={3}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={goBack}
                className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 transition-colors text-sm font-medium"
              >
                Back
              </button>
              <button
                onClick={handleImport}
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
