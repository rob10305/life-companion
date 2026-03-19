'use client'
import { useState, useMemo } from 'react'
import { Plus, Search, CheckSquare, Filter } from 'lucide-react'
import { useData } from '../lib/DataContext'
import TaskItem from './TaskItem'
import TaskModal from './TaskModal'

export default function TasksView() {
  const { tasks, categories } = useData()
  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('all')
  const [filterStatus, setFilterStatus] = useState('active') // 'all' | 'active' | 'done'
  const [filterPriority, setFilterPriority] = useState('all')

  const filtered = useMemo(() => {
    return tasks.filter(t => {
      if (filterCat !== 'all' && t.category !== filterCat) return false
      if (filterStatus === 'active' && t.completed) return false
      if (filterStatus === 'done' && !t.completed) return false
      if (filterPriority !== 'all' && t.priority !== filterPriority) return false
      if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [tasks, filterCat, filterStatus, filterPriority, search])

  const pendingCount = tasks.filter(t => !t.completed).length
  const doneCount = tasks.filter(t => t.completed).length

  function handleEdit(task) {
    setEditingTask(task)
    setShowModal(true)
  }

  function handleClose() {
    setShowModal(false)
    setEditingTask(null)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 p-6 pb-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Life Tasks</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {pendingCount} pending · {doneCount} completed
            </p>
          </div>
          <button
            onClick={() => { setEditingTask(null); setShowModal(true) }}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium text-sm transition-colors shadow-lg shadow-blue-500/20"
          >
            <Plus size={16} />
            Add Task
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-gray-700"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap pb-4 border-b border-gray-900">
          {/* Status */}
          {[
            { value: 'active', label: 'Pending' },
            { value: 'done', label: 'Done' },
            { value: 'all', label: 'All' },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setFilterStatus(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterStatus === opt.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
              }`}
            >
              {opt.label}
            </button>
          ))}

          <div className="w-px bg-gray-800 mx-1" />

          {/* Priority */}
          {[
            { value: 'all', label: 'Any' },
            { value: 'high', label: '🔴 High' },
            { value: 'medium', label: '🟡 Med' },
            { value: 'low', label: '⚪ Low' },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setFilterPriority(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterPriority === opt.value
                  ? 'bg-gray-700 text-white'
                  : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 pt-4 overflow-x-auto pb-1">
          <button
            onClick={() => setFilterCat('all')}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filterCat === 'all' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            All
          </button>
          {categories.map(cat => {
            const count = tasks.filter(t => t.category === cat.id && !t.completed).length
            return (
              <button
                key={cat.id}
                onClick={() => setFilterCat(cat.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  filterCat === cat.id ? 'text-white' : 'text-gray-400 hover:text-white'
                }`}
                style={filterCat === cat.id ? { background: cat.color + '30', color: cat.color } : {}}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
                {count > 0 && (
                  <span
                    className="text-xs px-1.5 rounded-full"
                    style={{ background: cat.color + '30', color: cat.color }}
                  >
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto p-6 pt-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-600">
            <CheckSquare size={32} className="mb-3 opacity-40" />
            <p className="text-sm">
              {search ? 'No tasks match your search' : 'Nothing here — great job!'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(task => (
              <TaskItem key={task.id} task={task} onEdit={handleEdit} />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <TaskModal task={editingTask} onClose={handleClose} />
      )}
    </div>
  )
}
