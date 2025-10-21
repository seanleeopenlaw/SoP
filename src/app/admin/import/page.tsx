'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Download, FileSpreadsheet, CheckCircle, XCircle, AlertCircle, Users, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { TEMPLATE_VERSION, TEMPLATE_UPDATED_DATE } from '@/lib/template-version';
import AdminRoute from '@/components/AdminRoute';
import { Button } from '@/components/ui/button';
import { SectionCard } from '@/components/ui/section-card';
import { getSession, clearSession } from '@/lib/auth-utils';

interface ImportResult {
  success: boolean;
  message: string;
  successCount: number;
  errorCount: number;
  totalRows: number;
  details: Array<{
    row: number;
    email: string;
    name: string;
    action: 'created' | 'updated';
  }>;
  errors: Array<{
    row: number;
    email?: string;
    name?: string;
    error: string;
  }>;
}

function AdminImportPageContent() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [templateInfo, setTemplateInfo] = useState<{ version: string; updatedAt: string } | null>(null);
  const [resetDatabase, setResetDatabase] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Set template version info on page load
  useEffect(() => {
    setTemplateInfo({
      version: TEMPLATE_VERSION,
      updatedAt: TEMPLATE_UPDATED_DATE,
    });
  }, []);

  const handleLogout = () => {
    clearSession();
    router.push('/');
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls')) {
        setFile(droppedFile);
        setResult(null);
      } else {
        toast.error('Please upload an Excel file (.xlsx or .xls)');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
        setFile(selectedFile);
        setResult(null);
      } else {
        toast.error('Please upload an Excel file (.xlsx or .xls)');
      }
    }
  };

  const handleDownloadTemplate = async () => {
    setDownloading(true);
    try {
      const response = await fetch('/api/admin/import', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to download template');
      }

      // Extract version info from response headers
      const version = response.headers.get('X-Template-Version');
      const updatedAt = response.headers.get('X-Template-Updated');

      if (version && updatedAt) {
        setTemplateInfo({ version, updatedAt });
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'user_import_template.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Template downloaded successfully');
    } catch (error) {
      console.error('Error downloading template:', error);
      toast.error('Failed to download template');
    } finally {
      setDownloading(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    // Show confirmation dialog if reset is enabled
    if (resetDatabase && !showResetConfirm) {
      setShowResetConfirm(true);
      return;
    }

    setUploading(true);
    setShowResetConfirm(false);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('resetDatabase', resetDatabase.toString());

    try {
      // Add auth headers for server-side verification
      const session = getSession();
      const headers: HeadersInit = {};
      if (session) {
        headers['x-user-email'] = session.email;
        headers['x-user-name'] = session.name;
        headers['x-user-admin'] = session.isAdmin.toString();
      }

      const response = await fetch('/api/admin/import', {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to import users');
      }

      setResult(data);

      if (data.success) {
        toast.success(data.message);
      } else {
        toast.warning(data.message);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to import users');
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const session = getSession();

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">Admin Import</h1>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-sm text-muted-foreground">
                  Bulk import user profiles from Excel
                </p>
                {session && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <p className="text-sm text-muted-foreground">{session.email}</p>
                    <Button
                      onClick={handleLogout}
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive/80 h-auto p-0"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Logout
                    </Button>
                  </>
                )}
              </div>
            </div>
            <Button
              onClick={() => router.push('/users')}
              variant="secondary"
              className="w-full md:w-auto"
            >
              <Users className="w-4 h-4" />
              Team Directory
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-8 space-y-8">
        {/* Download Template Section */}
        <SectionCard>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <FileSpreadsheet className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-2">Download Template</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Download the Excel template to fill in user profile data. The template includes sample data and all required columns.
              </p>
              <Button
                onClick={handleDownloadTemplate}
                disabled={downloading}
              >
                <Download className="w-4 h-4" />
                {downloading ? 'Downloading...' : 'Download Template'}
              </Button>
              {templateInfo && (
                <div className="text-xs text-muted-foreground mt-3">
                  Version {templateInfo.version} • Updated: {templateInfo.updatedAt}
                </div>
              )}
            </div>
          </div>
        </SectionCard>

        {/* Upload Section */}
        <SectionCard>
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-2">Upload Excel File</h2>
              <p className="text-sm text-muted-foreground">
                Upload the completed Excel file to import or update user profiles.
              </p>
            </div>
          </div>

          {/* Import Behavior Guide - Full Width */}
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm space-y-1">
                <p className="font-semibold text-blue-900 dark:text-blue-100">Import Behavior:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-800 dark:text-blue-200">
                  <li>Filled cells will <strong>update</strong> existing data</li>
                  <li>Empty cells will <strong>keep</strong> existing data unchanged</li>
                  <li>To remove data, use the profile edit page or database directly</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Drag and Drop Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={cn(
              'border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer',
              dragActive ? 'border-primary bg-primary/5' : 'border-border bg-muted/20',
              file && 'border-primary bg-primary/5'
            )}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />

            {file ? (
              <div className="space-y-2">
                <FileSpreadsheet className="w-12 h-12 mx-auto text-primary" />
                <p className="font-medium text-foreground">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                <p className="font-medium text-foreground">
                  Drag and drop your Excel file here
                </p>
                <p className="text-sm text-muted-foreground">
                  or click to browse (.xlsx, .xls)
                </p>
              </div>
            )}
          </div>

          {/* Reset Database Option */}
          {file && (
            <div className="mt-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={resetDatabase}
                  onChange={(e) => setResetDatabase(e.target.checked)}
                  disabled={uploading}
                  className="mt-1 w-4 h-4 text-destructive border-destructive/30 rounded focus:ring-destructive focus:ring-offset-0 disabled:opacity-50"
                />
                <div className="flex-1">
                  <div className="font-semibold text-destructive flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Reset Database (Destructive)
                  </div>
                  <p className="text-sm text-destructive/80 mt-1">
                    Delete ALL existing profiles not in this file, then import. The database will match the Excel file exactly - profiles, data fields (birthdays, teams, etc.), everything. If data is missing from Excel, it will be removed from the database. Use this to sync with Excel as the single source of truth.
                  </p>
                </div>
              </label>
            </div>
          )}

          {/* Action Buttons */}
          {file && (
            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleUpload}
                disabled={uploading}
                variant={resetDatabase ? "destructive" : "default"}
                className={cn(
                  "flex-1",
                  !resetDatabase && "bg-brand-indigo hover:bg-brand-indigo-dark"
                )}
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {resetDatabase ? 'Resetting & Importing...' : 'Importing...'}
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    {resetDatabase ? 'Reset & Import' : 'Import Users'}
                  </>
                )}
              </Button>
              <Button
                onClick={handleReset}
                disabled={uploading}
                variant="secondary"
              >
                Clear
              </Button>
            </div>
          )}
        </SectionCard>

        {/* Confirmation Dialog */}
        {showResetConfirm && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border-2 border-destructive rounded-lg shadow-lg max-w-md w-full p-6">
              <div className="flex items-start gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-destructive mb-2">Confirm Database Reset</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    This will <strong className="text-destructive">permanently delete ALL existing profiles</strong> that are not in the uploaded Excel file.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    All data fields (birthdays, teams, chronotypes, etc.) will also be synced exactly with the Excel file - if data is missing from Excel, it will be removed from the database.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Only profiles with matching emails in the Excel file will be kept/updated. This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => setShowResetConfirm(false)}
                  variant="secondary"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpload}
                  variant="destructive"
                  className="flex-1"
                >
                  Yes, Reset & Import
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Results Section */}
        {result && (
          <SectionCard className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-4">Import Results</h2>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium">Successful</span>
                  </div>
                  <p className="text-2xl font-bold">{result.successCount}</p>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span className="font-medium">Errors</span>
                  </div>
                  <p className="text-2xl font-bold">{result.errorCount}</p>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">Total Rows</span>
                  </div>
                  <p className="text-2xl font-bold">{result.totalRows}</p>
                </div>
              </div>

              {/* Detailed Results */}
              {result.details.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-3 text-green-600 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Successfully Imported ({result.details.length})
                  </h3>
                  <div className="bg-muted/30 rounded-lg p-4 max-h-64 overflow-y-auto">
                    <div className="space-y-2">
                      {result.details.map((detail, index) => (
                        <div key={index} className="text-sm flex items-start gap-2">
                          <span className="text-muted-foreground min-w-[60px]">
                            Row {detail.row}:
                          </span>
                          <span className="flex-1">
                            {detail.action === 'created' ? 'Created' : 'Updated'} {detail.name} ({detail.email})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Errors */}
              {result.errors.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 text-red-600 flex items-center gap-2">
                    <XCircle className="w-5 h-5" />
                    Errors ({result.errors.length})
                  </h3>
                  <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-4 max-h-64 overflow-y-auto">
                    <div className="space-y-2">
                      {result.errors.map((error, index) => (
                        <div key={index} className="text-sm flex items-start gap-2">
                          <span className="text-red-600 min-w-[60px]">
                            Row {error.row}:
                          </span>
                          <span className="flex-1 text-red-900 dark:text-red-200">
                            {error.name && error.email && `${error.name} (${error.email}) - `}
                            {error.error}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Import Another File */}
            <Button
              onClick={handleReset}
              className="w-full"
            >
              Import Another File
            </Button>
          </SectionCard>
        )}
      </div>
    </main>
  );
}

export default function AdminImportPage() {
  return (
    <AdminRoute>
      <AdminImportPageContent />
    </AdminRoute>
  );
}
