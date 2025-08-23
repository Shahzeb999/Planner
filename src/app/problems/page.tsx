'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { StatusPill } from '@/components/status-pill';
import { DifficultyPill } from '@/components/difficulty-pill';
import { SessionTimer } from '@/components/session-timer';
import { 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  Filter,
  BarChart3,
  Target,
  Timer,
  BookOpen
} from 'lucide-react';
import { 
  getProblems, 
  getOopProblems, 
  updateProblemStatus, 
  updateOopProblemStatus,
  addTimeToProblam,
  addTimeToOopProblem,
  saveSession
} from '@/app/actions/data';
import type { Problem, OopProblem } from '@/db/schema';



export default function ProblemsPage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [oopProblems, setOopProblems] = useState<OopProblem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('weekly');
  const [selectedProblemId, setSelectedProblemId] = useState<number | null>(null);
  const [selectedProblemType, setSelectedProblemType] = useState<'weekly' | 'oop'>('weekly');
  const [filters, setFilters] = useState({
    week: 0,
    difficulty: '',
    status: '',
    category: '',
  });

  // Load data on mount and when filters change
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [problemsData, oopProblemsData] = await Promise.all([
          getProblems({
            week: filters.week || undefined,
            category: filters.category || undefined,
            difficulty: filters.difficulty || undefined,
            status: filters.status || undefined,
          }),
          getOopProblems({
            week: filters.week || undefined,
            difficulty: filters.difficulty || undefined,
            status: filters.status || undefined,
          })
        ]);
        
        setProblems(problemsData);
        setOopProblems(oopProblemsData);
      } catch (error) {
        console.error('Error loading problems:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [filters]);

  // Data is already filtered on server side
  const filteredProblems = problems;
  const filteredOopProblems = oopProblems;

  // Statistics
  const getStats = (problemList: (Problem | OopProblem)[]) => {
    const total = problemList.length;
    const solved = problemList.filter(p => p.status === 'solved').length;
    const todo = problemList.filter(p => p.status === 'todo').length;
    const skipped = problemList.filter(p => p.status === 'skipped').length;
    const totalTime = problemList.reduce((sum, p) => sum + p.timeSpentMins, 0);
    
    return { total, solved, todo, skipped, totalTime };
  };

  const updateProblemStatusHandler = async (id: number, status: 'todo' | 'solved' | 'skipped', type: 'weekly' | 'oop') => {
    try {
      // Optimistic update
      if (type === 'weekly') {
        setProblems(prev => 
          prev.map(problem => 
            problem.id === id ? { ...problem, status } : problem
          )
        );
        await updateProblemStatus(id, status);
      } else {
        setOopProblems(prev => 
          prev.map(problem => 
            problem.id === id ? { ...problem, status } : problem
          )
        );
        await updateOopProblemStatus(id, status);
      }
    } catch (error) {
      console.error('Error updating problem status:', error);
      // Reload data on error to revert changes
      const loadData = async () => {
        const [problemsData, oopProblemsData] = await Promise.all([
          getProblems(),
          getOopProblems()
        ]);
        setProblems(problemsData);
        setOopProblems(oopProblemsData);
      };
      loadData();
    }
  };

  const startTimer = (id: number, type: 'weekly' | 'oop') => {
    setSelectedProblemId(selectedProblemId === id ? null : id);
    setSelectedProblemType(type);
  };

  const handleSessionComplete = async (durationMins: number, kind: string, notes?: string) => {
    try {
      if (selectedProblemId) {
        const today = new Date().toISOString().split('T')[0];
        
        // Save session
        await saveSession({
          date: today,
          kind,
          durationMins,
          notes,
          linkedProblemId: selectedProblemType === 'weekly' ? selectedProblemId : undefined,
          linkedOopProblemId: selectedProblemType === 'oop' ? selectedProblemId : undefined,
        });

        // Update time spent
        if (selectedProblemType === 'weekly') {
          setProblems(prev => 
            prev.map(problem => 
              problem.id === selectedProblemId 
                ? { ...problem, timeSpentMins: problem.timeSpentMins + durationMins }
                : problem
            )
          );
          await addTimeToProblam(selectedProblemId, durationMins);
        } else {
          setOopProblems(prev => 
            prev.map(problem => 
              problem.id === selectedProblemId 
                ? { ...problem, timeSpentMins: problem.timeSpentMins + durationMins }
                : problem
            )
          );
          await addTimeToOopProblem(selectedProblemId, durationMins);
        }
      }
    } catch (error) {
      console.error('Error saving session:', error);
    } finally {
      setSelectedProblemId(null);
    }
  };

  const weeklyStats = getStats(filteredProblems);
  const oopStats = getStats(filteredOopProblems);

  const categories = Array.from(new Set(problems.map(p => p.category)));
  // const tracks = Array.from(new Set(oopProblems.map(p => p.track)));
  const weeks = Array.from(new Set([...problems.map(p => p.week), ...oopProblems.map(p => p.week)])).sort();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Problem Sets</h1>
        <p className="text-gray-600">
          Track your progress on coding problems and OOP exercises.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="weekly">Weekly Problems</TabsTrigger>
              <TabsTrigger value="oop">OOP Problems</TabsTrigger>
            </TabsList>

            <TabsContent value="weekly" className="space-y-6">
              {/* Weekly Problems Stats */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{weeklyStats.total}</div>
                    <div className="text-sm text-gray-600">Total</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{weeklyStats.solved}</div>
                    <div className="text-sm text-gray-600">Solved</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-gray-600">{weeklyStats.todo}</div>
                    <div className="text-sm text-gray-600">To Do</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-600">{weeklyStats.skipped}</div>
                    <div className="text-sm text-gray-600">Skipped</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">{Math.round(weeklyStats.totalTime / 60)}h</div>
                    <div className="text-sm text-gray-600">Time Spent</div>
                  </CardContent>
                </Card>
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
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-sm font-medium">Week</label>
                      <select 
                        value={filters.week} 
                        onChange={(e) => setFilters(prev => ({ ...prev, week: Number(e.target.value) }))}
                        className="w-full mt-1 p-2 border rounded-md text-sm"
                      >
                        <option value={0}>All Weeks</option>
                        {weeks.map(week => (
                          <option key={week} value={week}>Week {week}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Category</label>
                      <select 
                        value={filters.category} 
                        onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full mt-1 p-2 border rounded-md text-sm"
                      >
                        <option value="">All Categories</option>
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Difficulty</label>
                      <select 
                        value={filters.difficulty} 
                        onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value }))}
                        className="w-full mt-1 p-2 border rounded-md text-sm"
                      >
                        <option value="">All Difficulties</option>
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Status</label>
                      <select 
                        value={filters.status} 
                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full mt-1 p-2 border rounded-md text-sm"
                      >
                        <option value="">All Status</option>
                        <option value="todo">To Do</option>
                        <option value="solved">Solved</option>
                        <option value="skipped">Skipped</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Weekly Problems List */}
              <div className="space-y-4">
                {loading ? (
                  <Card className="p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-lg font-medium">Loading problems...</p>
                  </Card>
                ) : filteredProblems.map(problem => (
                  <Card key={problem.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">Week {problem.week}</Badge>
                            <Badge variant="outline" className="text-xs">{problem.category}</Badge>
                            <DifficultyPill difficulty={problem.difficulty} />
                            <StatusPill status={problem.status} />
                          </div>
                          
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {problem.name}
                          </h3>
                          
                          {problem.timeSpentMins > 0 && (
                            <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                              <Timer className="h-4 w-4" />
                              {problem.timeSpentMins} minutes spent
                            </div>
                          )}
                          
                          {problem.notes && (
                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                              {problem.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-4">
                        <Button
                          size="sm"
                          variant={problem.status === 'solved' ? 'default' : 'outline'}
                          onClick={() => updateProblemStatusHandler(problem.id, 
                            problem.status === 'solved' ? 'todo' : 'solved', 'weekly')}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          {problem.status === 'solved' ? 'Solved' : 'Mark Solved'}
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startTimer(problem.id, 'weekly')}
                          className={selectedProblemId === problem.id && selectedProblemType === 'weekly' ? 
                            'bg-blue-50 border-blue-200' : ''}
                        >
                          <Clock className="h-4 w-4 mr-1" />
                          Timer
                        </Button>
                        
                        {problem.url && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(problem.url, '_blank', 'noopener,noreferrer')}
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Open Problem
                          </Button>
                        )}
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateProblemStatusHandler(problem.id, 
                            problem.status === 'skipped' ? 'todo' : 'skipped', 'weekly')}
                        >
                          {problem.status === 'skipped' ? 'Restore' : 'Skip'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {filteredProblems.length === 0 && (
                  <Card className="p-8 text-center">
                    <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium text-gray-500">No problems found</p>
                    <p className="text-sm text-gray-400 mt-2">Try adjusting your filters or import your data</p>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="oop" className="space-y-6">
              {/* OOP Problems Stats */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{oopStats.total}</div>
                    <div className="text-sm text-gray-600">Total</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{oopStats.solved}</div>
                    <div className="text-sm text-gray-600">Solved</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-gray-600">{oopStats.todo}</div>
                    <div className="text-sm text-gray-600">To Do</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-600">{oopStats.skipped}</div>
                    <div className="text-sm text-gray-600">Skipped</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">{Math.round(oopStats.totalTime / 60)}h</div>
                    <div className="text-sm text-gray-600">Time Spent</div>
                  </CardContent>
                </Card>
              </div>

              {/* OOP Problems List */}
              <div className="space-y-4">
                {loading ? (
                  <Card className="p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-lg font-medium">Loading OOP problems...</p>
                  </Card>
                ) : filteredOopProblems.map(problem => (
                  <Card key={problem.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">Week {problem.week}</Badge>
                            <Badge variant="outline" className="text-xs">{problem.track}</Badge>
                            <DifficultyPill difficulty={problem.difficulty} />
                            <StatusPill status={problem.status} />
                          </div>
                          
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {problem.name}
                          </h3>
                          
                          {problem.timeSpentMins > 0 && (
                            <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                              <Timer className="h-4 w-4" />
                              {problem.timeSpentMins} minutes spent
                            </div>
                          )}
                          
                          {problem.notes && (
                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                              {problem.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-4">
                        <Button
                          size="sm"
                          variant={problem.status === 'solved' ? 'default' : 'outline'}
                          onClick={() => updateProblemStatusHandler(problem.id, 
                            problem.status === 'solved' ? 'todo' : 'solved', 'oop')}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          {problem.status === 'solved' ? 'Solved' : 'Mark Solved'}
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startTimer(problem.id, 'oop')}
                          className={selectedProblemId === problem.id && selectedProblemType === 'oop' ? 
                            'bg-blue-50 border-blue-200' : ''}
                        >
                          <Clock className="h-4 w-4 mr-1" />
                          Timer
                        </Button>
                        
                        {problem.url && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(problem.url, '_blank', 'noopener,noreferrer')}
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Open Problem
                          </Button>
                        )}
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateProblemStatusHandler(problem.id, 
                            problem.status === 'skipped' ? 'todo' : 'skipped', 'oop')}
                        >
                          {problem.status === 'skipped' ? 'Restore' : 'Skip'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {filteredOopProblems.length === 0 && (
                  <Card className="p-8 text-center">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium text-gray-500">No OOP problems found</p>
                    <p className="text-sm text-gray-400 mt-2">Try adjusting your filters or import your data</p>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Session Timer Sidebar */}
        <div className="space-y-6">
          <SessionTimer 
            onSessionComplete={handleSessionComplete}
            linkedItemId={selectedProblemId || undefined}
            linkedItemType={selectedProblemType === 'weekly' ? 'problem' : 'oop_problem'}
          />

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="h-5 w-5" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Weekly Progress</span>
                  <span className="font-semibold">
                    {weeklyStats.solved}/{weeklyStats.total}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${weeklyStats.total > 0 ? (weeklyStats.solved / weeklyStats.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">OOP Progress</span>
                  <span className="font-semibold">
                    {oopStats.solved}/{oopStats.total}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${oopStats.total > 0 ? (oopStats.solved / oopStats.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
