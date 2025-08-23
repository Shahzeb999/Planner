'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ExternalLink, 
  CheckCircle2,
  Copy,
  Download,
  BookOpen
} from 'lucide-react';

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

interface MarkdownPlaybookProps {
  playbookName: string;
  content: string;
  onChecklistUpdate?: (playbookName: string, checklistItems: ChecklistItem[]) => void;
}

export function MarkdownPlaybook({ playbookName, content, onChecklistUpdate }: MarkdownPlaybookProps) {
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  // const [showChecklist, setShowChecklist] = useState(true);

  useEffect(() => {
    // Extract checklist items from markdown content
    const checklistRegex = /- \[ \] (.+)/g;
    const matches = [...content.matchAll(checklistRegex)];
    
    const items: ChecklistItem[] = matches.map((match, index) => ({
      id: `${playbookName}-${index}`,
      text: match[1],
      completed: false,
    }));

    setChecklistItems(items);
  }, [content, playbookName]);

  const toggleChecklistItem = (id: string) => {
    const updatedItems = checklistItems.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    
    setChecklistItems(updatedItems);
    
    if (onChecklistUpdate) {
      onChecklistUpdate(playbookName, updatedItems);
    }
  };

  const completedCount = checklistItems.filter(item => item.completed).length;
  const progressPercentage = checklistItems.length > 0 ? (completedCount / checklistItems.length) * 100 : 0;

  const copyContent = () => {
    navigator.clipboard.writeText(content);
    // Could add a toast notification here
  };

  const downloadContent = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${playbookName}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
      {/* Markdown Content */}
      <div className="lg:col-span-3">
        <Card className="h-full">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                {playbookName.replace(/^\d+_/, '').replace(/_/g, ' ').replace(/\.md$/, '')}
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyContent}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={downloadContent}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            <div className="prose prose-gray max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({ children }: { children: React.ReactNode }) => (
                    <h1 className="text-3xl font-bold text-gray-900 mb-4 pb-2 border-b">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }: { children: React.ReactNode }) => (
                    <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4 pb-2 border-b border-gray-200">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }: { children: React.ReactNode }) => (
                    <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
                      {children}
                    </h3>
                  ),
                  p: ({ children }: { children: React.ReactNode }) => (
                    <p className="text-gray-700 leading-relaxed mb-4">
                      {children}
                    </p>
                  ),
                  code: ({ inline, children }: { inline?: boolean; children: React.ReactNode }) => (
                    inline ? (
                      <code className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-mono">
                        {children}
                      </code>
                    ) : (
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                        <code className="font-mono text-sm">{children}</code>
                      </pre>
                    )
                  ),
                  ul: ({ children }: { children: React.ReactNode }) => (
                    <ul className="list-disc list-inside mb-4 space-y-2">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }: { children: React.ReactNode }) => (
                    <ol className="list-decimal list-inside mb-4 space-y-2">
                      {children}
                    </ol>
                  ),
                  li: ({ children }: { children: React.ReactNode }) => (
                    <li className="text-gray-700">{children}</li>
                  ),
                  blockquote: ({ children }: { children: React.ReactNode }) => (
                    <blockquote className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 my-4">
                      {children}
                    </blockquote>
                  ),
                  a: ({ href, children }: { href?: string; children: React.ReactNode }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-1"
                    >
                      {children}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ),
                  table: ({ children }: { children: React.ReactNode }) => (
                    <div className="overflow-x-auto mb-4">
                      <table className="min-w-full border border-gray-300">
                        {children}
                      </table>
                    </div>
                  ),
                  th: ({ children }: { children: React.ReactNode }) => (
                    <th className="border border-gray-300 bg-gray-50 px-4 py-2 text-left font-semibold">
                      {children}
                    </th>
                  ),
                  td: ({ children }: { children: React.ReactNode }) => (
                    <td className="border border-gray-300 px-4 py-2">
                      {children}
                    </td>
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Checklist Sidebar */}
      {checklistItems.length > 0 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-lg">
                <span>Progress Checklist</span>
                <Badge variant={progressPercentage === 100 ? 'default' : 'secondary'}>
                  {completedCount}/{checklistItems.length}
                </Badge>
              </CardTitle>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-3 max-h-96 overflow-y-auto">
              {checklistItems.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <Checkbox
                    id={item.id}
                    checked={item.completed}
                    onCheckedChange={() => toggleChecklistItem(item.id)}
                    className="mt-0.5"
                  />
                  <label
                    htmlFor={item.id}
                    className={`text-sm cursor-pointer flex-1 ${
                      item.completed 
                        ? 'text-gray-500 line-through' 
                        : 'text-gray-700'
                    }`}
                  >
                    {item.text}
                  </label>
                </div>
              ))}
            </CardContent>
          </Card>

          {progressPercentage === 100 && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4 text-center">
                <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="font-medium text-green-800">Playbook Complete!</p>
                <p className="text-sm text-green-700 mt-1">
                  Great job finishing all the tasks.
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in New Window
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Copy className="h-4 w-4 mr-2" />
                Copy Repo Structure
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
