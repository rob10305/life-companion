'use client'
import { useState } from 'react'
import { Youtube, ExternalLink, RefreshCw } from 'lucide-react'

const YOUTUBE_APP_URL = 'https://web-production-8946f.up.railway.app/library'

export default function YouTubeView() {
  const [loading, setLoading] = useState(true)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 p-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-notion-text dark:text-white">YouTube</h1>
            <p className="text-sm text-notion-muted dark:text-gray-400 mt-0.5">Video summarizer &amp; library</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setLoading(true); document.getElementById('youtube-frame')?.setAttribute('src', YOUTUBE_APP_URL) }}
              title="Reload"
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-cream-200 dark:bg-gray-800 hover:bg-cream-300 dark:hover:bg-gray-700 border border-cream-400 dark:border-gray-700 text-notion-muted dark:text-gray-400 hover:text-notion-text dark:hover:text-white transition-colors"
            >
              <RefreshCw size={15} />
            </button>
            <a
              href={YOUTUBE_APP_URL}
              target="_blank"
              rel="noopener noreferrer"
              title="Open in new tab"
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-cream-200 dark:bg-gray-800 hover:bg-cream-300 dark:hover:bg-gray-700 border border-cream-400 dark:border-gray-700 text-notion-muted dark:text-gray-400 hover:text-notion-text dark:hover:text-white transition-colors"
            >
              <ExternalLink size={15} />
            </a>
          </div>
        </div>
      </div>

      {/* Iframe */}
      <div className="flex-1 px-6 pb-6 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center mx-6 mb-6 bg-white dark:bg-gray-900 rounded-2xl border border-cream-300 dark:border-gray-800 z-10">
            <div className="flex flex-col items-center gap-3 text-notion-muted dark:text-gray-500">
              <Youtube size={32} className="text-red-500 animate-pulse" />
              <p className="text-sm">Loading YouTube library...</p>
            </div>
          </div>
        )}
        <iframe
          id="youtube-frame"
          src={YOUTUBE_APP_URL}
          onLoad={() => setLoading(false)}
          className="w-full h-full rounded-2xl border border-cream-300 dark:border-gray-800 bg-white dark:bg-gray-900"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  )
}
