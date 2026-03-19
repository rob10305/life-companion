'use client'
import { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react'
import { INITIAL_DATA } from './initialData'
import { generateId } from './utils'
import { supabase, isSupabaseConfigured } from './supabase'

const STORAGE_KEY = 'life-companion-v1'

const DataContext = createContext(null)

// Column mapping: camelCase (app) ↔ snake_case (Supabase)
function toDb(obj, table) {
  if (table === 'projects') {
    return {
      id: obj.id,
      name: obj.name,
      description: obj.description || '',
      color: obj.color || '#3B82F6',
      emoji: obj.emoji || '📁',
      status: obj.status || 'active',
      links: obj.links || [],
      notes: obj.notes || '',
      created_at: obj.createdAt || new Date().toISOString(),
    }
  }
  if (table === 'tasks') {
    return {
      id: obj.id,
      title: obj.title,
      category: obj.category || 'personal',
      priority: obj.priority || 'medium',
      completed: obj.completed ?? false,
      due_date: obj.dueDate || null,
      project_id: obj.projectId || null,
      notes: obj.notes || '',
      created_at: obj.createdAt || new Date().toISOString(),
    }
  }
  if (table === 'bookmarks') {
    return {
      id: obj.id,
      title: obj.title,
      url: obj.url,
      description: obj.description || '',
      category: obj.category || 'uncategorized',
      pinned: obj.pinned ?? false,
      created_at: obj.createdAt || new Date().toISOString(),
    }
  }
  // categories / bookmark_categories — same shape
  return {
    id: obj.id,
    label: obj.label,
    color: obj.color || '#6B7280',
    emoji: obj.emoji || '📌',
    sort_order: obj.sort_order ?? 0,
  }
}

function fromDbProject(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    color: row.color || '#3B82F6',
    emoji: row.emoji || '📁',
    status: row.status || 'active',
    links: row.links || [],
    notes: row.notes || '',
    createdAt: row.created_at,
  }
}

function fromDbTask(row) {
  return {
    id: row.id,
    title: row.title,
    category: row.category || 'personal',
    priority: row.priority || 'medium',
    completed: row.completed ?? false,
    dueDate: row.due_date || null,
    projectId: row.project_id || null,
    notes: row.notes || '',
    createdAt: row.created_at,
  }
}

function fromDbBookmark(row) {
  return {
    id: row.id,
    title: row.title,
    url: row.url,
    description: row.description || '',
    category: row.category || 'uncategorized',
    pinned: row.pinned ?? false,
    createdAt: row.created_at,
  }
}

function fromDbCategory(row) {
  return {
    id: row.id,
    label: row.label,
    color: row.color || '#6B7280',
    emoji: row.emoji || '📌',
  }
}

// ─── Reducer (same as before — manages local state) ───────────

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD_DATA':
      return action.payload
    case 'ADD_PROJECT':
      return { ...state, projects: [...state.projects, action.payload] }
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(p => p.id === action.payload.id ? action.payload : p),
      }
    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter(p => p.id !== action.payload),
        tasks: state.tasks.map(t =>
          t.projectId === action.payload ? { ...t, projectId: null } : t
        ),
      }
    case 'ADD_TASK':
      return { ...state, tasks: [action.payload, ...state.tasks] }
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t => t.id === action.payload.id ? action.payload : t),
      }
    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter(t => t.id !== action.payload) }
    case 'TOGGLE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === action.payload ? { ...t, completed: !t.completed } : t
        ),
      }
    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.payload] }
    case 'ADD_BOOKMARK':
      return { ...state, bookmarks: [action.payload, ...(state.bookmarks || [])] }
    case 'UPDATE_BOOKMARK':
      return {
        ...state,
        bookmarks: (state.bookmarks || []).map(b => b.id === action.payload.id ? action.payload : b),
      }
    case 'DELETE_BOOKMARK':
      return { ...state, bookmarks: (state.bookmarks || []).filter(b => b.id !== action.payload) }
    case 'TOGGLE_BOOKMARK_PIN':
      return {
        ...state,
        bookmarks: (state.bookmarks || []).map(b =>
          b.id === action.payload ? { ...b, pinned: !b.pinned } : b
        ),
      }
    case 'IMPORT_BOOKMARKS':
      return {
        ...state,
        bookmarks: [...(state.bookmarks || []), ...action.payload],
      }
    case 'ADD_BOOKMARK_CATEGORY':
      return { ...state, bookmarkCategories: [...(state.bookmarkCategories || []), action.payload] }
    case 'DELETE_BOOKMARK_CATEGORY':
      return {
        ...state,
        bookmarkCategories: (state.bookmarkCategories || []).filter(c => c.id !== action.payload),
        bookmarks: (state.bookmarks || []).map(b =>
          b.category === action.payload ? { ...b, category: 'uncategorized' } : b
        ),
      }
    default:
      return state
  }
}

