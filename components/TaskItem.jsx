'use client'
import { Pencil, Trash2, Calendar, AlertCircle } from 'lucide-react'
import { useData } from '../lib/DataContext'
import { formatDate, isOverdue, PRIORITY_CONFIG } from '../lib/utils'

export default function TaskItem({ task, onEdit }) {
  const { categories, projects, toggleTask, deleteTask } = useData()

  const category = categories.find(c => c.id === task.category)
  const project = task.projectId ? projects.find(p => p.id === task.projectId) : null
  const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium
  const overdue = !task.completed && isOverdue(task.dueDate)
  const dateLabel = formatDate(task.dueDate)

  return (
    <div className={`group flex items-start gap-3 px-4 py-3 rounded-xl border transition-all ${
      task.completed
        ? 'border-transparent bg-slate-100/60 dark:bg-gray-900/40 opacity-50'
        : 'border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-slate-300 dark:hover:border-gray-700'
    }`}>
      {/* Checkbox */}
      <button
        onClick={() => toggleTask(task.id)}
        className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
          task.completed
            ? 'bg-green-500 border-green-500'
            : 'border-slate-300 dark:border-gray-600 hover:border-slate-400 dark:hover:border-gray-400'
        }`}
      >
        {task.completed && (
          <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 flex-wrap">
          <span className={`text-sm leading-5 ${task.completed ? 'line-through text-slate-400 dark:text-gray-500' : 'text-slate-900 dark:text-white'}`}>
            {task.title}
          </span>
          {/* Priority dot for high */}
          {task.priority === 'high' && !task.completed && (
            <span className="inline-flex items-center gap-1 text-xs text-red-400 mt-0.5">
              <AlertCircle size={11} />
            </span>
          )}
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {category && (
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: category.color + '20', color: category.color }}
            >
              {category.emoji} {category.label}
            </span>
          )}
          {project && (
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: project.color + '20', color: project.color }}
            >
              {project.emoji} {project.name}
            </span>
          )}
          {dateLabel && (
            <span className={`flex items-center gap-1 text-xs ${overdue ? 'text-red-400' : 'text-slate-400 dark:text-gray-500'}`}>
              <Calendar size={10} />
              {dateLabel}
            </span>
          )}
        </div>
      </div>

      {/* Actions — visible on hover */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5">
        <button
          onClick={() => onEdit(task)}
          className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-gray-700 text-slate-400 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={() => deleteTask(task.id)}
          className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 dark:text-gray-500 hover:text-red-400 transition-colors"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}
