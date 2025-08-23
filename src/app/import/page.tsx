'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  File, 
  CheckCircle2, 
  AlertCircle, 
  Download,
  RefreshCw,
  Database,
  FileSpreadsheet,
  Trash2,
  Bug
} from 'lucide-react';
import { importExcel, importFromDefaultFile, resetAllData, debugDatabaseData } from '@/app/actions/import';
import type { ImportSummary } from '@/lib/excel-importer';

export default function ImportPage() {
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState<ImportSummary | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isDebugging, setIsDebugging] = useState(false);

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      alert('Please upload an Excel file (.xlsx or .xls)');
      return;
    }

    setIsImporting(true);
    setImportResults(null);

    try {
      const formData = new FormData();
      formData.append('excel-file', file);
      
      const result = await importExcel(formData);
      
      if (result.success && result.data) {
        setImportResults(result.data);
      } else {
        alert(`Import failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleDefaultImport = async () => {
    setIsImporting(true);
    setImportResults(null);

    try {
      const result = await importFromDefaultFile();
      
      if (result.success && result.data) {
        setImportResults(result.data);
      } else {
        alert(`Import failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Default import error:', error);
      alert('Import failed. Please try again.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleReset = async () => {
    setIsResetting(true);
    setShowResetConfirm(false);
    setImportResults(null);

    try {
      const result = await resetAllData();
      
      if (result.success) {
        alert(`✅ ${result.message}`);
      } else {
        alert(`Reset failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Reset error:', error);
      alert('Reset failed. Please try again.');
    } finally {
      setIsResetting(false);
    }
  };

  const handleDebug = async () => {
    setIsDebugging(true);
    try {
      const result = await debugDatabaseData();
      if (result.success && result.data) {
        console.log('🔍 Debug Info:', result.data);
        const debugInfo = `Debug Information:
- Today's Date: ${result.data.today}
- Total Plan Items: ${result.data.counts.planItems}
- Today's Items: ${result.data.todayItemsCount}
- Sample Dates: ${result.data.sampleDates.map((item: any) => item.date).join(', ')}

Check browser console for full details.`;
        alert(debugInfo);
      } else {
        alert(`Debug failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Debug error:', error);
      alert('Debug failed. Check console for details.');
    } finally {
      setIsDebugging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const getTotalOperations = (results: ImportSummary) => {
    return Object.values(results).reduce((total, section) => 
      total + section.inserted + section.updated, 0
    );
  };

  const getTotalErrors = (results: ImportSummary) => {
    return Object.values(results).reduce((total, section) => 
      total + section.errors.length, 0
    );
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Import Data</h1>
        <p className="text-gray-600">
          Import your Excel workbook to populate the database with your 6-month prep plan.
        </p>
      </div>

      {/* Import Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Default File Import */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Default File Import
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Import from <code>full_fledged_plan_v2.xlsx</code> in the parent directory.
            </p>
            <Button 
              onClick={handleDefaultImport}
              disabled={isImporting}
              className="w-full"
            >
              {isImporting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Import Default File
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* File Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Excel File
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragOver 
                  ? 'border-blue-400 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
            >
              <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                Drop your Excel file here
              </p>
              <p className="text-sm text-gray-600 mb-4">
                or click to browse (.xlsx, .xls)
              </p>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileInput}
                className="hidden"
                id="file-upload"
                disabled={isImporting}
              />
              <label htmlFor="file-upload">
                <Button variant="outline" disabled={isImporting} asChild>
                  <span className="cursor-pointer">
                    <File className="h-4 w-4 mr-2" />
                    Choose File
                  </span>
                </Button>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Reset Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              Reset Database
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Clear all existing data to start fresh. This cannot be undone.
            </p>
            <Button 
              onClick={() => setShowResetConfirm(true)}
              disabled={isImporting || isResetting}
              variant="outline"
              className="w-full text-red-600 border-red-300 hover:bg-red-50"
            >
              {isResetting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Resetting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Reset All Data
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Debug Database */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bug className="h-5 w-5 text-blue-600" />
              Debug Database
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Check database contents and troubleshoot data issues.
            </p>
            <Button 
              onClick={handleDebug}
              disabled={isImporting || isResetting || isDebugging}
              variant="outline"
              className="w-full text-blue-600 border-blue-300 hover:bg-blue-50"
            >
              {isDebugging ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Debugging...
                </>
              ) : (
                <>
                  <Bug className="h-4 w-4 mr-2" />
                  Debug Database
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md mx-4">
            <h3 className="text-lg font-bold text-red-600 mb-2">⚠️ Confirm Reset</h3>
            <p className="text-gray-700 mb-4">
              This will permanently delete all data including:
            </p>
            <ul className="text-sm text-gray-600 mb-6 space-y-1">
              <li>• All plan items and progress</li>
              <li>• Problem sets and time tracking</li>
              <li>• Mock interview data</li>
              <li>• Resources and sessions</li>
              <li>• All settings</li>
            </ul>
            <p className="text-red-600 font-medium mb-4">
              This action cannot be undone!
            </p>
            <div className="flex gap-3">
              <Button 
                onClick={() => setShowResetConfirm(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleReset}
                variant="destructive"
                className="flex-1"
              >
                Yes, Reset All
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Import Progress */}
      {isImporting && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
              <span className="font-medium">Importing data...</span>
            </div>
            <Progress value={50} className="w-full" />
            <p className="text-sm text-gray-600 mt-2">
              Processing Excel sheets and updating database...
            </p>
          </CardContent>
        </Card>
      )}

      {/* Import Results */}
      {importResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Import Completed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {getTotalOperations(importResults)}
                </div>
                <div className="text-sm text-gray-600">Total Operations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Object.values(importResults).reduce((total, section) => 
                    total + section.inserted, 0
                  )}
                </div>
                <div className="text-sm text-gray-600">Inserted</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {Object.values(importResults).reduce((total, section) => 
                    total + section.updated, 0
                  )}
                </div>
                <div className="text-sm text-gray-600">Updated</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {getTotalErrors(importResults)}
                </div>
                <div className="text-sm text-gray-600">Errors</div>
              </div>
            </div>

            {/* Detailed Results */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Detailed Results</h3>
              
              {Object.entries(importResults).map(([section, data]) => (
                <div key={section} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium capitalize">
                      {section.replace(/([A-Z])/g, ' $1').trim()}
                    </h4>
                    <div className="flex gap-2">
                      {data.inserted > 0 && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          +{data.inserted} new
                        </Badge>
                      )}
                      {data.updated > 0 && (
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                          ~{data.updated} updated
                        </Badge>
                      )}
                      {data.errors.length > 0 && (
                        <Badge variant="secondary" className="bg-red-100 text-red-800">
                          {data.errors.length} errors
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {data.errors.length > 0 && (
                    <div className="mt-3">
                      <details className="text-sm">
                        <summary className="cursor-pointer text-red-600 font-medium">
                          View Errors ({data.errors.length})
                        </summary>
                        <div className="mt-2 space-y-1">
                          {data.errors.map((error: string, index: number) => (
                            <div key={index} className="bg-red-50 text-red-700 p-2 rounded text-xs">
                              {error}
                            </div>
                          ))}
                        </div>
                      </details>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <Button onClick={() => window.location.href = '/'} className="flex-1">
                View Today&apos;s Plan
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/calendar'}>
                View Calendar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Excel File Requirements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Your Excel file should contain the following sheets with the specified columns:
          </p>
          
          <div className="space-y-3 text-sm">
            <div>
              <h4 className="font-medium">Plan Sheet</h4>
              <p className="text-gray-600">
                Columns: Date, Week, Week Range, Day, Phase, Theme (Week Focus), Task Type, 
                Task Description, Weekly Challenge (Sat), Resource Pointer
              </p>
            </div>
            
            <div>
              <h4 className="font-medium">Weekly Problem Sets</h4>
              <p className="text-gray-600">
                Columns: Week, Topic, Problem, Difficulty, URL, Notes
              </p>
            </div>
            
            <div>
              <h4 className="font-medium">OOP Problem Sets</h4>
              <p className="text-gray-600">
                Columns: Week, Track, Problem, Difficulty, URL, Notes
              </p>
            </div>
            
            <div>
              <h4 className="font-medium">Projects & Resources</h4>
              <p className="text-gray-600">
                Columns: Week, Area, Resource, URL, Notes
              </p>
            </div>
            
            <div>
              <h4 className="font-medium">Mocks & Checklists</h4>
              <p className="text-gray-600">
                Columns: Week, Mock Type, Goal, Notes
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-800 text-sm">Important Notes</p>
                <ul className="text-blue-700 text-sm mt-1 space-y-1">
                  <li>• Data will be upserted (inserted or updated if exists)</li>
                  <li>• Existing progress and notes will be preserved</li>
                  <li>• Dates should be in a recognizable format</li>
                  <li>• Difficulty must be: Easy, Medium, or Hard</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
