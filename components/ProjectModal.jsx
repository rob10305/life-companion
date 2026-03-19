'use client'
import { useState, useEffect } from 'react'
import { X, Plus, Trash2, GripVertical, ExternalLink } from 'lucide-react'
import { useData } from '../lib/DataContext'
import { generateId, LINK_TYPES, PROJECT_COLORS, PROJECT_EMOJIS } from '../lib/utils'

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active', color: 'text-green-400' },
  { value: 'paused', label: 'Paused', color: 'text-yellow-400' },
  { value: 'archived', label: 'Archived', color: 'text-gray-500' },
]

export default function ProjectModal({ project, onClose }) {
  const { addProject, updateProject } = useData()
  const isEdit = !!project

  const [form, setForm] = useState({
    name: '',
    description: '',
    color: PROJECT_COLORS[0],
    emoji: PROJECT_EMOJIS[0],
    status: 'active',
    notes: '',
    links: [],
  })
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  useEffect(() => {
    if (project) {
      setForm({
        name: project.name || '',
        description: project.description || '',
        color: project.color || PROJECT_COLORS[0],
        emoji: project.emoji || PROJECT_EMOJIS[0],
        status: project.status || 'active',
        notes: project.notes || '',
        links: project.links || [],
      })
    }
  }, [project])

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

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    if (isEdit) {
      updateProject({ ...project, ...form })
    } else {
      addProject(form)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-2xl w-full max-w-xl shadow-2xl my-4">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
              style={{ background: form.color + '30', border: `1px solid ${form.color}50` }}
            >
              {form.emoji}
            </div>
            <h2 className="text-lg font-semibold">{isEdit ? 'Edit Project' : 'New Project'}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Name + Emoji + Color row */}
          <div className="flex gap-3">
            {/* Emoji picker */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(v => !v)}
                className="w-12 h-12 text-2xl flex items-center justify-center bg-slate-100 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-xl hover:border-slate-400 dark:hover:border-gray-500 transition-colors"
              >
                {form.emoji}
              </button>
              {showEmojiPicker && (
                <div className="absolute top-full left-0 mt-2 z-20 bg-slate-100 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-xl p-2 grid grid-cols-8 gap-1 shadow-xl">
                  {PROJECT_EMOJIS.map(e => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => { setForm(f => ({ ...f, emoji: e })); setShowEmojiPicker(false) }}
                      className={`w-8 h-8 text-lg flex items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-gray-700 transition-colors ${form.emoji === e ? 'bg-slate-200 dark:bg-gray-600' : ''}`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Name */}
            <input
              autoFocus
              type="text"
              placeholder="Project name"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="flex-1 bg-slate-100 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Color picker */}
          <div>
            <label className="block text-xs text-slate-500 dark:text-gray-400 mb-2">Color</label>
            <div className="flex gap-2 flex-wrap">
              {PROJECT_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, color: c }))}
                  className={`w-7 h-7 rounded-full transition-all ${form.color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-white dark:ring-offset-gray-900 scale-110' : 'hover:scale-110'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Description & Status */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs text-slate-500 dark:text-gray-400 mb-1.5">Description</label>
              <input
                type="text"
                placeholder="Brief description..."
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full bg-slate-100 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 dark:text-gray-400 mb-1.5">Status</label>
              <select
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className="w-full bg-slate-100 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500"
              >
                {STATUS_OPTIONS.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Links */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-slate-500 dark:text-gray-400">Resource Links</label>
              <button
                type="button"
                onClick={addLink}
                className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                <Plus size={13} /> Add link
              </button>
            </div>

            <div className="space-y-3">
              {form.links.length === 0 && (
                <div className="text-center py-4 border border-dashed border-slate-300 dark:border-gray-700 rounded-xl text-slate-400 dark:text-gray-600 text-sm">
                  No links yet — click "Add link" to add project resources
                </div>
              )}
              {form.links.map(link => (
                <div key={link.id} className="bg-slate-100 dark:bg-gray-800 rounded-xl p-3 space-y-2">
                  <div className="flex gap-2">
                    {/* Type */}
                    <select
                      value={link.type}
                      onChange={e => updateLink(link.id, 'type', e.target.value)}
                      className="bg-slate-200 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-lg px-2 py-1.5 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-500 flex-shrink-0"
                    >
                      {Object.entries(LINK_TYPES).map(([key, val]) => (
                        <option key={key} value={key}>{val.label}</option>
                      ))}
                    </select>
                    {/* Label */}
                    <input
                      type="text"
                      placeholder="Label (e.g. GitHub Repo)"
                      value={link.label}
                      onChange={e => updateLink(link.id, 'label', e.target.value)}
                      className="flex-1 bg-slate-200 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-lg px-2 py-1.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 text-xs focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeLink(link.id)}
                      className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 dark:text-gray-500 hover:text-red-400 transition-colors flex-shrink-0"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={link.url}
                    onChange={e => updateLink(link.id, 'url', e.target.value)}
                    className="w-full bg-slate-200 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-lg px-2 py-1.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 text-xs focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Note (optional)"
                    value={link.note}
                    onChange={e => updateLink(link.id, 'note', e.target.value)}
                    className="w-full bg-slate-200 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-lg px-2 py-1.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs text-slate-500 dark:text-gray-400 mb-1.5">Notes</label>
            <textarea
              placeholder="Any notes about this project..."
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={2}
              className="w-full bg-slate-100 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-gray-700 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-400 dark:hover:border-gray-600 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl font-medium transition-colors text-sm text-white"
              style={{ background: form.color }}
            >
              {isEdit ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
