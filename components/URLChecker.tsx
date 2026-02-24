'use client';

import { useState, useCallback } from 'react';
import { useSettings } from '@/lib/store';
import axios from 'axios';
import { CheckCircle, AlertCircle, Clock, Zap } from 'lucide-react';

interface AnalyticsData {
  status: number | null;
  statusText: string;
  loadTime: number | null;
  headers: Record<string, string>;
  error: string | null;
  checked: boolean;
  checking: boolean;
}

export function URLChecker() {
  const { settings } = useSettings();
  const [urlInput, setUrlInput] = useState('');
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    status: null,
    statusText: '',
    loadTime: null,
    headers: {},
    error: null,
    checked: false,
    checking: false,
  });
  const [delayCounter, setDelayCounter] = useState(0);

  const formatUrl = (url: string): string => {
    if (!url) return '';
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return 'https://' + url;
    }
    return url;
  };

  const checkWebsite = useCallback(async () => {
    const url = formatUrl(urlInput);
    if (!url) {
      setAnalytics((prev) => ({ ...prev, error: 'Please enter a valid URL' }));
      return;
    }

    setAnalytics((prev) => ({ ...prev, checking: true, error: null }));
    const startTime = Date.now();

    try {
      const response = await axios.head(url, {
        timeout: 10000,
        validateStatus: () => true,
        headers: settings.userAgent ? { 'User-Agent': settings.userAgent } : {},
      });

      const loadTime = Date.now() - startTime;

      setAnalytics({
        status: response.status,
        statusText: response.statusText,
        loadTime,
        headers: response.headers as Record<string, string>,
        error: null,
        checked: true,
        checking: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reach website';
      setAnalytics((prev) => ({
        ...prev,
        error: errorMessage,
        status: null,
        checked: true,
        checking: false,
      }));
    }
  }, [urlInput, settings.userAgent]);

  const handleVisitWithDelay = async () => {
    if (settings.delayMode) {
      const seconds = settings.delaySeconds;
      for (let i = seconds; i > 0; i--) {
        setDelayCounter(i);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      setDelayCounter(0);
    }
    const url = formatUrl(urlInput);
    if (url) {
      window.open(url, '_blank');
    }
  };

  const isSuccess = analytics.status && analytics.status >= 200 && analytics.status < 400;
  const isError = analytics.status && (analytics.status >= 400 || analytics.status < 200);

  return (
    <div className="space-y-6">
      {/* URL Input */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Website URL
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && checkWebsite()}
            placeholder="Enter URL (e.g., example.com or https://example.com)"
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={checkWebsite}
            disabled={analytics.checking}
            className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {analytics.checking ? 'Checking...' : 'Check'}
          </button>
        </div>
      </div>

      {/* Analytics Display */}
      {analytics.checked && (
        <div className="space-y-4">
          {/* Status */}
          {analytics.error ? (
            <div className="flex gap-3 items-start p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-semibold text-red-900 dark:text-red-200">Connection Failed</p>
                <p className="text-red-700 dark:text-red-300 text-sm">{analytics.error}</p>
              </div>
            </div>
          ) : (
            <div className={`flex gap-3 items-start p-4 rounded-lg border ${
              isSuccess
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
            }`}>
              {isSuccess ? (
                <>
                  <CheckCircle className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="font-semibold text-green-900 dark:text-green-200">Website Accessible</p>
                    <p className="text-green-700 dark:text-green-300 text-sm">
                      Status: {analytics.status} {analytics.statusText}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="font-semibold text-yellow-900 dark:text-yellow-200">Status Warning</p>
                    <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                      Status: {analytics.status} {analytics.statusText}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Metrics */}
          {!analytics.error && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Clock className="text-primary flex-shrink-0" size={20} />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Load Time</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{analytics.loadTime}ms</p>
                </div>
              </div>
              <div className="flex gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Zap className="text-primary flex-shrink-0" size={20} />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Status Code</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{analytics.status}</p>
                </div>
              </div>
            </div>
          )}

          {/* Headers */}
          {Object.keys(analytics.headers).length > 0 && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Response Headers</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto text-sm">
                {Object.entries(analytics.headers).slice(0, 10).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-gray-700 dark:text-gray-300">
                    <span className="font-medium">{key}:</span>
                    <span className="text-gray-600 dark:text-gray-400 truncate">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Visit Button */}
      <div className="flex gap-2">
        <button
          onClick={handleVisitWithDelay}
          disabled={!urlInput || delayCounter > 0}
          className={`flex-1 px-4 py-3 rounded-lg font-medium transition text-white ${
            delayCounter > 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-success hover:bg-emerald-600'
          }`}
        >
          {delayCounter > 0 ? `Opening in ${delayCounter}s...` : 'Visit Website'}
        </button>
      </div>

      {/* Settings Info */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-blue-800 dark:text-blue-300">
        <p className="font-medium">Current Settings:</p>
        <ul className="mt-2 space-y-1 text-xs">
          <li>• Device: {settings.deviceMode.charAt(0).toUpperCase() + settings.deviceMode.slice(1)}</li>
          <li>• Display: {settings.displayWidth}x{settings.displayHeight}px</li>
          <li>• Anonymous Mode: {settings.anonymousMode ? 'ON' : 'OFF'}</li>
          <li>• Fake IP: {settings.fakeIp ? 'ON' : 'OFF'}</li>
          {settings.delayMode && <li>• Delay Mode: {settings.delaySeconds}s</li>}
        </ul>
      </div>
    </div>
  );
}
