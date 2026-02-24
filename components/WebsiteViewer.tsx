'use client';

import { useState } from 'react';
import { useSettings } from '@/lib/store';
import { Maximize2, Minimize2 } from 'lucide-react';

interface WebsiteViewerProps {
  url: string;
}

export function WebsiteViewer({ url }: WebsiteViewerProps) {
  const { settings } = useSettings();
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!url) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400">Check a website to preview it here</p>
      </div>
    );
  }

  const iframeSrc = `/api/proxy?url=${encodeURIComponent(url)}&anonymousMode=${settings.anonymousMode}&fakeIp=${settings.fakeIp}`;

  return (
    <div className={`space-y-4 ${isFullscreen ? 'fixed inset-0 z-50 p-4 bg-gray-900' : ''}`}>
      {/* Controls */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex-1">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Preview</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{url}</p>
        </div>
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition ml-2"
          title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
        </button>
      </div>

      {/* Iframe Container */}
      <div
        className={`rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800 ${
          isFullscreen ? 'flex-1' : ''
        }`}
        style={
          isFullscreen
            ? { width: '100%', height: 'calc(100% - 80px)' }
            : {
                width: '100%',
                height: Math.max(settings.displayHeight, 600),
              }
        }
      >
        <iframe
          src={iframeSrc}
          className="w-full h-full border-none"
          title="Website Preview"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-top-navigation allow-presentation"
          style={
            !isFullscreen
              ? {
                  width: settings.displayWidth,
                  height: settings.displayHeight,
                  transform: 'scale(1)',
                  transformOrigin: 'top left',
                  overflow: 'auto',
                }
              : undefined
          }
        />
      </div>

      {/* Info */}
      <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
        Viewing at {settings.displayWidth}×{settings.displayHeight}px ({settings.deviceMode} mode)
      </div>
    </div>
  );
}
