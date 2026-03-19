'use client'
import { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { INITIAL_DATA } from './initialData'
import { generateId } from './utils'

const STORAGE_KEY = 'life-companion-v1'

const DataContext = createContext(null)

function reducer(state, action) {
  switch (action.type) {
    // Projects
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
    // Tasks
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
    // Categories
    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.payload] }
    default:
      return state
  }
}

export function DataProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_DATA)
  const [hydrated, setHydrated] = useReducer(() => true, false)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        dispatch({ type: 'LOAD_DATA', payload: parsed })
      }
    } catch (e) {
      console.warn('Could not load saved data:', e)
    }
    setHydrated()
  }, [])

  // Save to localStorage on every change (after hydration)
  useEffect(() => {
    if (hydrated) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      } catch (e) {
        console.warn('Could not save data:', e)
      }
    }
  }, [state, hydrated])

  const addProject = useCallback((data) => {
    dispatch({
      type: 'ADD_PROJECT',
      payload: { ...data, id: generateId('proj'), createdAt: new Date().toISOString() },
    })
  }, [])

  const updateProject = useCallback((project) => {
    dispatch({ type: 'UPDATE_PROJECT', payload: project })
  }, [])

  const deleteProject = useCallback((id) => {
    dispatch({ type: 'DELETE_PROJECT', payload: id })
  }, [])

  const addTask = useCallback((data) => {
    dispatch({
      type: 'ADD_TASK',
      payload: {
        ...data,
        id: generateId('task'),
        completed: false,
        createdAt: new Date().toISOString(),
      },
    })
  }, [])

  const updateTask = useCallback((task) => {
    dispatch({ type: 'UPDATE_TASK', payload: task })
  }, [])

  const deleteTask = useCallback((id) => {
    dispatch({ type: 'DELETE_TASK', payload: id })
  }, [])

  const toggleTask = useCallback((id) => {
    dispatch({ type: 'TOGGLE_TASK', payload: id })
  }, [])

  const addCategory = useCallback((data) => {
    dispatch({
      type: 'ADD_CATEGORY',
      payload: { ...data, id: generateId('cat') },
    })
  }, [])

  const resetToDefaults = useCallback(() => {
    dispatch({ type: 'LOAD_DATA', payload: INITIAL_DATA })
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

  const importData = useCallback((jsonString) => {
    try {
      const parsed = JSON.parse(jsonString)
      if (parsed.projects && parsed.tasks && parsed.categories) {
        dispatch({ type: 'LOAD_DATA', payload: parsed })
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