// ─── Supabase helpers ─────────────────────────────────────────

async function loadFromSupabase() {
  const [projectsRes, tasksRes, catsRes, bmsRes, bmCatsRes] = await Promise.all([
    supabase.from('projects').select('*').order('created_at', { ascending: false }),
    supabase.from('tasks').select('*').order('created_at', { ascending: false }),
    supabase.from('categories').select('*').order('sort_order'),
    supabase.from('bookmarks').select('*').order('created_at', { ascending: false }),
    supabase.from('bookmark_categories').select('*').order('sort_order'),
  ])

  return {
    projects: (projectsRes.data || []).map(fromDbProject),
    tasks: (tasksRes.data || []).map(fromDbTask),
    categories: (catsRes.data || []).map(fromDbCategory),
    bookmarks: (bmsRes.data || []).map(fromDbBookmark),
    bookmarkCategories: (bmCatsRes.data || []).map(fromDbCategory),
  }
}

async function seedSupabase(data) {
  const ops = []
  if (data.projects.length > 0) {
    ops.push(supabase.from('projects').upsert(data.projects.map(p => toDb(p, 'projects'))))
  }
  if (data.tasks.length > 0) {
    ops.push(supabase.from('tasks').upsert(data.tasks.map(t => toDb(t, 'tasks'))))
  }
  if (data.categories.length > 0) {
    ops.push(supabase.from('categories').upsert(data.categories.map(c => toDb(c, 'categories'))))
  }
  if (data.bookmarks?.length > 0) {
    ops.push(supabase.from('bookmarks').upsert(data.bookmarks.map(b => toDb(b, 'bookmarks'))))
  }
  if (data.bookmarkCategories?.length > 0) {
    ops.push(supabase.from('bookmark_categories').upsert(data.bookmarkCategories.map(c => toDb(c, 'bookmark_categories'))))
  }
  await Promise.all(ops)
}

// ─── Provider ─────────────────────────────────────────────────

