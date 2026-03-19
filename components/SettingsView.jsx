'use client'
import { useState, useRef } from 'react'
import { Download, Upload, RefreshCw, Info, ExternalLink } from 'lucide-react'
import { useData } from '../lib/DataContext'

export default function SettingsView() {
  const { exportData, importData, resetToDefaults } = useData()
  const fileRef = useRef()
  const [importStatus, setImportStatus] = useState(null)

  function handleImport(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const success = importData(ev.target.result)
      setImportStatus(success ? 'success' : 'error')
      setTimeout(() => setImportStatus(null), 3000)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  function handleReset() {
    if (confirm('Reset all data to defaults? Your current data will be lost.')) {
      resetToDefaults()
    }
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto p-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Settings</h1>

      <div className="space-y-4 max-w-lg">
        {/* Sync info */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <Info size={18} className="text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-blue-300 mb-1">Storage & Cross-Device Sync</h3>
              <p className="text-xs text-blue-200/70 leading-relaxed">
                Your data is currently saved in <strong>browser localStorage</strong> on this device only.
                To sync across all your devices, add Supabase credentials to <code className="bg-blue-900/40 px-1 rounded">.env.local</code>.
              </p>
              <a
                href="https://supabase.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-2 text-xs text-blue-400 hover:text-blue-300"
              >
                Set up Supabase (free) <ExternalLink size={11} />
              </a>
              <p className="text-xs text-blue-200/50 mt-2">
                See the <code className="bg-blue-900/40 px-1 rounded">SETUP.md</code> file in the project for full instructions.
              </p>
            </div>
          </div>
        </div>

        {/* Backup */}
        <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Backup & Restore</h3>
          <p className="text-xs text-slate-500 dark:text-gray-400 mb-4">
            Export your data as JSON to back it up or transfer to another browser. Save this file to OneDrive for manual cross-device access.
          </p>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={exportData}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 border border-slate-300 dark:border-gray-700 text-slate-900 dark:text-white rounded-xl text-sm font-medium transition-colors"
            >
              <Download size={15} /> Export Data
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 border border-slate-300 dark:border-gray-700 text-slate-900 dark:text-white rounded-xl text-sm font-medium transition-colors"
            >
              <Upload size={15} /> Import Data
            </button>
            <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
          </div>
          {importStatus === 'success' && (
            <p className="mt-3 text-xs text-green-400">Data imported successfully!</p>
          )}
          {importStatus === 'error' && (
            <p className="mt-3 text-xs text-red-400">Import failed — invalid file format.</p>
          )}
        </div>

        {/* Reset */}
        <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Reset to Defaults</h3>
          <p className="text-xs text-slate-500 dark:text-gray-400 mb-4">
            Clear all your data and restore the sample content. Export a backup first!
          </p>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl text-sm font-medium transition-colors"
          >
            <RefreshCw size={15} /> Reset All Data
          </button>
        </div>

        {/* About */}
        <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">About</h3>
          <div className="space-y-2 text-xs text-slate-500 dark:text-gray-400">
            <p><span className="text-slate-600 dark:text-gray-300 font-medium">Life Companion</span> — your personal dashboard</p>
            <p>Built with Next.js, Tailwind CSS, and local storage persistence.</p>
            <p>Deploy to Vercel or Netlify for access anywhere. Add Supabase for real-time sync across all devices.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
