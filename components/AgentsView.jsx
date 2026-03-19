'use client'
import { useState } from 'react'
import {
  Bot, Play, Pause, Settings, Clock, ExternalLink,
  Car, Podcast, Youtube, Plus, AlertCircle, CheckCircle2,
  Zap, Calendar, Wrench, Pencil, Trash2, Globe
} from 'lucide-react'
import { useData } from '../lib/DataContext'

const AGENT_STATUS = {
  coming_soon: { label: 'Coming Soon', color: 'text-gray-500', bg: 'bg-gray-500/10', border: 'border-gray-500/20' },
  configured: { label: 'Ready', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
  running:    { label: 'Running', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
  paused:     { label: 'Paused', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  error:      { label: 'Error', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
}

const INITIAL_AGENTS = [
  {
    id: 'car-parts-mp',
    name: 'Car Parts on MP',
    description: 'Scans Facebook Marketplace, Kijiji, and auto parts sites for deals on parts you\'re watching. Alerts you when bargains appear.',
    icon: Car,
    color: '#EF4444',
    status: 'coming_soon',
    schedule: 'Every 2 hours',
    capabilities: [
      'Search multiple marketplaces simultaneously',
      'Price comparison against known fair values',
      'Instant notification on bargain matches',
      'Track specific parts by make/model/year',
    ],
    config: {
      searchTerms: [],
      maxPrice: null,
      sources: ['Facebook Marketplace', 'Kijiji', 'AutoTrader Parts'],
      notifyVia: 'dashboard',
    },
    lastRun: null,
    nextRun: null,
  },
  {
    id: 'podcasts',
    name: 'Tech Podcasts',
    description: 'Creates a condensed daily podcast from the top tech articles posted in the last 48 hours. AI-narrated summary you can listen to on your commute.',
    icon: Podcast,
    color: '#8B5CF6',
    status: 'coming_soon',
    schedule: 'Daily at 6:00 AM',
    capabilities: [
      'Aggregates top tech news from 20+ sources',
      'AI-generated audio summary (10-15 min)',
      'Covers: AI/ML, dev tools, cloud, startups',
      'Available as downloadable MP3 or stream',
    ],
    config: {
      topics: ['AI & Machine Learning', 'Web Development', 'Cloud & DevOps', 'Startups'],
      sources: ['Hacker News', 'TechCrunch', 'The Verge', 'Ars Technica', 'Dev.to'],
      duration: '10-15 min',
      voice: 'natural',
    },
    lastRun: null,
    nextRun: null,
  },
  {
    id: 'watch-list',
    name: 'YouTube Watch List',
    description: 'Curates must-watch YouTube content from your favourite channels and topics. Surfaces the best videos so you never miss great content.',
    icon: Youtube,
    color: '#EF4444',
    status: 'coming_soon',
    schedule: 'Every 12 hours',
    capabilities: [
      'Monitor subscribed channels for new uploads',
      'Rank by relevance to your interests',
      'Filter out low-quality or clickbait content',
      'Weekly digest of top picks',
    ],
    config: {
      topics: ['Tech Reviews', 'Programming Tutorials', 'Car Restoration', 'AI News'],
      channels: [],
      minRating: 'high',
      digestDay: 'Monday',
    },
    lastRun: null,
    nextRun: null,
  },
]

const INITIAL_TOOLS = [
  { id: 'tool-flow', title: 'Google Flow', url: 'https://labs.google/flow/about', icon: '🌊' },
  { id: 'tool-chatgpt', title: 'ChatGPT', url: 'https://chat.openai.com', icon: '💬' },
  { id: 'tool-gemini', title: 'Gemini', url: 'https://gemini.google.com', icon: '✨' },
  { id: 'tool-claude', title: 'Claude', url: 'https://claude.ai', icon: '🧠' },
]

function ToolsSection() {
  const { bookmarks, addBookmark, deleteBookmark } = useData()
  const [showAdd, setShowAdd] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newUrl, setNewUrl] = useState('')

  // Tools are bookmarks with category 'ai-tools'
  const tools = bookmarks.filter(b => b.category === 'ai-tools')

  // Seed tools if none exist
  const [seeded, setSeeded] = useState(false)
  if (!seeded && tools.length === 0 && bookmarks.length > 0) {
    // Only seed once
    setSeeded(true)
    INITIAL_TOOLS.forEach(tool => {
      addBookmark({ title: tool.title, url: tool.url, description: tool.icon, category: 'ai-tools' })
    })
  }

  function handleAdd(e) {
    e.preventDefault()
    if (!newTitle.trim() || !newUrl.trim()) return
    let url = newUrl.trim()
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url
    addBookmark({ title: newTitle.trim(), url, description: '🔧', category: 'ai-tools' })
    setNewTitle('')
    setNewUrl('')
    setShowAdd(false)
  }

  function handleDelete(id) {
    deleteBookmark(id)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Wrench size={16} className="text-notion-muted dark:text-gray-500" />
          <h2 className="text-sm font-semibold text-notion-text dark:text-white">AI Tools</h2>
          <span className="text-xs text-notion-muted dark:text-gray-600">{tools.length}</span>
        </div>
        <button
          onClick={() => setShowAdd(v => !v)}
          className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-400 transition-colors"
        >
          <Plus size={13} /> Add Tool
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <form onSubmit={handleAdd} className="bg-white dark:bg-gray-900 border border-cream-300 dark:border-gray-800 rounded-xl p-3 mb-3 flex gap-2 items-end">
          <div className="flex-1">
            <input
              autoFocus
              type="text"
              placeholder="Tool name"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              className="w-full bg-cream-200 dark:bg-gray-800 border border-cream-400 dark:border-gray-700 rounded-lg px-3 py-2 text-notion-text dark:text-white placeholder-notion-muted dark:placeholder-gray-500 text-xs focus:outline-none focus:border-blue-500 mb-1.5"
            />
            <input
              type="text"
              placeholder="https://..."
              value={newUrl}
              onChange={e => setNewUrl(e.target.value)}
              className="w-full bg-cream-200 dark:bg-gray-800 border border-cream-400 dark:border-gray-700 rounded-lg px-3 py-2 text-notion-text dark:text-white placeholder-notion-muted dark:placeholder-gray-500 text-xs focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex gap-1.5">
            <button type="submit" className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors">
              Add
            </button>
            <button type="button" onClick={() => setShowAdd(false)} className="px-3 py-2 bg-cream-200 dark:bg-gray-800 hover:bg-cream-300 dark:hover:bg-gray-700 text-notion-muted dark:text-gray-400 rounded-lg text-xs transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Tools grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2">
        {tools.map(tool => {
          let favicon = null
          try { favicon = `https://www.google.com/s2/favicons?sz=32&domain=${new URL(tool.url).hostname}` } catch {}
          return (
            <div key={tool.id} className="group relative">
              <a
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-cream-300 dark:border-gray-800 hover:border-cream-400 dark:hover:border-gray-700 hover:bg-cream-200/50 dark:hover:bg-gray-800 transition-all"
              >
                <div className="w-7 h-7 rounded-lg bg-cream-200 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {favicon ? (
                    <img src={favicon} alt="" className="w-4 h-4" />
                  ) : (
                    <Globe size={14} className="text-notion-muted dark:text-gray-500" />
                  )}
                </div>
                <span className="text-xs font-medium text-notion-text dark:text-white truncate">{tool.title}</span>
                <ExternalLink size={10} className="text-notion-muted dark:text-gray-600 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
              <button
                onClick={() => handleDelete(tool.id)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              >
                <Trash2 size={10} />
              </button>
            </div>
          )
        })}
      </div>

      {tools.length === 0 && !showAdd && (
        <div className="text-center py-6 text-notion-muted dark:text-gray-600 text-xs">
          No tools added yet. Click "Add Tool" to get started.
        </div>
      )}
    </div>
  )
}

function AgentCard({ agent }) {
  const [expanded, setExpanded] = useState(false)
  const statusInfo = AGENT_STATUS[agent.status]
  const Icon = agent.icon

  return (
    <div className="bg-white dark:bg-gray-900 border rounded-2xl overflow-hidden transition-all" style={{ borderColor: agent.color + '30' }}>
      {/* Color bar */}
      <div className="h-1" style={{ background: agent.color }} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: agent.color + '20', border: `1px solid ${agent.color}40` }}
          >
            <Icon size={22} style={{ color: agent.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-notion-text dark:text-white">{agent.name}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusInfo.bg} ${statusInfo.color} ${statusInfo.border} border`}>
                {statusInfo.label}
              </span>
            </div>
            <p className="text-xs text-notion-muted dark:text-gray-400 mt-1 leading-relaxed">{agent.description}</p>
          </div>
        </div>

        {/* Schedule */}
        <div className="flex items-center gap-4 mt-4 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-notion-muted dark:text-gray-500">
            <Clock size={12} />
            <span>{agent.schedule}</span>
          </div>
          {agent.lastRun && (
            <div className="flex items-center gap-1.5 text-xs text-notion-muted dark:text-gray-500">
              <CheckCircle2 size={12} className="text-green-500" />
              <span>Last run: {agent.lastRun}</span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-4">
          {agent.status === 'coming_soon' ? (
            <button
              disabled
              className="flex items-center gap-2 px-4 py-2 bg-cream-200 dark:bg-gray-800 border border-cream-400 dark:border-gray-700 text-notion-muted dark:text-gray-500 rounded-xl text-xs font-medium cursor-not-allowed"
            >
              <Zap size={13} /> Coming Soon
            </button>
          ) : agent.status === 'running' ? (
            <button className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/30 text-orange-400 rounded-xl text-xs font-medium hover:bg-orange-500/20 transition-colors">
              <Pause size={13} /> Pause
            </button>
          ) : (
            <button className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl text-xs font-medium hover:bg-green-500/20 transition-colors">
              <Play size={13} /> Start Agent
            </button>
          )}
          <button
            onClick={() => setExpanded(v => !v)}
            className="flex items-center gap-2 px-4 py-2 bg-cream-200 dark:bg-gray-800 border border-cream-400 dark:border-gray-700 text-notion-text/80 dark:text-gray-300 rounded-xl text-xs font-medium hover:bg-cream-300 dark:hover:bg-gray-700 transition-colors"
          >
            <Settings size={13} /> {expanded ? 'Hide Details' : 'Details'}
          </button>
        </div>

        {/* Expanded details */}
        {expanded && (
          <div className="mt-4 space-y-4">
            {/* Capabilities */}
            <div>
              <h4 className="text-xs font-semibold text-notion-text/80 dark:text-gray-300 mb-2">Capabilities</h4>
              <ul className="space-y-1.5">
                {agent.capabilities.map((cap, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-notion-muted dark:text-gray-400">
                    <CheckCircle2 size={12} className="flex-shrink-0 mt-0.5" style={{ color: agent.color }} />
                    {cap}
                  </li>
                ))}
              </ul>
            </div>

            {/* Config preview */}
            {agent.config && (
              <div>
                <h4 className="text-xs font-semibold text-notion-text/80 dark:text-gray-300 mb-2">Configuration</h4>
                <div className="bg-cream-200 dark:bg-gray-800 rounded-xl p-3 space-y-2">
                  {Object.entries(agent.config).map(([key, value]) => (
                    <div key={key} className="flex items-start gap-2 text-xs">
                      <span className="text-notion-muted dark:text-gray-500 min-w-[80px] capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                      <span className="text-notion-text/80 dark:text-gray-300">
                        {Array.isArray(value)
                          ? value.length > 0 ? value.join(', ') : 'Not configured yet'
                          : value || 'Not set'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Build prompt */}
            {agent.status === 'coming_soon' && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
                <p className="text-xs text-blue-300 leading-relaxed">
                  This agent is a placeholder. When you're ready to build it, we'll set up the automation,
                  configure the data sources, and get it running on a schedule.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function AgentsView() {
  const agents = INITIAL_AGENTS

  const runningCount = agents.filter(a => a.status === 'running').length
  const totalCount = agents.length

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 p-6 pb-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-notion-text dark:text-white">Agents</h1>
            <p className="text-sm text-notion-muted dark:text-gray-400 mt-0.5">
              {runningCount} running · {totalCount} total
            </p>
          </div>
          <button
            disabled
            className="flex items-center gap-2 px-4 py-2.5 bg-cream-200 dark:bg-gray-800 border border-cream-400 dark:border-gray-700 text-notion-muted dark:text-gray-500 rounded-xl font-medium text-sm cursor-not-allowed"
            title="Coming soon"
          >
            <Plus size={16} />
            New Agent
          </button>
        </div>

        {/* Info banner */}
        <div className="bg-white dark:bg-gray-900 border border-cream-300 dark:border-gray-800 rounded-xl p-4 mt-4">
          <div className="flex items-start gap-3">
            <Bot size={18} className="text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-notion-text dark:text-white mb-1">Your AI Agents</h3>
              <p className="text-xs text-notion-muted dark:text-gray-400 leading-relaxed">
                Agents are automated assistants that run on a schedule to keep you informed.
                Each one monitors specific sources and surfaces what matters to you.
                Click "Details" on any agent to see its capabilities and configuration.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Agent cards */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-8">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {agents.map(agent => (
            <AgentCard key={agent.id} agent={agent} />
          ))}

          {/* Add agent placeholder */}
          <button
            disabled
            className="border-2 border-dashed border-cream-400 dark:border-gray-800 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 text-notion-muted dark:text-gray-600 min-h-[200px] cursor-not-allowed"
          >
            <Bot size={28} className="opacity-40" />
            <span className="text-sm font-medium">Add Custom Agent</span>
            <span className="text-xs text-cream-400 dark:text-gray-700">Build your own automation</span>
          </button>
        </div>

        {/* AI Tools section */}
        <ToolsSection />
      </div>
    </div>
  )
}