export function DataProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_DATA)
  const [hydrated, setHydrated] = useReducer(() => true, false)
  const useSupabase = useRef(isSupabaseConfigured())

  // Load data on mount
  useEffect(() => {
    async function init() {
      if (useSupabase.current) {
        try {
          const data = await loadFromSupabase()
          // If all tables are empty, seed with initial data
          const isEmpty = data.projects.length === 0 && data.tasks.length === 0 &&
            data.categories.length === 0 && data.bookmarks.length === 0
          if (isEmpty) {
            await seedSupabase(INITIAL_DATA)
            dispatch({ type: 'LOAD_DATA', payload: INITIAL_DATA })
          } else {
            dispatch({ type: 'LOAD_DATA', payload: data })
          }
        } catch (e) {
          console.warn('Supabase load failed, falling back to localStorage:', e)
          useSupabase.current = false
          loadFromLocalStorage()
        }
      } else {
        loadFromLocalStorage()
      }
      setHydrated()
    }

    function loadFromLocalStorage() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
          const parsed = JSON.parse(saved)
          const merged = {
            ...INITIAL_DATA,
            ...parsed,
            bookmarks: parsed.bookmarks ?? INITIAL_DATA.bookmarks,
            bookmarkCategories: parsed.bookmarkCategories ?? INITIAL_DATA.bookmarkCategories,
          }
          dispatch({ type: 'LOAD_DATA', payload: merged })
        }
      } catch (e) {
        console.warn('Could not load saved data:', e)
      }
    }

    init()
  }, [])

  // Always save to localStorage as cache (even when using Supabase)
  useEffect(() => {
    if (hydrated) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      } catch (e) {
        console.warn('Could not save to localStorage:', e)
      }
    }
  }, [state, hydrated])

  // ─── Supabase-aware action helpers ──────────────────────────

  async function sb(table, operation, data) {
    if (!useSupabase.current) return
    try {
      const res = await operation
      if (res.error) console.warn(`Supabase ${table} error:`, res.error.message)
    } catch (e) {
      console.warn(`Supabase ${table} failed:`, e)
    }
  }

  // ─── Projects ───────────────────────────────────────────────

  const addProject = useCallback((data) => {
    const project = { ...data, id: generateId('proj'), createdAt: new Date().toISOString() }
    dispatch({ type: 'ADD_PROJECT', payload: project })
    sb('projects', supabase?.from('projects').insert(toDb(project, 'projects')))
  }, [])

  const updateProject = useCallback((project) => {
    dispatch({ type: 'UPDATE_PROJECT', payload: project })
    sb('projects', supabase?.from('projects').update(toDb(project, 'projects')).eq('id', project.id))
  }, [])

  const deleteProject = useCallback((id) => {
    dispatch({ type: 'DELETE_PROJECT', payload: id })
    sb('projects', supabase?.from('projects').delete().eq('id', id))
    // Also clear project_id on tasks
    sb('tasks', supabase?.from('tasks').update({ project_id: null }).eq('project_id', id))
  }, [])

  // ─── Tasks ──────────────────────────────────────────────────

  const addTask = useCallback((data) => {
    const task = {
      ...data,
      id: generateId('task'),
      completed: false,
      createdAt: new Date().toISOString(),
    }
    dispatch({ type: 'ADD_TASK', payload: task })
    sb('tasks', supabase?.from('tasks').insert(toDb(task, 'tasks')))
  }, [])

  const updateTask = useCallback((task) => {
    dispatch({ type: 'UPDATE_TASK', payload: task })
    sb('tasks', supabase?.from('tasks').update(toDb(task, 'tasks')).eq('id', task.id))
  }, [])

  const deleteTask = useCallback((id) => {
    dispatch({ type: 'DELETE_TASK', payload: id })
    sb('tasks', supabase?.from('tasks').delete().eq('id', id))
  }, [])

  const toggleTask = useCallback((id) => {
    dispatch({ type: 'TOGGLE_TASK', payload: id })
    // Need current state to know new value — read from state after dispatch
    if (useSupabase.current) {
      const task = state.tasks.find(t => t.id === id)
      if (task) {
        sb('tasks', supabase.from('tasks').update({ completed: !task.completed }).eq('id', id))
      }
    }
  }, [state.tasks])

  // ─── Categories ─────────────────────────────────────────────

  const addCategory = useCallback((data) => {
    const cat = { ...data, id: generateId('cat') }
    dispatch({ type: 'ADD_CATEGORY', payload: cat })
    sb('categories', supabase?.from('categories').insert(toDb(cat, 'categories')))
  }, [])

  // ─── Bookmarks ──────────────────────────────────────────────

  const addBookmark = useCallback((data) => {
    const bm = { ...data, id: generateId('bm'), createdAt: new Date().toISOString() }
    dispatch({ type: 'ADD_BOOKMARK', payload: bm })
    sb('bookmarks', supabase?.from('bookmarks').insert(toDb(bm, 'bookmarks')))
  }, [])

  const updateBookmark = useCallback((bookmark) => {
    dispatch({ type: 'UPDATE_BOOKMARK', payload: bookmark })
    sb('bookmarks', supabase?.from('bookmarks').update(toDb(bookmark, 'bookmarks')).eq('id', bookmark.id))
  }, [])

  const deleteBookmark = useCallback((id) => {
    dispatch({ type: 'DELETE_BOOKMARK', payload: id })
    sb('bookmarks', supabase?.from('bookmarks').delete().eq('id', id))
  }, [])

  const toggleBookmarkPin = useCallback((id) => {
    dispatch({ type: 'TOGGLE_BOOKMARK_PIN', payload: id })
    if (useSupabase.current) {
      const bm = (state.bookmarks || []).find(b => b.id === id)
      if (bm) {
        sb('bookmarks', supabase.from('bookmarks').update({ pinned: !bm.pinned }).eq('id', id))
      }
    }
  }, [state.bookmarks])

  const importBookmarks = useCallback((bookmarksArray) => {
    dispatch({ type: 'IMPORT_BOOKMARKS', payload: bookmarksArray })
    if (useSupabase.current && bookmarksArray.length > 0) {
      sb('bookmarks', supabase.from('bookmarks').insert(bookmarksArray.map(b => toDb(b, 'bookmarks'))))
    }
  }, [])

  // ─── Bookmark Categories ────────────────────────────────────

  const addBookmarkCategory = useCallback((data) => {
    const cat = { ...data, id: generateId('bmcat') }
    dispatch({ type: 'ADD_BOOKMARK_CATEGORY', payload: cat })
    sb('bookmark_categories', supabase?.from('bookmark_categories').insert(toDb(cat, 'bookmark_categories')))
  }, [])

  const deleteBookmarkCategory = useCallback((id) => {
    dispatch({ type: 'DELETE_BOOKMARK_CATEGORY', payload: id })
    sb('bookmark_categories', supabase?.from('bookmark_categories').delete().eq('id', id))
    // Move bookmarks in deleted category to uncategorized
    sb('bookmarks', supabase?.from('bookmarks').update({ category: 'uncategorized' }).eq('category', id))
  }, [])

  // ─── Utility ────────────────────────────────────────────────

  const resetToDefaults = useCallback(async () => {
    dispatch({ type: 'LOAD_DATA', payload: INITIAL_DATA })
    if (useSupabase.current) {
      // Clear all tables and re-seed
      await Promise.all([
        supabase.from('projects').delete().neq('id', ''),
        supabase.from('tasks').delete().neq('id', ''),
        supabase.from('categories').delete().neq('id', ''),
        supabase.from('bookmarks').delete().neq('id', ''),
        supabase.from('bookmark_categories').delete().neq('id', ''),
      ])
      await seedSupabase(INITIAL_DATA)
    }
  }, [])

  const exportData = useCallback(() => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `life-companion-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [state])

  const importData = useCallback(async (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString)
      if (parsed.projects && parsed.tasks && parsed.categories) {
        dispatch({ type: 'LOAD_DATA', payload: parsed })
        if (useSupabase.current) {
          await seedSupabase(parsed)
        }
        return true
      }
    } catch (e) {
      console.error('Import failed:', e)
    }
    return false
  }, [])

  return (
    <DataContext.Provider value={{
      ...state,
      hydrated,
      addProject,
      updateProject,
      deleteProject,
      addTask,
      updateTask,
      deleteTask,
      toggleTask,
      addCategory,
      bookmarks: state.bookmarks || [],
      bookmarkCategories: state.bookmarkCategories || [],
      addBookmark,
      updateBookmark,
      deleteBookmark,
      toggleBookmarkPin,
      importBookmarks,
      addBookmarkCategory,
      deleteBookmarkCategory,
      resetToDefaults,
      exportData,
      importData,
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
