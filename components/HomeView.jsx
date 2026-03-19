'use client'
import { useState } from 'react'
import { Plus, ChevronRight, AlertCircle, Calendar, CheckCircle2 } from 'lucide-react'
import { useData } from '../lib/DataContext'
import TaskItem from './TaskItem'
import TaskModal from './TaskModal'
import ProjectCard from './ProjectCard'
import ProjectModal from './ProjectModal'
import { isOverdue, formatDate } from '../lib/utils'

export default function HomeView({ onNavigate }) {
  const { tasks, projects, categories, toggleTask } = useData()
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [editingProject, setEditingProject] = useState(null)
  const [quickTitle, setQuickTitle] = useState('')

  const pendingTasks = tasks.filter(t => !t.completed)
  const overdueTasks = pendingTasks.filter(t => isOverdue(t.dueDate))
  const highPriority = pendingTasks.filter(t => t.priority === 'high' && !isOverdue(t.dueDate))
  const activeProjects = projects.filter(p => p.status === 'active')
  const recentTasks = pendingTasks.slice(0, 5)

  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const dateStr = now.toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric' })

  function handleQuickAdd(e) {
    e.preventDefault()
    if (!quickTitle.trim()) return
    setEditingTask({ _quickTitle: quickTitle })
    setQuickTitle('')
    setShowTaskModal(true)
  }

  function handleEditTask(task) {
    setEditingTask(task)
    setShowTaskModal(true)
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{greeting} 👋</h1>
          <p className="text-sm text-slate-400 dark:text-gray-500 mt-0.5">{dateStr}</p>
        </div>

        {/* Stats row — placeholder for future widgets */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => onNavigate('projects')}
            className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl p-4 text-left hover:border-slate-300 dark:hover:border-gray-700 transition-colors group"
          >
            <div className="text-2xl mb-2">📁</div>
            <div className="text-2xl font-bold text-blue-500">{activeProjects.length}</div>
            <div className="text-xs text-slate-400 dark:text-gray-500 mt-0.5 group-hover:text-slate-500 dark:group-hover:text-gray-400 transition-colors">Active Projects</div>
          </button>
        </div>

        {/* Quick add */}
        <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl p-4">
          <h2 className="text-sm font-medium text-slate-500 dark:text-gray-300 mb-3">Quick Add Task</h2>
          <form onSubmit={handleQuickAdd} className="flex gap-2">
            <input
              type="text"
              placeholder="What needs doing? (press Enter to add details)"
              value={quickTitle}
              onChange={e => setQuickTitle(e.target.value)}
              className="flex-1 bg-slate-100 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={!quickTitle.trim()}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5"
            >
              <Plus size={15} /> Add
            </button>
          </form>
        </div>

        {/* Overdue alert */}
        {overdueTasks.length > 0 && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle size={16} className="text-red-400" />
              <h2 className="text-sm font-semibold text-red-400">
                {overdueTasks.length} Overdue Task{overdueTasks.length !== 1 ? 's' : ''}
              </h2>
            </div>
            <div className="space-y-2">
              {overdueTasks.slice(0, 3).map(task => (
                <TaskItem key={task.id} task={task} onEdit={handleEditTask} />
              ))}
            </div>
            {overdueTasks.length > 3 && (
              <button
                onClick={() => onNavigate('tasks')}
                className="mt-2 text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
              >
                +{overdueTasks.length - 3} more <ChevronRight size={12} />
              </button>
            )}
          </div>
        )}

        {/* Active projects */}
        {activeProjects.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-500 dark:text-gray-300">Active Projects</h2>
              <button
                onClick={() => onNavigate('projects')}
                className="text-xs text-slate-400 dark:text-gray-500 hover:text-slate-500 dark:hover:text-gray-300 flex items-center gap-0.5"
              >
                View all <ChevronRight size={12} />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeProjects.slice(0, 4).map(project => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onEdit={p => { setEditingProject(p) }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Upcoming tasks */}
        {recentTasks.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-500 dark:text-gray-300">Open Tasks</h2>
              <button
                onClick={() => onNavigate('tasks')}
                className="text-xs text-slate-400 dark:text-gray-500 hover:text-slate-500 dark:hover:text-gray-300 flex items-center gap-0.5"
              >
                View all <ChevronRight size={12} />
              </button>
            </div>
            <div className="space-y-2">
              {recentTasks.map(task => (
                <TaskItem key={task.id} task={task} onEdit={handleEditTask} />
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {pendingTasks.length === 0 && activeProjects.length === 0 && (
          <div className="text-center py-12 text-slate-400 dark:text-gray-600">
            <CheckCircle2 size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium text-slate-400 dark:text-gray-500">You're all caught up!</p>
            <p className="text-sm mt-1">Use the quick add above or visit Projects to get started.</p>
          </div>
        )}
      </div>

      {showTaskModal && (
        <TaskModal
          task={editingTask?.id ? editingTask : null}
          onClose={() => { setShowTaskModal(false); setEditingTask(null) }}
        />
      )}
      {editingProject && (
        <ProjectModal
          project={editingProject}
          onClose={() => setEditingProject(null)}
        />
      )}
    </div>
  )
}
