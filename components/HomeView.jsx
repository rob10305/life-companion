'use client'
import { useState } from 'react'
import {
  Plus, ChevronRight, AlertCircle, Calendar, CheckCircle2,
  FolderKanban, CheckSquare, Bookmark, Bot, Settings, Wrench, Youtube
} from 'lucide-react'
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
          <h1 className="text-xl sm:text-2xl font-bold text-notion-text dark:text-white">{greeting} 👋</h1>
          <p className="text-sm text-notion-muted dark:text-gray-500 mt-0.5">{dateStr}</p>
        </div>

        {/* Navigation grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 sm:gap-3">
          {[
            { id: 'projects', label: 'Projects', icon: FolderKanban, color: '#3B82F6', count: activeProjects.length },
            { id: 'tasks',    label: 'Tasks',    icon: CheckSquare,  color: '#10B981', count: pendingTasks.length },
            { id: 'links',    label: 'Links',    icon: Bookmark,     color: '#F59E0B', count: null },
            { id: 'agents',   label: 'Agents',   icon: Bot,          color: '#8B5CF6', count: null },
            { id: 'youtube',  label: 'YouTube',  icon: Youtube,      color: '#EF4444', count: null },
            { id: 'settings', label: 'Settings', icon: Settings,     color: '#6B7280', count: null },
            { id: 'tools',    label: 'AI Tools',  icon: Wrench,       color: '#EC4899', count: null },
          ].map(item => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id === 'tools' ? 'agents' : item.id)}
                className="bg-white dark:bg-gray-900 border border-cream-300 dark:border-gray-800 rounded-2xl p-3 sm:p-4 flex flex-col items-center gap-2 hover:border-cream-400 dark:hover:border-gray-700 hover:shadow-sm transition-all group"
              >
                <div
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
                  style={{ background: item.color + '15' }}
                >
                  <Icon size={20} style={{ color: item.color }} />
                </div>
                <span className="text-xs font-medium text-notion-text dark:text-white">{item.label}</span>
                {item.count !== null && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: item.color + '20', color: item.color }}>
                    {item.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Quick add */}
        <div className="bg-white dark:bg-gray-900 border border-cream-300 dark:border-gray-800 rounded-2xl p-4">
          <h2 className="text-sm font-medium text-notion-muted dark:text-gray-300 mb-3">Quick Add Task</h2>
          <form onSubmit={handleQuickAdd} className="flex gap-2">
            <input
              type="text"
              placeholder="What needs doing?"
              value={quickTitle}
              onChange={e => setQuickTitle(e.target.value)}
              className="flex-1 bg-cream-200 dark:bg-gray-800 border border-cream-400 dark:border-gray-700 rounded-xl px-4 py-2.5 text-notion-text dark:text-white placeholder-notion-muted dark:placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={!quickTitle.trim()}
              className="px-3 sm:px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 flex-shrink-0"
            >
              <Plus size={15} /> <span className="hidden sm:inline">Add</span>
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
              <h2 className="text-sm font-semibold text-notion-muted dark:text-gray-300">Active Projects</h2>
              <button
                onClick={() => onNavigate('projects')}
                className="text-xs text-notion-muted dark:text-gray-500 hover:text-notion-muted dark:hover:text-gray-300 flex items-center gap-0.5"
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
              <h2 className="text-sm font-semibold text-notion-muted dark:text-gray-300">Open Tasks</h2>
              <button
                onClick={() => onNavigate('tasks')}
                className="text-xs text-notion-muted dark:text-gray-500 hover:text-notion-muted dark:hover:text-gray-300 flex items-center gap-0.5"
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
          <div className="text-center py-12 text-notion-muted dark:text-gray-600">
            <CheckCircle2 size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium text-notion-muted dark:text-gray-500">You're all caught up!</p>
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
