'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Settings as SettingsIcon, 
  Clock, 
  Palette, 
  Database,
  Download,
  Upload,
  RefreshCw,
  Globe,
  Bell,
  Keyboard,
  Shield,
  Trash2
} from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    timezone: 'Asia/Kolkata',
    theme: 'light',
    weekStart: 'Saturday',
    language: 'en',
    notifications: {
      dailyReminder: true,
      weeklyReview: true,
      mockReminders: true,
      deadlineAlerts: true,
    },
    privacy: {
      analyticsTracking: false,
      crashReporting: true,
      usageStatistics: false,
    },
    display: {
      compactMode: false,
      showProgressBars: true,
      defaultView: 'today',
    }
  });

  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);

  const timezones = [
    { value: 'Asia/Kolkata', label: 'India Standard Time (IST)' },
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
    { value: 'Europe/Berlin', label: 'Central European Time (CET)' },
    { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
    { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)' },
  ];

  const themes = [
    { value: 'light', label: 'Light', description: 'Classic light theme' },
    { value: 'dark', label: 'Dark', description: 'Easy on the eyes' },
    { value: 'system', label: 'System', description: 'Follow system preference' },
  ];

  const updateSetting = (path: string, value: boolean | string) => {
    setSettings(prev => {
      const keys = path.split('.');
      const updated = { ...prev };
      let current: Record<string, unknown> = updated as Record<string, unknown>;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]] = { ...(current[keys[i]] as Record<string, unknown>) };
      }
      
      current[keys[keys.length - 1]] = value;
      return updated;
    });
  };

  const exportData = async () => {
    setIsExporting(true);
    
    try {
      // In real app, this would export the SQLite database
      const data = {
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        settings,
        // Add actual data export here
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `llm-prep-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const importData = async (file: File) => {
    setIsImporting(true);
    
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      // Validate import data
      if (data.version && data.settings) {
        setSettings(data.settings);
        // In real app, would import database data here
        alert('Data imported successfully!');
      } else {
        alert('Invalid backup file format');
      }
    } catch (error) {
      console.error('Import failed:', error);
      alert('Import failed. Please check the file format.');
    } finally {
      setIsImporting(false);
    }
  };

  const resetSettings = () => {
    setSettings({
      timezone: 'Asia/Kolkata',
      theme: 'light',
      weekStart: 'Saturday',
      language: 'en',
      notifications: {
        dailyReminder: true,
        weeklyReview: true,
        mockReminders: true,
        deadlineAlerts: true,
      },
      privacy: {
        analyticsTracking: false,
        crashReporting: true,
        usageStatistics: false,
      },
      display: {
        compactMode: false,
        showProgressBars: true,
        defaultView: 'today',
      }
    });
    setShowResetDialog(false);
  };

  const getCurrentTime = () => {
    return new Date().toLocaleString('en-US', { 
      timeZone: settings.timezone,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">
          Customize your experience and manage your data.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              General
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Timezone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="h-4 w-4 inline mr-1" />
                Timezone
              </label>
              <select 
                value={settings.timezone}
                onChange={(e) => updateSetting('timezone', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                {timezones.map(tz => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Current time: {getCurrentTime()}
              </p>
            </div>

            {/* Theme */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Palette className="h-4 w-4 inline mr-1" />
                Theme
              </label>
              <div className="space-y-2">
                {themes.map(theme => (
                  <label key={theme.value} className="flex items-center">
                    <input
                      type="radio"
                      name="theme"
                      value={theme.value}
                      checked={settings.theme === theme.value}
                      onChange={(e) => updateSetting('theme', e.target.value)}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium">{theme.label}</div>
                      <div className="text-sm text-gray-500">{theme.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Week Start */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Globe className="h-4 w-4 inline mr-1" />
                Week Starts On
              </label>
              <select 
                value={settings.weekStart}
                onChange={(e) => updateSetting('weekStart', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
                <option value="Monday">Monday</option>
              </select>
            </div>

            {/* Default View */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default View
              </label>
              <select 
                value={settings.display.defaultView}
                onChange={(e) => updateSetting('display.defaultView', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="today">Today</option>
                <option value="calendar">Calendar</option>
                <option value="problems">Problems</option>
                <option value="analytics">Analytics</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span className="text-sm font-medium">Daily Reminder</span>
                <input
                  type="checkbox"
                  checked={settings.notifications.dailyReminder}
                  onChange={(e) => updateSetting('notifications.dailyReminder', e.target.checked)}
                  className="w-4 h-4"
                />
              </label>
              <p className="text-xs text-gray-500">Get reminded about today&apos;s tasks</p>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span className="text-sm font-medium">Weekly Review</span>
                <input
                  type="checkbox"
                  checked={settings.notifications.weeklyReview}
                  onChange={(e) => updateSetting('notifications.weeklyReview', e.target.checked)}
                  className="w-4 h-4"
                />
              </label>
              <p className="text-xs text-gray-500">Friday evening progress review</p>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span className="text-sm font-medium">Mock Reminders</span>
                <input
                  type="checkbox"
                  checked={settings.notifications.mockReminders}
                  onChange={(e) => updateSetting('notifications.mockReminders', e.target.checked)}
                  className="w-4 h-4"
                />
              </label>
              <p className="text-xs text-gray-500">Reminders for scheduled mocks</p>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span className="text-sm font-medium">Deadline Alerts</span>
                <input
                  type="checkbox"
                  checked={settings.notifications.deadlineAlerts}
                  onChange={(e) => updateSetting('notifications.deadlineAlerts', e.target.checked)}
                  className="w-4 h-4"
                />
              </label>
              <p className="text-xs text-gray-500">Alerts for upcoming deadlines</p>
            </div>
          </CardContent>
        </Card>

        {/* Display Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Keyboard className="h-5 w-5" />
              Display & Interface
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span className="text-sm font-medium">Compact Mode</span>
                <input
                  type="checkbox"
                  checked={settings.display.compactMode}
                  onChange={(e) => updateSetting('display.compactMode', e.target.checked)}
                  className="w-4 h-4"
                />
              </label>
              <p className="text-xs text-gray-500">Reduce spacing and padding</p>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span className="text-sm font-medium">Show Progress Bars</span>
                <input
                  type="checkbox"
                  checked={settings.display.showProgressBars}
                  onChange={(e) => updateSetting('display.showProgressBars', e.target.checked)}
                  className="w-4 h-4"
                />
              </label>
              <p className="text-xs text-gray-500">Display progress indicators</p>
            </div>

            {/* Keyboard Shortcuts */}
            <div className="pt-4 border-t">
              <h4 className="font-medium text-gray-900 mb-3">Keyboard Shortcuts</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Go to Today</span>
                  <Badge variant="secondary">T</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Go to Calendar</span>
                  <Badge variant="secondary">C</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Go to Problems</span>
                  <Badge variant="secondary">P</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Search</span>
                  <Badge variant="secondary">/</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Go to Settings</span>
                  <Badge variant="secondary">S</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy & Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span className="text-sm font-medium">Analytics Tracking</span>
                <input
                  type="checkbox"
                  checked={settings.privacy.analyticsTracking}
                  onChange={(e) => updateSetting('privacy.analyticsTracking', e.target.checked)}
                  className="w-4 h-4"
                />
              </label>
              <p className="text-xs text-gray-500">Help improve the app with usage data</p>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span className="text-sm font-medium">Crash Reporting</span>
                <input
                  type="checkbox"
                  checked={settings.privacy.crashReporting}
                  onChange={(e) => updateSetting('privacy.crashReporting', e.target.checked)}
                  className="w-4 h-4"
                />
              </label>
              <p className="text-xs text-gray-500">Send error reports to help fix bugs</p>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span className="text-sm font-medium">Usage Statistics</span>
                <input
                  type="checkbox"
                  checked={settings.privacy.usageStatistics}
                  onChange={(e) => updateSetting('privacy.usageStatistics', e.target.checked)}
                  className="w-4 h-4"
                />
              </label>
              <p className="text-xs text-gray-500">Collect anonymous usage patterns</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Export Data */}
            <div className="text-center p-4 border rounded-lg">
              <Download className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h4 className="font-medium mb-2">Export Data</h4>
              <p className="text-sm text-gray-600 mb-4">
                Download a backup of all your data
              </p>
              <Button 
                onClick={exportData}
                disabled={isExporting}
                className="w-full"
              >
                {isExporting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </>
                )}
              </Button>
            </div>

            {/* Import Data */}
            <div className="text-center p-4 border rounded-lg">
              <Upload className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h4 className="font-medium mb-2">Import Data</h4>
              <p className="text-sm text-gray-600 mb-4">
                Restore from a backup file
              </p>
              <input
                type="file"
                accept=".json"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) importData(file);
                }}
                className="hidden"
                id="import-file"
              />
              <label htmlFor="import-file">
                <Button variant="outline" className="w-full" asChild>
                  <span className="cursor-pointer">
                    {isImporting ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Import
                      </>
                    )}
                  </span>
                </Button>
              </label>
            </div>

            {/* Reset Settings */}
            <div className="text-center p-4 border rounded-lg">
              <Trash2 className="h-8 w-8 mx-auto mb-2 text-red-600" />
              <h4 className="font-medium mb-2">Reset Settings</h4>
              <p className="text-sm text-gray-600 mb-4">
                Restore default settings
              </p>
              <Button 
                variant="outline" 
                onClick={() => setShowResetDialog(true)}
                className="w-full text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* App Info */}
      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="font-medium text-gray-700">Version</div>
              <div className="text-gray-600">1.0.0</div>
            </div>
            <div>
              <div className="font-medium text-gray-700">Database</div>
              <div className="text-gray-600">SQLite</div>
            </div>
            <div>
              <div className="font-medium text-gray-700">Storage</div>
              <div className="text-gray-600">Local</div>
            </div>
            <div>
              <div className="font-medium text-gray-700">Build</div>
              <div className="text-gray-600">Local-First</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reset Confirmation Dialog */}
      {showResetDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Reset Settings</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to reset all settings to their default values? 
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowResetDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={resetSettings}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                Reset Settings
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
