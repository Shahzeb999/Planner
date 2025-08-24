'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Target, 
  Calendar, 
  Clock, 
  Plus,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Filter,
  FileText,
  Star
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { getAllMocks, updateMockOutcome, scheduleMock } from '@/app/actions/data';

interface Mock {
  id: number;
  week: number;
  mockType: string;
  goal: string;
  notes?: string | null;
  scheduledAt?: number | null; // Unix timestamp
  outcome?: 'pass' | 'borderline' | 'fail' | null;
  feedback?: string | null;
  score?: number | null; // 1-5 rating
  duration?: number | null; // minutes
  interviewer?: string | null;
  createdAt: number; // Unix timestamp
  updatedAt: number; // Unix timestamp
}

// Mock types for filtering
const mockTypes = ['System Design', 'ML System Design', 'Behavioral', 'LLM Technical', 'Coding', 'Research Discussion'];

export default function MocksPage() {
  const [mocks, setMocks] = useState<Mock[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedMock, setSelectedMock] = useState<Mock | null>(null);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [filters, setFilters] = useState({
    mockType: '',
    outcome: '',
    week: 0,
  });

  // Load mocks data
  useEffect(() => {
    const loadMocks = async () => {
      try {
        setLoading(true);
        const mocksData = await getAllMocks();
        setMocks(mocksData);
      } catch (error) {
        console.error('Error loading mocks:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMocks();
  }, []);

  // Filter mocks based on tab and filters
  const getFilteredMocks = () => {
    let filtered = mocks;

    // Apply filters
    if (filters.mockType) {
      filtered = filtered.filter(mock => mock.mockType === filters.mockType);
    }
    if (filters.outcome) {
      filtered = filtered.filter(mock => mock.outcome === filters.outcome);
    }
    if (filters.week) {
      filtered = filtered.filter(mock => mock.week === filters.week);
    }

    // Apply tab filter
    const now = new Date();
    switch (activeTab) {
      case 'upcoming':
        return filtered.filter(mock => 
          mock.scheduledAt && new Date(mock.scheduledAt * 1000) > now
        ).sort((a, b) => 
          (a.scheduledAt! * 1000) - (b.scheduledAt! * 1000)
        );
      case 'completed':
        return filtered.filter(mock => mock.outcome).sort((a, b) => 
          (b.updatedAt * 1000) - (a.updatedAt * 1000)
        );
      case 'unscheduled':
        return filtered.filter(mock => !mock.scheduledAt);
      case 'all':
      default:
        return filtered.sort((a, b) => 
          (b.updatedAt * 1000) - (a.updatedAt * 1000)
        );
    }
  };

  const filteredMocks = getFilteredMocks();

  // Statistics
  const totalMocks = mocks.length;
  const scheduledMocks = mocks.filter(mock => mock.scheduledAt).length;
  const completedMocks = mocks.filter(mock => mock.outcome).length;
  const averageScore = completedMocks > 0 
    ? mocks.filter(mock => mock.score).reduce((sum, mock) => sum + (mock.score || 0), 0) / mocks.filter(mock => mock.score).length
    : 0;

  const passRate = completedMocks > 0 
    ? (mocks.filter(mock => mock.outcome === 'pass').length / completedMocks) * 100 
    : 0;

  const getOutcomeIcon = (outcome?: string) => {
    switch (outcome) {
      case 'pass':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'borderline':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getOutcomeColor = (outcome?: string) => {
    switch (outcome) {
      case 'pass':
        return 'bg-green-100 text-green-800';
      case 'borderline':
        return 'bg-yellow-100 text-yellow-800';
      case 'fail':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const scheduleSelectedMock = async (scheduledAt: string, interviewer?: string, duration?: number) => {
    if (!selectedMock) return;
    
    try {
      // Optimistic update
      setMocks(prev => 
        prev.map(mock => {
          if (mock.id === selectedMock.id) {
            try {
              const scheduledDate = new Date(scheduledAt);
              if (isNaN(scheduledDate.valueOf())) {
                return mock; // Don't update if invalid date
              }
              
              return {
                ...mock,
                scheduledAt: Math.floor(scheduledDate.valueOf() / 1000),
                interviewer,
                duration,
                updatedAt: Math.floor(Date.now() / 1000)
              };
            } catch (error) {
              return mock; // Don't update on error
            }
          }
          return mock;
        })
      );
      
      // Persist to database
      await scheduleMock(selectedMock.id, scheduledAt, interviewer, duration);
      console.log('Mock scheduled:', selectedMock.id, scheduledAt);
    } catch (error) {
      console.error('Error scheduling mock:', error);
      // Reload data on error
      const mocksData = await getAllMocks();
      setMocks(mocksData);
    }
  };

  const updateSelectedMockOutcome = async (outcome: 'pass' | 'borderline' | 'fail', feedback?: string, score?: number) => {
    if (!selectedMock) return;
    
    try {
      // Optimistic update
      setMocks(prev => 
        prev.map(mock => 
          mock.id === selectedMock.id 
            ? { ...mock, outcome, feedback, score, updatedAt: Math.floor(Date.now() / 1000) }
            : mock
        )
      );
      
      // Persist to database
      await updateMockOutcome(selectedMock.id, outcome, feedback, score);
      console.log('Mock outcome updated:', selectedMock.id, outcome);
    } catch (error) {
      console.error('Error updating mock outcome:', error);
      // Reload data on error
      const mocksData = await getAllMocks();
      setMocks(mocksData);
    }
  };

  const generateDebriefTemplate = (mock: Mock) => {
    return `# Mock Interview Debrief - ${mock.mockType}

**Date:** ${mock.scheduledAt ? format(new Date(mock.scheduledAt * 1000), 'PPP') : 'TBD'}
**Duration:** ${mock.duration || 'N/A'} minutes
**Interviewer:** ${mock.interviewer || 'TBD'}
**Goal:** ${mock.goal}

## Performance Rating: ${mock.score ? '⭐'.repeat(mock.score) : 'Not rated'}

## What Went Well
- [ ] 
- [ ] 
- [ ] 

## Areas for Improvement
- [ ] 
- [ ] 
- [ ] 

## Technical Concepts to Review
- [ ] 
- [ ] 
- [ ] 

## Action Items
- [ ] 
- [ ] 
- [ ] 

## Feedback Notes
${mock.feedback || 'No feedback provided yet.'}

## Next Steps
- [ ] Schedule follow-up practice session
- [ ] Review recommended resources
- [ ] Book next mock interview
`;
  };

  const weeks = Array.from(new Set(mocks.map(mock => mock.week))).sort();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mock Interviews</h1>
        <p className="text-gray-600">
          Schedule, track, and review your mock interview performance.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            {loading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            ) : (
              <>
            <div className="text-2xl font-bold text-blue-600">{totalMocks}</div>
            <div className="text-sm text-gray-600">Total Mocks</div>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            {loading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            ) : (
              <>
            <div className="text-2xl font-bold text-green-600">{scheduledMocks}</div>
            <div className="text-sm text-gray-600">Scheduled</div>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            {loading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            ) : (
              <>
            <div className="text-2xl font-bold text-purple-600">{completedMocks}</div>
            <div className="text-sm text-gray-600">Completed</div>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            {loading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            ) : (
              <>
            <div className="text-2xl font-bold text-orange-600">{averageScore.toFixed(1)}</div>
            <div className="text-sm text-gray-600">Avg Score</div>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            {loading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            ) : (
              <>
            <div className="text-2xl font-bold text-emerald-600">{Math.round(passRate)}%</div>
            <div className="text-sm text-gray-600">Pass Rate</div>
              </>
            )}
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select 
              value={filters.mockType} 
              onChange={(e) => setFilters(prev => ({ ...prev, mockType: e.target.value }))}
              className="p-2 border rounded-md text-sm"
            >
              <option value="">All Types</option>
              {mockTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <select 
              value={filters.outcome} 
              onChange={(e) => setFilters(prev => ({ ...prev, outcome: e.target.value }))}
              className="p-2 border rounded-md text-sm"
            >
              <option value="">All Outcomes</option>
              <option value="pass">Pass</option>
              <option value="borderline">Borderline</option>
              <option value="fail">Fail</option>
            </select>
            <select 
              value={filters.week} 
              onChange={(e) => setFilters(prev => ({ ...prev, week: Number(e.target.value) }))}
              className="p-2 border rounded-md text-sm"
            >
              <option value={0}>All Weeks</option>
              {weeks.map(week => (
                <option key={week} value={week}>Week {week}</option>
              ))}
            </select>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setFilters({ mockType: '', outcome: '', week: 0 })}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="unscheduled">Unscheduled</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
          
          <Button onClick={() => setShowScheduleDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Schedule Mock
          </Button>
        </div>

        <TabsContent value={activeTab} className="space-y-4">
          {loading ? (
            <Card className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-lg font-medium">Loading mock interviews...</p>
            </Card>
          ) : filteredMocks.map(mock => (
            <Card key={mock.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">Week {mock.week}</Badge>
                      <Badge variant="outline" className="text-xs">{mock.mockType}</Badge>
                      {mock.outcome && (
                        <Badge className={getOutcomeColor(mock.outcome)}>
                          {getOutcomeIcon(mock.outcome)}
                          <span className="ml-1 capitalize">{mock.outcome}</span>
                        </Badge>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {mock.goal}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                      {mock.scheduledAt && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(mock.scheduledAt * 1000), 'PPP p')}
                        </div>
                      )}
                      {mock.duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {mock.duration} minutes
                        </div>
                      )}
                      {mock.score && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4" />
                          {mock.score}/5 rating
                        </div>
                      )}
                    </div>
                    
                    {mock.notes && (
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg mb-4">
                        <strong>Notes:</strong> {mock.notes}
                      </p>
                    )}
                    
                    {mock.feedback && (
                      <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg mb-4">
                        <strong>Feedback:</strong> {mock.feedback}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {!mock.scheduledAt && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedMock(mock);
                        setShowScheduleDialog(true);
                      }}
                    >
                      <Calendar className="h-4 w-4 mr-1" />
                      Schedule
                    </Button>
                  )}
                  
                  {mock.scheduledAt && !mock.outcome && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedMock(mock);
                        setShowFeedbackDialog(true);
                      }}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Record Outcome
                    </Button>
                  )}
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const template = generateDebriefTemplate(mock);
                      navigator.clipboard.writeText(template);
                      // Could add a toast notification here
                    }}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    Copy Debrief
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {!loading && filteredMocks.length === 0 && (
            <Card className="p-8 text-center">
              <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium text-gray-500">No mock interviews found</p>
              <p className="text-sm text-gray-400 mt-2">
                {activeTab === 'upcoming' && 'Schedule your first mock interview to get started'}
                {activeTab === 'completed' && 'Complete some mock interviews to see results here'}
                {activeTab === 'unscheduled' && 'All mock interviews have been scheduled'}
                {activeTab === 'all' && 'Create your first mock interview plan'}
              </p>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Schedule Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Mock Interview</DialogTitle>
          </DialogHeader>
          <form className="space-y-4">
            <div>
              <label className="text-sm font-medium">Date & Time</label>
              <input
                name="scheduledAt"
                type="datetime-local"
                className="w-full mt-1 p-2 border rounded-md"
                min={new Date().toISOString().slice(0, 16)}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Interviewer (optional)</label>
              <input
                name="interviewer"
                type="text"
                placeholder="Enter interviewer name"
                className="w-full mt-1 p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Duration (minutes)</label>
              <select name="duration" className="w-full mt-1 p-2 border rounded-md">
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
                <option value={90}>90 minutes</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={async (e) => {
                  const form = e.currentTarget.closest('form') as HTMLFormElement;
                  const formData = new FormData(form);
                  const scheduledAt = formData.get('scheduledAt') as string;
                  const interviewer = formData.get('interviewer') as string;
                  const duration = parseInt(formData.get('duration') as string);
                  
                  if (scheduledAt) {
                    await scheduleSelectedMock(
                      new Date(scheduledAt).toISOString(),
                      interviewer || undefined,
                      duration || undefined
                    );
                    setShowScheduleDialog(false);
                    setSelectedMock(null);
                  }
                }} 
                className="flex-1"
              >
                Schedule Interview
              </Button>
              <Button variant="outline" onClick={() => {
                setShowScheduleDialog(false);
                setSelectedMock(null);
              }}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Interview Outcome</DialogTitle>
          </DialogHeader>
          <form className="space-y-4">
            <div>
              <label className="text-sm font-medium">Outcome</label>
              <select name="outcome" className="w-full mt-1 p-2 border rounded-md" required>
                <option value="pass">Pass</option>
                <option value="borderline">Borderline</option>
                <option value="fail">Fail</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Rating (1-5)</label>
              <select name="score" className="w-full mt-1 p-2 border rounded-md" required>
                <option value={1}>1 - Poor</option>
                <option value={2}>2 - Below Average</option>
                <option value={3}>3 - Average</option>
                <option value={4}>4 - Good</option>
                <option value={5}>5 - Excellent</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Feedback</label>
              <textarea
                name="feedback"
                placeholder="Enter detailed feedback..."
                className="w-full mt-1 p-2 border rounded-md resize-none"
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={async (e) => {
                  const form = e.currentTarget.closest('form') as HTMLFormElement;
                  const formData = new FormData(form);
                  const outcome = formData.get('outcome') as 'pass' | 'borderline' | 'fail';
                  const score = parseInt(formData.get('score') as string);
                  const feedback = formData.get('feedback') as string;
                  
                  if (outcome && score) {
                    await updateSelectedMockOutcome(outcome, feedback || undefined, score);
                    setShowFeedbackDialog(false);
                    setSelectedMock(null);
                  }
                }} 
                className="flex-1"
              >
                Save Feedback
              </Button>
              <Button variant="outline" onClick={() => {
                setShowFeedbackDialog(false);
                setSelectedMock(null);
              }}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
