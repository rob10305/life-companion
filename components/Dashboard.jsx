'use client'
import { useState } from 'react'
import {
  LayoutDashboard, FolderKanban, CheckSquare, Settings,
  Menu, X, Compass, Bot, Bookmark, Cloud, ExternalLink, Sun, Moon
} from 'lucide-react'
import { DataProvider, useData } from '../lib/DataContext'
import { ThemeProvider, useTheme } from '../lib/ThemeContext'
import HomeView from './HomeView'
import ProjectsView from './ProjectsView'
import TasksView from './TasksView'
import LinksView from './LinksView'
import AgentsView from './AgentsView'
import SettingsView from './SettingsView'

const NAV_ITEMS = [
  { id: 'home',     label: 'Home',     icon: LayoutDashboard },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'tasks',    label: 'Tasks',    icon: CheckSquare },
  { id: 'links',    label: 'Links',    icon: Bookmark },
  { id: 'agents',   label: 'Agents',   icon: Bot },
  { id: 'settings', label: 'Settings', icon: Settings },
]

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-xl bg-cream-300 dark:bg-gray-800 hover:bg-cream-400 dark:hover:bg-gray-700 text-notion-text/80 dark:text-gray-400 hover:text-notion-text dark:hover:text-white transition-colors"
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  )
}

function AppShell() {
  const [view, setView] = useState('home')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { projects, tasks, bookmarks, hydrated } = useData()

  const pendingCount = tasks.filter(t => !t.completed).length
  const activeProjects = projects.filter(p => p.status === 'active').length

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center h-screen bg-cream-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-3 text-notion-muted dark:text-gray-500">
          <Compass size={32} className="animate-pulse text-blue-500" />
          <p className="text-sm">Loading your dashboard…</p>
        </div>
      </div>
    )
  }

  function NavItem({ item }) {
    const Icon = item.icon
    const isActive = view === item.id
    const badge = item.id === 'tasks' ? pendingCount : item.id === 'projects' ? activeProjects : item.id === 'links' ? bookmarks.length : 0
    return (
      <button
        onClick={() => { setView(item.id); setSidebarOpen(false) }}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
          isActive
            ? 'bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-600/30'
            : 'text-notion-muted dark:text-gray-400 hover:text-notion-text dark:hover:text-white hover:bg-cream-200 dark:hover:bg-gray-800'
        }`}
      >
        <Icon size={17} className={isActive ? 'text-blue-600 dark:text-blue-400' : ''} />
        <span className="flex-1 text-left">{item.label}</span>
        {badge > 0 && (
          <span className={`text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${
            isActive ? 'bg-blue-600/30 text-blue-600 dark:text-blue-300' : 'bg-cream-300 dark:bg-gray-700 text-notion-text/80 dark:text-gray-300'
          }`}>
            {badge}
          </span>
        )}
      </button>
    )
  }

  const currentView = {
    home:     <HomeView onNavigate={setView} />,
    projects: <ProjectsView />,
    tasks:    <TasksView />,
    links:    <LinksView />,
    agents:   <AgentsView />,
    settings: <SettingsView />,
  }[view]

  return (
    <div className="flex h-screen overflow-hidden bg-cream-50 dark:bg-gray-950">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 flex-shrink-0 bg-white dark:bg-gray-950 border-r border-cream-300 dark:border-gray-900">
        {/* Logo */}
        <div className="p-5 border-b border-cream-300 dark:border-gray-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
                <Compass size={16} className="text-white" />
              </div>
              <div>
                <div className="text-sm font-bold text-notion-text dark:text-white">Life Companion</div>
                <div className="text-xs text-notion-muted dark:text-gray-500">Your dashboard</div>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 overflow-y-auto">
          <div className="space-y-1">
            {NAV_ITEMS.filter(i => !['agents', 'settings'].includes(i.id)).map(item => (
              <NavItem key={item.id} item={item} />
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-cream-300 dark:border-gray-800">
            <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-notion-muted dark:text-gray-600">Automation</p>
            <NavItem item={NAV_ITEMS.find(i => i.id === 'agents')} />
          </div>
          <div className="mt-4 pt-4 border-t border-cream-300 dark:border-gray-800">
            <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-notion-muted dark:text-gray-600">Quick Access</p>
            <a
              href="https://onedrive.live.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-notion-muted dark:text-gray-400 hover:text-notion-text dark:hover:text-white hover:bg-cream-200 dark:hover:bg-gray-800 transition-all"
            >
              <Cloud size={17} />
              <span className="flex-1 text-left">OneDrive</span>
              <ExternalLink size={12} className="text-notion-muted dark:text-gray-600" />
            </a>
          </div>
          <div className="mt-4 pt-4 border-t border-cream-300 dark:border-gray-800 space-y-1">
            <NavItem item={NAV_ITEMS.find(i => i.id === 'settings')} />
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-cream-300 dark:border-gray-900">
          <p className="text-xs text-notion-muted dark:text-gray-600 text-center">
            Synced via Supabase
          </p>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 dark:bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-900 border-r border-cream-300 dark:border-gray-800 flex flex-col transform transition-transform duration-200 lg:hidden ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between p-5 border-b border-cream-300 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
              <Compass size={16} className="text-white" />
            </div>
            <span className="font-bold text-notion-text dark:text-white">Life Companion</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-cream-200 dark:hover:bg-gray-800 text-notion-muted dark:text-gray-400">
              <X size={18} />
            </button>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map(item => <NavItem key={item.id} item={item} />)}
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-cream-300 dark:border-gray-900 bg-white dark:bg-transparent flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-lg hover:bg-cream-200 dark:hover:bg-gray-800 text-notion-muted dark:text-gray-400">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Compass size={16} className="text-blue-500" />
            <span className="font-semibold text-sm text-notion-text dark:text-white">Life Companion</span>
          </div>
          <ThemeToggle />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {currentView}
        </div>

        {/* Mobile bottom nav */}
        <nav className="lg:hidden flex border-t border-cream-300 dark:border-gray-900 bg-white dark:bg-gray-950 flex-shrink-0 safe-bottom">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon
            const isActive = view === item.id
            const badge = item.id === 'tasks' ? pendingCount : 0
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`flex-1 flex flex-col items-center gap-1 py-2.5 transition-colors relative ${
                  isActive ? 'text-blue-500' : 'text-notion-muted dark:text-gray-500 hover:text-notion-text dark:hover:text-gray-300'
                }`}
              >
                <Icon size={20} />
                <span className="text-xs">{item.label}</span>
                {badge > 0 && (
                  <span className="absolute top-1.5 right-1/4 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </main>
    </div>
  )
}

export default function Dashboard() {
  return (
    <ThemeProvider>
      <DataProvider>
        <AppShell />
      </DataProvider>
    </ThemeProvider>
  )
}
