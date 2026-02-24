'use client';

import { useState, useEffect } from 'react';
import { URLChecker } from '@/components/URLChecker';
import { WebsiteViewer } from '@/components/WebsiteViewer';
import { SettingsPanel } from '@/components/SettingsPanel';
import { useSettings } from '@/lib/store';
import { Settings, Eye } from 'lucide-react';

export default function Home() {
  const [urlToView, setUrlToView] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { settings } = useSettings();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className={settings.darkMode ? 'dark' : ''}>
      <main className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
        {/* Header */}
        <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Eye className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">CheckWeb</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Advanced Website Analyzer</p>
              </div>
            </div>

            <button
              onClick={() => setSettingsOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition font-medium"
            >
              <Settings size={20} />
              Admin Settings
            </button>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Panel - URL Checker */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  Website Checker
                </h2>
                <URLChecker onUrlChange={setUrlToView} />
              </div>
            </div>

            {/* Right Panel - Website Preview */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  Live Preview
                </h2>
                <WebsiteViewer url={urlToView} onUrlChange={setUrlToView} />
              </div>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-200">📊 Analytics</p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                Check website status, load times, and response headers
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <p className="text-sm font-medium text-purple-900 dark:text-purple-200">🔒 Privacy</p>
              <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                Anonymous mode and fake IP options for secure testing
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <p className="text-sm font-medium text-green-900 dark:text-green-200">⚙️ Customizable</p>
              <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                Adjust display size, device mode, and many more options
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Settings Panel */}
      <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
