'use client'
import { useState, useMemo } from 'react'
import {
  Plus, Search, ExternalLink, Pencil, Trash2, Bookmark, X,
  FolderPlus, Globe
} from 'lucide-react'
import { useData } from '../lib/DataContext'

function LinkModal({ bookmark, categories, onSave, onClose }) {
  const isEdit = !!bookmark
  const [form, setForm] = useState({
    title: bookmark?.title || '',
    url: bookmark?.url || '',
    description: bookmark?.description || '',
    category: bookmark?.category || (categories[0]?.id || 'uncategorized'),
  })

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim() || !form.url.trim()) return
    // Auto-add https if missing
    let url = form.url.trim()
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url
    onSave({ ...form, url })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <h2 className="text-lg font-semibold">{isEdit ? 'Edit Link' : 'Add Link'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Title</label>
            <input
              autoFocus
              type="text"
              placeholder="e.g. Hacker News"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">URL</label>
            <input
              type="text"
              placeholder="https://..."
              value={form.url}
              onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Description (optional)</label>
            <input
              type="text"
              placeholder="A short note about this link"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Category</label>
            <select
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
            >
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors text-sm flex items-center justify-center gap-2"
            >
              <Plus size={15} />
              {isEdit ? 'Save Changes' : 'Add Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function CategoryModal({ categories, onSave, onClose }) {
  const [form, setForm] = useState({ label: '', emoji: '📁', color: '#6B7280' })
  const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4', '#F97316', '#84CC16', '#6B7280']
  const EMOJIS = ['📁', '💻', '🏎️', '🤖', '🛠️', '📚', '🎮', '🎨', '🏠', '💰', '🔒', '🌍', '📱', '⚡', '🎵', '🎬']

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.label.trim()) return
    onSave(form)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <h2 className="text-lg font-semibold">New Category</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Name</label>
            <input
              autoFocus
              type="text"
              placeholder="e.g. Gaming Stuff"
              value={form.label}
              onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-2">Icon</label>
            <div className="flex gap-1.5 flex-wrap">
              {EMOJIS.map(e => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, emoji: e }))}
                  className={`w-9 h-9 text-lg flex items-center justify-center rounded-lg transition-all ${
                    form.emoji === e ? 'bg-gray-600 ring-2 ring-blue-500' : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-2">Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
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
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors text-sm"
            >
              Create Category
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function LinkCard({ bookmark, category, onEdit, onDelete }) {
  // Extract hostname for favicon
  let favicon = null
  try {
    const host = new URL(bookmark.url).hostname
    favicon = `https://www.google.com/s2/favicons?sz=32&domain=${host}`
  } catch {}

  return (
    <div className="group flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-800 bg-gray-900 hover:border-gray-700 transition-all">
      {/* Favicon */}
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden"
        style={{ background: (category?.color || '#6B7280') + '15' }}
      >
        {favicon ? (
          <img src={favicon} alt="" className="w-5 h-5" onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }} />
        ) : null}
        <Globe size={14} style={{ color: category?.color || '#6B7280', display: favicon ? 'none' : 'block' }} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <a
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-white hover:text-blue-300 transition-colors truncate block"
        >
          {bookmark.title}
        </a>
        {bookmark.description && (
          <p className="text-xs text-gray-500 truncate mt-0.5">{bookmark.description}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <a
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-500 hover:text-blue-400 transition-colors"
        >
          <ExternalLink size={13} />
        </a>
        <button
          onClick={() => onEdit(bookmark)}
          className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-500 hover:text-white transition-colors"
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={() => onDelete(bookmark.id)}
          className="p-1.5 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}

export default function LinksView() {
  const {
    bookmarks, bookmarkCategories,
    addBookmark, updateBookmark, deleteBookmark,
    addBookmarkCategory, deleteBookmarkCategory,
  } = useData()

  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('all')
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [editingLink, setEditingLink] = useState(null)
  const [showCatModal, setShowCatModal] = useState(false)

  const filtered = useMemo(() => {
    return bookmarks.filter(b => {
      if (filterCat !== 'all' && b.category !== filterCat) return false
      if (search) {
        const q = search.toLowerCase()
        return b.title.toLowerCase().includes(q) || (b.description || '').toLowerCase().includes(q) || b.url.toLowerCase().includes(q)
      }
      return true
    })
  }, [bookmarks, filterCat, search])

  // Group by category for display
  const grouped = useMemo(() => {
    if (filterCat !== 'all') return null // flat list when filtered
    const map = {}
    for (const bm of filtered) {
      const cat = bm.category || 'uncategorized'
      if (!map[cat]) map[cat] = []
      map[cat].push(bm)
    }
    return map
  }, [filtered, filterCat])

  function handleSaveLink(data) {
    if (editingLink) {
      updateBookmark({ ...editingLink, ...data })
    } else {
      addBookmark(data)
    }
  }

  function handleEditLink(bm) {
    setEditingLink(bm)
    setShowLinkModal(true)
  }

  function handleCloseLink() {
    setShowLinkModal(false)
    setEditingLink(null)
  }

  function handleDeleteLink(id) {
    deleteBookmark(id)
  }

  function handleDeleteCategory(catId) {
    if (catId === 'uncategorized') return
    const count = bookmarks.filter(b => b.category === catId).length
    const msg = count > 0
      ? `Delete this category? ${count} link(s) will be moved to "Other".`
      : 'Delete this empty category?'
    if (confirm(msg)) deleteBookmarkCategory(catId)
  }

  function getCat(id) {
    return bookmarkCategories.find(c => c.id === id) || { label: 'Other', color: '#6B7280', emoji: '📌' }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 p-6 pb-0">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold text-white">Links</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {bookmarks.length} saved link{bookmarks.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCatModal(true)}
              className="flex items-center gap-2 px-3 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white rounded-xl font-medium text-sm transition-colors"
            >
              <FolderPlus size={15} />
              <span className="hidden sm:inline">Category</span>
            </button>
            <button
              onClick={() => { setEditingLink(null); setShowLinkModal(true) }}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium text-sm transition-colors shadow-lg shadow-blue-500/20"
            >
              <Plus size={16} />
              Add Link
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search links..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-gray-700"
          />
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 pb-4 overflow-x-auto">
          <button
            onClick={() => setFilterCat('all')}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filterCat === 'all' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            All
          </button>
          {bookmarkCategories.map(cat => {
            const count = bookmarks.filter(b => b.category === cat.id).length
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
                  <span className="text-xs px-1.5 rounded-full" style={{ background: cat.color + '30', color: cat.color }}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Links list */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-600">
            <Bookmark size={32} className="mb-3 opacity-40" />
            <p className="text-sm">{search ? 'No links match your search' : 'No links saved yet'}</p>
            <button
              onClick={() => setShowLinkModal(true)}
              className="mt-3 text-xs text-blue-400 hover:text-blue-300"
            >
              Add your first link
            </button>
          </div>
        ) : grouped ? (
          // Grouped by category
          <div className="space-y-6">
            {bookmarkCategories
              .filter(cat => grouped[cat.id]?.length > 0)
              .map(cat => (
                <div key={cat.id}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{cat.emoji}</span>
                      <h2 className="text-sm font-semibold" style={{ color: cat.color }}>{cat.label}</h2>
                      <span className="text-xs text-gray-600">{grouped[cat.id].length}</span>
                    </div>
                    {cat.id !== 'uncategorized' && (
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="p-1 rounded-lg hover:bg-red-500/10 text-gray-700 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete category"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    {grouped[cat.id].map(bm => (
                      <LinkCard key={bm.id} bookmark={bm} category={cat} onEdit={handleEditLink} onDelete={handleDeleteLink} />
                    ))}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          // Flat filtered list
          <div className="space-y-1.5">
            {filtered.map(bm => (
              <LinkCard key={bm.id} bookmark={bm} category={getCat(bm.category)} onEdit={handleEditLink} onDelete={handleDeleteLink} />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showLinkModal && (
        <LinkModal
          bookmark={editingLink}
          categories={bookmarkCategories}
          onSave={handleSaveLink}
          onClose={handleCloseLink}
        />
      )}
      {showCatModal && (
        <CategoryModal
          categories={bookmarkCategories}
          onSave={(data) => addBookmarkCategory(data)}
          onClose={() => setShowCatModal(false)}
        />
      )}
    </div>
  )
}
