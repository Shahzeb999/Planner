'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatusPill } from '@/components/status-pill';
import { DifficultyPill } from '@/components/difficulty-pill';
import { 
  Search as SearchIcon, 
  FileText, 
  Code, 
  Target, 
  Calendar,
  BookOpen,
  ExternalLink,
  Filter
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { searchAllData } from '@/app/actions/data';

interface SearchResult {
  id: string;
  type: 'plan' | 'problem' | 'oop_problem' | 'resource' | 'mock' | 'playbook';
  title: string;
  description: string;
  content?: string;
  metadata: Record<string, string | number | boolean | undefined>;
  relevanceScore: number;
  matchedFields: string[];
}

// Search will be performed against the database

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [filters, setFilters] = useState({
    type: '',
    difficulty: '',
    status: '',
    week: 0,
  });
  const [sortBy, setSortBy] = useState<'relevance' | 'date' | 'title'>('relevance');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  // Perform search with debouncing
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    
    try {
      const results = await searchAllData(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Error performing search:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, performSearch]);

  // Apply filters and sorting
  const filteredAndSortedResults = useMemo(() => {
    let filtered = searchResults;

    // Apply filters
    if (filters.type) {
      filtered = filtered.filter(result => result.type === filters.type);
    }
    if (filters.difficulty) {
      filtered = filtered.filter(result => result.metadata.difficulty === filters.difficulty);
    }
    if (filters.status) {
      filtered = filtered.filter(result => result.metadata.status === filters.status);
    }
    if (filters.week) {
      filtered = filtered.filter(result => result.metadata.week === filters.week);
    }

    // Apply sorting
    const sorted = [...filtered].sort((a: SearchResult, b: SearchResult) => {
      switch (sortBy) {
        case 'relevance':
          return b.relevanceScore - a.relevanceScore;
        case 'date':
          const aDate = (typeof a.metadata.date === 'string' ? a.metadata.date : 
                        typeof a.metadata.scheduledAt === 'number' ? new Date(a.metadata.scheduledAt * 1000).toISOString() : '2025-01-01');
          const bDate = (typeof b.metadata.date === 'string' ? b.metadata.date : 
                        typeof b.metadata.scheduledAt === 'number' ? new Date(b.metadata.scheduledAt * 1000).toISOString() : '2025-01-01');
          
          try {
            const aDateObj = new Date(aDate);
            const bDateObj = new Date(bDate);
            
            if (isNaN(aDateObj.valueOf()) || isNaN(bDateObj.valueOf())) {
              return 0;
            }
            
            return bDateObj.valueOf() - aDateObj.valueOf();
          } catch (error) {
            return 0;
          }
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return sorted;
  }, [searchResults, filters, sortBy]);

  useEffect(() => {
    setResults(filteredAndSortedResults);
  }, [filteredAndSortedResults]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'plan': return <Calendar className="h-4 w-4" />;
      case 'problem':
      case 'oop_problem': return <Code className="h-4 w-4" />;
      case 'resource': return <FileText className="h-4 w-4" />;
      case 'mock': return <Target className="h-4 w-4" />;
      case 'playbook': return <BookOpen className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'plan': return 'bg-blue-100 text-blue-800';
      case 'problem': return 'bg-green-100 text-green-800';
      case 'oop_problem': return 'bg-purple-100 text-purple-800';
      case 'resource': return 'bg-gray-100 text-gray-800';
      case 'mock': return 'bg-red-100 text-red-800';
      case 'playbook': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const highlightMatch = (text: string, query: string): (string | React.ReactElement)[] => {
    if (!query.trim()) return [text];
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const resultTypeStats = results.reduce((acc: Record<string, number>, result) => {
    acc[result.type] = (acc[result.type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Search</h1>
        <p className="text-gray-600">
          Search across all your plan items, problems, resources, mocks, and playbooks.
        </p>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for anything... (e.g., 'transformer', 'dynamic programming', 'system design')"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              autoFocus
            />
            {isSearching && (
              <div className="absolute right-3 top-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {query && (
        <>
          {/* Search Stats and Filters */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {results.length} results for &ldquo;{query}&rdquo;
              </span>
              {Object.keys(resultTypeStats).length > 0 && (
                <div className="flex gap-1">
                  {Object.entries(resultTypeStats).map(([type, count]) => (
                    <Badge key={type} variant="secondary" className="text-xs">
                      {type}: {count}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value as 'relevance' | 'date' | 'title')}
                className="text-sm p-2 border rounded-md"
              >
                <option value="relevance">Relevance</option>
                <option value="date">Date</option>
                <option value="title">Title</option>
              </select>
            </div>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <select 
                  value={filters.type} 
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                  className="p-2 border rounded-md text-sm"
                >
                  <option value="">All Types</option>
                  <option value="plan">Plan Items</option>
                  <option value="problem">Problems</option>
                  <option value="oop_problem">OOP Problems</option>
                  <option value="resource">Resources</option>
                  <option value="mock">Mocks</option>
                  <option value="playbook">Playbooks</option>
                </select>
                
                <select 
                  value={filters.status} 
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="p-2 border rounded-md text-sm"
                >
                  <option value="">All Status</option>
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                  <option value="solved">Solved</option>
                  <option value="skipped">Skipped</option>
                </select>
                
                <select 
                  value={filters.difficulty} 
                  onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value }))}
                  className="p-2 border rounded-md text-sm"
                >
                  <option value="">All Difficulties</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setFilters({ type: '', difficulty: '', status: '', week: 0 })}
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Search Results */}
          <div className="space-y-4">
            {results.map((result) => (
              <Card key={result.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getTypeColor(result.type)}>
                          {getTypeIcon(result.type)}
                          <span className="ml-1 capitalize">{result.type.replace('_', ' ')}</span>
                        </Badge>
                        
                        {result.metadata.week && (
                          <Badge variant="outline" className="text-xs">
                            Week {result.metadata.week}
                          </Badge>
                        )}
                        
                        {result.metadata.difficulty && 
                         ['Easy', 'Medium', 'Hard'].includes(result.metadata.difficulty as string) && (
                          <DifficultyPill difficulty={result.metadata.difficulty as 'Easy' | 'Medium' | 'Hard'} />
                        )}
                        
                        {result.metadata.status && 
                         ['todo', 'in_progress', 'done', 'solved', 'skipped'].includes(result.metadata.status as string) && (
                          <StatusPill status={result.metadata.status as 'todo' | 'in_progress' | 'done' | 'solved' | 'skipped'} />
                        )}
                        
                        <Badge variant="secondary" className="text-xs">
                          {Math.round(result.relevanceScore)}% match
                        </Badge>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {highlightMatch(result.title, query)}
                      </h3>
                      
                      <p className="text-gray-600 mb-3">
                        {highlightMatch(result.description, query)}
                      </p>
                      
                      {result.content && (
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg mb-3">
                          {highlightMatch(result.content.substring(0, 200), query)}
                          {result.content.length > 200 && '...'}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        {result.matchedFields.map(field => (
                          <Badge key={field} variant="outline" className="text-xs">
                            Matched in {field}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        {result.metadata.category && (
                          <span>Category: {result.metadata.category}</span>
                        )}
                        {result.metadata.taskType && (
                          <span>Type: {result.metadata.taskType}</span>
                        )}
                        {result.metadata.date && typeof result.metadata.date === 'string' && (
                          <span>Date: {format(parseISO(result.metadata.date), 'MMM d, yyyy')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                    
                    {result.metadata.url && typeof result.metadata.url === 'string' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.open(result.metadata.url as string, '_blank', 'noopener,noreferrer')}
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Open Link
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {query && results.length === 0 && !isSearching && (
              <Card className="p-8 text-center">
                <SearchIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium text-gray-500">No results found</p>
                <p className="text-sm text-gray-400 mt-2">
                  Try adjusting your search terms or removing filters
                </p>
              </Card>
            )}
          </div>
        </>
      )}

      {!query && (
        <Card className="p-8 text-center">
          <SearchIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium text-gray-500">Start typing to search</p>
          <p className="text-sm text-gray-400 mt-2">
            Search across plan items, problems, resources, mocks, and playbooks
          </p>
          
          <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="text-left">
              <h4 className="font-medium text-gray-700 mb-2">Popular Searches</h4>
              <div className="space-y-1 text-sm">
                <button 
                  onClick={() => setQuery('transformer')}
                  className="block text-blue-600 hover:underline"
                >
                  transformer
                </button>
                <button 
                  onClick={() => setQuery('system design')}
                  className="block text-blue-600 hover:underline"
                >
                  system design
                </button>
                <button 
                  onClick={() => setQuery('dynamic programming')}
                  className="block text-blue-600 hover:underline"
                >
                  dynamic programming
                </button>
              </div>
            </div>
            
            <div className="text-left">
              <h4 className="font-medium text-gray-700 mb-2">Search Tips</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p>• Use specific terms</p>
                <p>• Try partial matches</p>
                <p>• Filter by type or status</p>
              </div>
            </div>
            
            <div className="text-left">
              <h4 className="font-medium text-gray-700 mb-2">Quick Access</h4>
              <div className="space-y-1 text-sm">
                <button 
                  onClick={() => setFilters(prev => ({ ...prev, type: 'problem' }))}
                  className="block text-blue-600 hover:underline"
                >
                  All Problems
                </button>
                <button 
                  onClick={() => setFilters(prev => ({ ...prev, status: 'todo' }))}
                  className="block text-blue-600 hover:underline"
                >
                  Todo Items
                </button>
                <button 
                  onClick={() => setFilters(prev => ({ ...prev, type: 'playbook' }))}
                  className="block text-blue-600 hover:underline"
                >
                  All Playbooks
                </button>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
