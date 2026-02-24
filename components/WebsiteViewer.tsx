'use client';

import { useState, useMemo } from 'react';
import { useSettings } from '@/lib/store';
import { Maximize2, Minimize2, Copy, RotateCcw, Plus, Trash2 } from 'lucide-react';

interface WebsiteViewerProps {
  url: string;
  onUrlChange?: (url: string) => void;
}

interface URLParam {
  key: string;
  value: string;
}

function parseUrl(urlString: string) {
  try {
    const url = new URL(urlString);
    const params: URLParam[] = [];
    url.searchParams.forEach((value, key) => {
      params.push({ key, value });
    });
    return {
      protocol: url.protocol.replace(':', ''),
      domain: url.hostname,
      port: url.port,
      path: url.pathname,
      params,
      hash: url.hash.replace('#', ''),
      fullUrl: urlString,
    };
  } catch {
    return null;
  }
}

function buildUrl(parsed: any, params: URLParam[]): string {
  const urlObj = new URL(`${parsed.protocol}://${parsed.domain}${parsed.port ? ':' + parsed.port : ''}${parsed.path}`);
  params.forEach((param) => {
    if (param.key && param.value) {
      urlObj.searchParams.set(param.key, param.value);
    }
  });
  if (parsed.hash) {
    urlObj.hash = parsed.hash;
  }
  return urlObj.toString();
}

export function WebsiteViewer({ url, onUrlChange }: WebsiteViewerProps) {
  const { settings } = useSettings();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'editor'>('preview');
  const [editedParams, setEditedParams] = useState<URLParam[]>([]);
  const [editedHash, setEditedHash] = useState('');

  const parsedUrl = useMemo(() => parseUrl(url), [url]);

  const currentParams = useMemo(() => {
    if (!editedParams.length && parsedUrl) {
      return parsedUrl.params;
    }
    return editedParams;
  }, [editedParams, parsedUrl]);

  const modifiedUrl = useMemo(() => {
    if (!parsedUrl) return url;
    return buildUrl(parsedUrl, currentParams);
  }, [parsedUrl, currentParams]);

  const handleParamChange = (index: number, field: 'key' | 'value', value: string) => {
    const newParams = [...currentParams];
    newParams[index] = { ...newParams[index], [field]: value };
    setEditedParams(newParams);
  };

  const handleAddParam = () => {
    setEditedParams([...currentParams, { key: '', value: '' }]);
  };

  const handleRemoveParam = (index: number) => {
    const newParams = currentParams.filter((_, i) => i !== index);
    setEditedParams(newParams);
  };

  const handleAddPreset = (preset: 'marketing' | 'tracking') => {
    const newParams = [...currentParams];
    if (preset === 'marketing') {
      newParams.push({ key: 'utm_source', value: 'test' });
      newParams.push({ key: 'utm_medium', value: 'test' });
      newParams.push({ key: 'utm_campaign', value: 'test' });
    } else if (preset === 'tracking') {
      newParams.push({ key: 'ref', value: 'test' });
      newParams.push({ key: 'cid', value: 'test' });
    }
    setEditedParams(newParams);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(modifiedUrl);
  };

  const handleReset = () => {
    setEditedParams([]);
    setEditedHash('');
  };

  const handleApplyUrl = () => {
    if (onUrlChange) {
      onUrlChange(modifiedUrl);
    }
  };

  if (!url) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400">Check a website to preview it here</p>
      </div>
    );
  }

  const iframeSrc = `/api/proxy?url=${encodeURIComponent(modifiedUrl)}&anonymousMode=${settings.anonymousMode}&fakeIp=${settings.fakeIp}`;

  return (
    <div className={`space-y-4 ${isFullscreen ? 'fixed inset-0 z-50 p-4 bg-gray-900' : ''}`}>
      {/* Controls */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Preview</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{modifiedUrl}</p>
        </div>
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition ml-2 flex-shrink-0"
          title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('preview')}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition ${
            activeTab === 'preview'
              ? 'text-primary border-primary'
              : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Preview
        </button>
        <button
          onClick={() => setActiveTab('editor')}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition ${
            activeTab === 'editor'
              ? 'text-primary border-primary'
              : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          URL Editor
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'preview' ? (
        <>
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
        </>
      ) : (
        <div className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          {/* URL Breakdown */}
          {parsedUrl && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">URL Structure</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Protocol</label>
                  <input
                    type="text"
                    value={parsedUrl.protocol}
                    readOnly
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Domain</label>
                  <input
                    type="text"
                    value={parsedUrl.domain}
                    readOnly
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white cursor-not-allowed"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Path</label>
                  <input
                    type="text"
                    value={parsedUrl.path}
                    readOnly
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Parameters Editor */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">Query Parameters</h3>
              <button
                onClick={handleAddParam}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-primary text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Plus size={16} />
                Add
              </button>
            </div>

            {currentParams.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No query parameters</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {currentParams.map((param, index) => (
                  <div key={index} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Key</label>
                      <input
                        type="text"
                        value={param.key}
                        onChange={(e) => handleParamChange(index, 'key', e.target.value)}
                        placeholder="Parameter name"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Value</label>
                      <input
                        type="text"
                        value={param.value}
                        onChange={(e) => handleParamChange(index, 'value', e.target.value)}
                        placeholder="Parameter value"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <button
                      onClick={() => handleRemoveParam(index)}
                      className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg transition"
                      title="Remove parameter"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Presets */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Quick Presets</p>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => handleAddPreset('marketing')}
                className="px-3 py-2 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition"
              >
                + Marketing (UTM)
              </button>
              <button
                onClick={() => handleAddPreset('tracking')}
                className="px-3 py-2 text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition"
              >
                + Tracking
              </button>
            </div>
          </div>

          {/* Final URL */}
          <div className="space-y-3 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Modified URL</p>
            <div className="flex gap-2 items-start">
              <input
                type="text"
                value={modifiedUrl}
                readOnly
                className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white break-all cursor-text"
              />
              <button
                onClick={handleCopyUrl}
                className="p-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition flex-shrink-0"
                title="Copy URL"
              >
                <Copy size={18} />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleApplyUrl}
              className="flex-1 px-4 py-3 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Apply & Preview
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition flex items-center gap-2"
            >
              <RotateCcw size={18} />
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
