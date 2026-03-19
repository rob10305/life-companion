'use client'
import { useState } from 'react'
import {
  ChevronDown, ChevronUp, Pencil, Trash2, ExternalLink,
  Folder, Globe, GitBranch, FileText, Code2, Palette, Link,
  CheckCircle, Circle, Archive, PauseCircle
} from 'lucide-react'
import { useData } from '../lib/DataContext'
import { LINK_TYPES } from '../lib/utils'

const LINK_ICONS = {
  files:   Folder,
  hosting: Globe,
  git:     GitBranch,
  live:    ExternalLink,
  docs:    FileText,
  figma:   Palette,
  api:     Code2,
  custom:  Link,
}

const STATUS_ICONS = {
  active:   { icon: CheckCircle, color: 'text-green-400' },
  paused:   { icon: PauseCircle, color: 'text-yellow-400' },
  archived: { icon: Archive,     color: 'text-gray-500' },
}

export default function ProjectCard({ project, onEdit }) {
  const { deleteProject, tasks } = useData()
  const [expanded, setExpanded] = useState(false)

  const projectTasks = tasks.filter(t => t.projectId === project.id && !t.completed)
  const statusInfo = STATUS_ICONS[project.status] || STATUS_ICONS.active
  const StatusIcon = statusInfo.icon

  function handleDelete() {
    if (confirm(`Delete "${project.name}"? This cannot be undone.`)) {
      deleteProject(project.id)
    }
  }

  return (
    <div
      className="bg-white dark:bg-gray-900 border rounded-2xl overflow-hidden transition-all hover:border-opacity-80"
      style={{ borderColor: project.color + '40' }}
    >
      {/* Color bar */}
      <div className="h-1" style={{ background: project.color }} />

      {/* Card header */}
      <div className="p-5">
        <div className="flex items-start gap-3">
          {/* Emoji */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: project.color + '25', border: `1px solid ${project.color}40` }}
          >
            {project.emoji}
          </div>

          {/* Title + meta */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-notion-text dark:text-white truncate">{project.name}</h3>
              <StatusIcon size={13} className={`flex-shrink-0 ${statusInfo.color}`} />
            </div>
            {project.description && (
              <p className="text-xs text-notion-muted dark:text-gray-400 mt-0.5 truncate">{project.description}</p>
            )}
            {/* Badges row */}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-xs text-notion-muted dark:text-gray-500">
                {project.links.length} link{project.links.length !== 1 ? 's' : ''}
              </span>
              {projectTasks.length > 0 && (
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">
                  {projectTasks.length} open task{projectTasks.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => onEdit(project)}
              className="p-1.5 rounded-lg hover:bg-cream-200 dark:hover:bg-gray-800 text-notion-muted dark:text-gray-500 hover:text-notion-text dark:hover:text-white transition-colors"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-lg hover:bg-red-500/20 text-notion-muted dark:text-gray-500 hover:text-red-400 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Expand button */}
        {project.links.length > 0 && (
          <button
            onClick={() => setExpanded(v => !v)}
            className="mt-4 w-full flex items-center justify-between py-2 px-3 rounded-xl bg-cream-200 dark:bg-gray-800 hover:bg-cream-200 dark:hover:bg-gray-750 text-notion-muted dark:text-gray-400 hover:text-notion-text dark:hover:text-white text-xs font-medium transition-colors group"
          >
            <span>Resources & Links</span>
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        )}
      </div>

      {/* Expanded links */}
      {expanded && project.links.length > 0 && (
        <div className="px-5 pb-5 space-y-2">
          {project.links.map(link => {
            const typeInfo = LINK_TYPES[link.type] || LINK_TYPES.custom
            const Icon = LINK_ICONS[link.type] || Link
            return (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-cream-200 dark:bg-gray-800 hover:bg-cream-200 dark:hover:bg-gray-750 group border border-transparent hover:border-cream-400 dark:hover:border-gray-700 transition-all"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: project.color + '20' }}
                >
                  <Icon size={15} style={{ color: project.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-notion-text dark:text-white font-medium truncate group-hover:text-blue-300 transition-colors">
                    {link.label || typeInfo.label}
                  </div>
                  {link.note && (
                    <div className="text-xs text-notion-muted dark:text-gray-500 truncate">{link.note}</div>
                  )}
                </div>
                <ExternalLink size={13} className="flex-shrink-0 text-notion-muted dark:text-gray-600 group-hover:text-notion-muted dark:group-hover:text-gray-400 transition-colors" />
              </a>
            )
          })}
        </div>
      )}

      {/* Notes */}
      {expanded && project.notes && (
        <div className="px-5 pb-5">
          <div className="px-3 py-2.5 rounded-xl bg-cream-200 dark:bg-gray-800/50 border border-cream-300 dark:border-gray-800">
            <p className="text-xs text-notion-muted dark:text-gray-400 leading-relaxed">{project.notes}</p>
          </div>
        </div>
      )}
    </div>
  )
}
