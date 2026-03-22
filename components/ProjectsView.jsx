'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Plus, Search, FolderKanban, GitBranch, RefreshCw, Loader2 } from 'lucide-react'
import { useData } from '../lib/DataContext'
import { detectProjectDetails } from '../lib/githubDetection'
import ProjectCard from './ProjectCard'
import ProjectModal from './ProjectModal'
import ImportModal from './ImportModal'

export default function ProjectsView() {
  const { projects, addProject, hydrated } = useData()
  const [showModal, setShowModal] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('active')
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState(null)
  const hasSynced = useRef(false)

  // Use a ref to always have the latest projects in async callbacks
  const projectsRef = useRef(projects)
  useEffect(() => { projectsRef.current = projects }, [projects])

  // Auto-sync once data has hydrated from Supabase/localStorage
  useEffect(() => {
    if (hydrated && !hasSynced.current) {
      hasSynced.current = true
      handleSync(true)
    }
  }, [hydrated])

  const handleSync = useCallback(async function handleSync(silent = false) {
    setSyncing(true)
    if (!silent) setSyncResult(null)
    try {
      // Cache-bust to ensure we always get fresh data from GitHub
      const res = await fetch('/api/github/repos?t=' + Date.now())
      const repos = await res.json()
      if (!res.ok) {
        if (!silent) setSyncResult({ error: repos.error || 'Failed to fetch repos' })
        setSyncing(false)
        return
      }
      // Find repos not yet imported — use ref for latest projects
      const currentProjects = projectsRef.current
      const existingUrls = new Set(
        currentProjects.flatMap(p => (p.links || []).filter(l => l.type === 'git').map(l => l.url))
      )
      const newRepos = repos.filter(r => !existingUrls.has(r.html_url))
      if (newRepos.length === 0) {
        if (!silent) setSyncResult({ added: 0 })
        setSyncing(false)
        return
      }
      // Auto-import each new repo
      let added = 0
      for (const repo of newRepos) {
        try {
          const detailRes = await fetch(`/api/github/repo-details?repo=${encodeURIComponent(repo.full_name)}`)
          const data = await detailRes.json()
          if (detailRes.ok) {
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
            added++
          }
        } catch {
          // Skip failed repos
        }
      }
      setSyncResult({ added })
    } catch {
      if (!silent) setSyncResult({ error: 'Network error' })
    }
    setSyncing(false)
    // Clear sync result after 4 seconds
    setTimeout(() => setSyncResult(null), 4000)
  }, [addProject])

  const filtered = projects.filter(p => {
    if (filterStatus !== 'all' && p.status !== filterStatus) return false
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  function handleEdit(project) {
    setEditingProject(project)
    setShowModal(true)
  }

  function handleClose() {
    setShowModal(false)
    setEditingProject(null)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 p-6 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-notion-text dark:text-white">Projects</h1>
            <p className="text-sm text-notion-muted dark:text-gray-400 mt-0.5">
              {projects.filter(p => p.status === 'active').length} active
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleSync(false)}
              disabled={syncing}
              title="Sync new repos from GitHub"
              className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-cream-200 dark:bg-gray-800 hover:bg-cream-300 dark:hover:bg-gray-700 border border-cream-400 dark:border-gray-700 text-notion-text dark:text-white rounded-xl font-medium text-xs sm:text-sm transition-colors disabled:opacity-50"
            >
              {syncing ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
              <span className="hidden sm:inline">Sync</span>
            </button>
            <button
              onClick={() => setShowImport(true)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-cream-200 dark:bg-gray-800 hover:bg-cream-300 dark:hover:bg-gray-700 border border-cream-400 dark:border-gray-700 text-notion-text dark:text-white rounded-xl font-medium text-xs sm:text-sm transition-colors"
            >
              <GitBranch size={15} />
              <span className="hidden sm:inline">Import from</span> GitHub
            </button>
            <button
              onClick={() => { setEditingProject(null); setShowModal(true) }}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium text-xs sm:text-sm transition-colors shadow-lg shadow-blue-500/20"
            >
              <Plus size={15} />
              New
            </button>
          </div>
        </div>

        {/* Sync result feedback */}
        {syncResult && (
          <div className={`mb-3 px-3 py-2 rounded-xl text-xs font-medium ${
            syncResult.error
              ? 'bg-red-500/10 border border-red-500/30 text-red-400'
              : syncResult.added === 0
                ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                : 'bg-blue-500/10 border border-blue-500/30 text-blue-400'
          }`}>
            {syncResult.error
              ? syncResult.error
              : syncResult.added === 0
                ? 'All GitHub repos are already imported!'
                : `Imported ${syncResult.added} new ${syncResult.added === 1 ? 'project' : 'projects'} from GitHub`}
          </div>
        )}

        {/* Search + filter */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-notion-muted dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white dark:bg-gray-900 border border-cream-300 dark:border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-notion-text dark:text-white placeholder-notion-muted dark:placeholder-gray-500 text-sm focus:outline-none focus:border-cream-400 dark:focus:border-gray-700"
            />
          </div>
          <div className="flex gap-1 bg-white dark:bg-gray-900 border border-cream-300 dark:border-gray-800 rounded-xl p-1">
            {[
              { value: 'active', label: 'Active' },
              { value: 'all', label: 'All' },
              { value: 'archived', label: 'Archived' },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setFilterStatus(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filterStatus === opt.value ? 'bg-cream-300 dark:bg-gray-700 text-notion-text dark:text-white' : 'text-notion-muted dark:text-gray-400 hover:text-notion-text dark:hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-notion-muted dark:text-gray-600">
            <FolderKanban size={36} className="mb-3 opacity-40" />
            <p className="text-sm">No projects found</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-3 text-xs text-blue-400 hover:text-blue-300"
            >
              Create your first project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(project => (
              <ProjectCard key={project.id} project={project} onEdit={handleEdit} />
            ))}
            {/* Add card */}
            <button
              onClick={() => setShowModal(true)}
              className="border-2 border-dashed border-cream-400 dark:border-gray-800 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 text-notion-muted dark:text-gray-600 hover:text-notion-muted dark:hover:text-gray-400 hover:border-cream-400 dark:hover:border-gray-700 transition-colors min-h-[140px]"
            >
              <Plus size={24} />
              <span className="text-sm font-medium">Add Project</span>
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <ProjectModal project={editingProject} onClose={handleClose} />
      )}
      {showImport && (
        <ImportModal onClose={() => setShowImport(false)} />
      )}
    </div>
  )
}
