'use client'
import { useState } from 'react'
import { Plus, Search, FolderKanban, GitBranch } from 'lucide-react'
import { useData } from '../lib/DataContext'
import ProjectCard from './ProjectCard'
import ProjectModal from './ProjectModal'
import ImportModal from './ImportModal'

export default function ProjectsView() {
  const { projects } = useData()
  const [showModal, setShowModal] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('active')

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
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Projects</h1>
            <p className="text-sm text-slate-500 dark:text-gray-400 mt-0.5">
              {projects.filter(p => p.status === 'active').length} active
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowImport(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 border border-slate-300 dark:border-gray-700 text-slate-900 dark:text-white rounded-xl font-medium text-sm transition-colors"
            >
              <GitBranch size={16} />
              Import from GitHub
            </button>
            <button
              onClick={() => { setEditingProject(null); setShowModal(true) }}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium text-sm transition-colors shadow-lg shadow-blue-500/20"
            >
              <Plus size={16} />
              New Project
            </button>
          </div>
        </div>

        {/* Search + filter */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 text-sm focus:outline-none focus:border-slate-300 dark:focus:border-gray-700"
            />
          </div>
          <div className="flex gap-1 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl p-1">
            {[
              { value: 'active', label: 'Active' },
              { value: 'all', label: 'All' },
              { value: 'archived', label: 'Archived' },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setFilterStatus(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filterStatus === opt.value ? 'bg-slate-200 dark:bg-gray-700 text-slate-900 dark:text-white' : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
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
          <div className="flex flex-col items-center justify-center h-48 text-slate-400 dark:text-gray-600">
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
              className="border-2 border-dashed border-slate-300 dark:border-gray-800 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 text-slate-400 dark:text-gray-600 hover:text-slate-500 dark:hover:text-gray-400 hover:border-slate-300 dark:hover:border-gray-700 transition-colors min-h-[140px]"
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
