'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MarkdownPlaybook } from '@/components/markdown-playbook';
import { 
  BookOpen, 
  FileText, 
  CheckCircle2, 
  Clock,
  Filter,
  Search,
  Grid,
  List
} from 'lucide-react';
import { loadPlaybook, loadAllPlaybooks, type PlaybookFile } from '@/lib/playbook-loader';
import { getResources } from '@/app/actions/data';
import type { Resource } from '@/db/schema';



export default function PlaybooksPage() {
  const [playbooks, setPlaybooks] = useState<PlaybookFile[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlaybook, setSelectedPlaybook] = useState<PlaybookFile | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
    completed: '',
    search: '',
  });

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [playbooksData, resourcesData] = await Promise.all([
          loadAllPlaybooks(),
          getResources()
        ]);
        
        setPlaybooks(playbooksData);
        setResources(resourcesData);
      } catch (error) {
        console.error('Error loading playbooks and resources:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter playbooks
  const filteredPlaybooks = playbooks.filter(playbook => {
    if (filters.category && playbook.category !== filters.category) return false;
    if (filters.difficulty && playbook.difficulty !== filters.difficulty) return false;
    // Note: PlaybookFile doesn't have completed field, so we'll ignore completion filter for now
    if (filters.search && !playbook.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  // Statistics
  const totalPlaybooks = playbooks.length;
  const completedPlaybooks = 0; // TODO: Implement completion tracking
  const totalEstimatedHours = playbooks.reduce((sum, p) => sum + p.estimatedHours, 0);
  const completedHours = 0; // TODO: Implement completion tracking

  const categories = Array.from(new Set(playbooks.map(p => p.category)));
  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

  const selectPlaybook = async (playbook: PlaybookFile) => {
    try {
      setSelectedPlaybook(playbook);
      
      // If the playbook already has content loaded, use it
      if (playbook.content) {
        return;
      }
      
      // Otherwise, load the content
      const fullPlaybook = await loadPlaybook(playbook.id);
      if (fullPlaybook) {
        setSelectedPlaybook(fullPlaybook);
      }
    } catch (error) {
      console.error('Error loading playbook content:', error);
    }
  };

  const handleChecklistUpdate = (playbookName: string, checklistItems: { completed: boolean }[]) => {
    // TODO: Implement playbook completion tracking in database
    console.log('Checklist updated for', playbookName, checklistItems);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 h-full">
      {selectedPlaybook ? (
        // Playbook View
        <div className="space-y-4 h-full">
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={() => setSelectedPlaybook(null)}
            >
              ← Back to Playbooks
            </Button>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Week {selectedPlaybook.week}
              </Badge>
              <Badge className={getDifficultyColor(selectedPlaybook.difficulty)}>
                {selectedPlaybook.difficulty}
              </Badge>
              {selectedPlaybook.completed && (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              )}
            </div>
          </div>
          
          <MarkdownPlaybook
            playbookName={selectedPlaybook.id}
            content={selectedPlaybook.content || 'Loading content...'}
            onChecklistUpdate={handleChecklistUpdate}
          />
        </div>
      ) : (
        // Playbooks List View
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Playbooks & Resources</h1>
            <p className="text-gray-600">
              Step-by-step guides for building projects and mastering concepts.
            </p>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{totalPlaybooks}</div>
                <div className="text-sm text-gray-600">Total Playbooks</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{completedPlaybooks}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{totalEstimatedHours}h</div>
                <div className="text-sm text-gray-600">Est. Total Time</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{completedHours}h</div>
                <div className="text-sm text-gray-600">Time Completed</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search playbooks..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 border rounded-md text-sm"
                  />
                </div>
                <select 
                  value={filters.category} 
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="p-2 border rounded-md text-sm"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <select 
                  value={filters.difficulty} 
                  onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value }))}
                  className="p-2 border rounded-md text-sm"
                >
                  <option value="">All Difficulties</option>
                  {difficulties.map(difficulty => (
                    <option key={difficulty} value={difficulty}>{difficulty}</option>
                  ))}
                </select>
                <select 
                  value={filters.completed} 
                  onChange={(e) => setFilters(prev => ({ ...prev, completed: e.target.value }))}
                  className="p-2 border rounded-md text-sm"
                >
                  <option value="">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="todo">To Do</option>
                </select>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setFilters({ category: '', difficulty: '', completed: '', search: '' })}
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Playbooks Grid/List */}
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {loading ? (
              <div className="col-span-full">
                <Card className="p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-lg font-medium">Loading playbooks...</p>
                </Card>
              </div>
            ) : filteredPlaybooks.map(playbook => (
              <Card 
                key={playbook.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => selectPlaybook(playbook)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg leading-tight mb-2">
                        {playbook.title}
                      </CardTitle>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {playbook.week && (
                          <Badge variant="outline" className="text-xs">
                            Week {playbook.week}
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {playbook.category}
                        </Badge>
                        <Badge className={getDifficultyColor(playbook.difficulty) + ' text-xs'}>
                          {playbook.difficulty}
                        </Badge>
                      </div>
                    </div>
                    {/* TODO: Add completion tracking */}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    {playbook.description}
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      {playbook.estimatedHours} hours estimated
                    </div>
                    
                    <div>
                      <p className="text-xs font-medium text-gray-700 mb-1">Technologies:</p>
                      <div className="flex flex-wrap gap-1">
                        {playbook.technologies.map(tech => (
                          <Badge key={tech} variant="secondary" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    {playbook.prerequisites.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-700 mb-1">Prerequisites:</p>
                        <p className="text-xs text-gray-600">
                          {playbook.prerequisites.join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredPlaybooks.length === 0 && (
            <Card className="p-8 text-center">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium text-gray-500">No playbooks found</p>
              <p className="text-sm text-gray-400 mt-2">Try adjusting your filters</p>
            </Card>
          )}

          {/* Resources Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Additional Resources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {resources.map(resource => (
                  <div 
                    key={resource.id} 
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{resource.title}</h4>
                        <p className="text-sm text-gray-600">{resource.area}</p>
                      </div>
                      {resource.pinned && (
                        <Badge variant="secondary" className="text-xs">Pinned</Badge>
                      )}
                    </div>
                    {resource.url && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full mt-2"
                        onClick={() => window.open(resource.url, '_blank', 'noopener,noreferrer')}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        Open Resource
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
