'use client';

import { useState } from 'react';
import { useSettings } from '@/lib/store';
import { X } from 'lucide-react';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { settings, updateSettings, resetSettings } = useSettings();
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-2xl w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Display Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Display Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Display Width (px)
                </label>
                <input
                  type="number"
                  value={settings.displayWidth}
                  onChange={(e) => updateSettings({ displayWidth: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  min="320"
                  max="1920"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Display Height (px)
                </label>
                <input
                  type="number"
                  value={settings.displayHeight}
                  onChange={(e) => updateSettings({ displayHeight: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  min="480"
                  max="1440"
                />
              </div>
            </div>
          </div>

          {/* Device Mode */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Device Mode</h3>
            <div className="flex gap-4">
              {(['desktop', 'tablet', 'mobile'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => updateSettings({ deviceMode: mode })}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    settings.deviceMode === mode
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Privacy & Security */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Privacy & Security</h3>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.anonymousMode}
                onChange={(e) => updateSettings({ anonymousMode: e.target.checked })}
                className="w-4 h-4 cursor-pointer"
              />
              <span className="text-gray-700 dark:text-gray-300">Anonymous Mode (Hide IP)</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.fakeIp}
                onChange={(e) => updateSettings({ fakeIp: e.target.checked })}
                className="w-4 h-4 cursor-pointer"
              />
              <span className="text-gray-700 dark:text-gray-300">Use Fake IP Address</span>
            </label>
          </div>

          {/* Delay Settings */}
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.delayMode}
                onChange={(e) => updateSettings({ delayMode: e.target.checked })}
                className="w-4 h-4 cursor-pointer"
              />
              <span className="text-gray-700 dark:text-gray-300">Enable Delay Mode</span>
            </label>

            {settings.delayMode && (
              <div className="ml-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Delay Duration (seconds)
                </label>
                <input
                  type="number"
                  value={settings.delaySeconds}
                  onChange={(e) => updateSettings({ delaySeconds: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  min="1"
                  max="60"
                />
              </div>
            )}
          </div>

          {/* Theme */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Theme</h3>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.darkMode}
                onChange={(e) => updateSettings({ darkMode: e.target.checked })}
                className="w-4 h-4 cursor-pointer"
              />
              <span className="text-gray-700 dark:text-gray-300">Dark Mode</span>
            </label>
          </div>

          {/* User Agent */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Custom User Agent</h3>
            <textarea
              value={settings.userAgent}
              onChange={(e) => updateSettings({ userAgent: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              rows={3}
              placeholder="Leave empty for default User-Agent"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={resetSettings}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg font-medium transition"
          >
            Reset to Default
          </button>
          <button
            onClick={() => {
              handleSave();
              onClose();
            }}
            className={`flex-1 px-4 py-2 bg-primary text-white rounded-lg font-medium transition ${
              saving ? 'opacity-50' : 'hover:bg-blue-700'
            }`}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
