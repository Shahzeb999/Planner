'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SessionTimer } from '@/components/session-timer';
import { StatusPill } from '@/components/status-pill';
import { Badge } from '@/components/ui/badge';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { 
  Calendar, 
  Clock, 
  ExternalLink, 
  CheckCircle2, 
  PlayCircle,
  BookOpen,
  Target,
  Lightbulb
} from 'lucide-react';
import { getTodaysPlanItems, updatePlanItemStatus, saveSession } from '@/app/actions/data';
import type { PlanItem } from '@/db/schema';

export default function TodayPage() {
  const [todayItems, setTodayItems] = useState<PlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [currentDate, setCurrentDate] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<string>('');

  // Load today's data and setup time updates
  useEffect(() => {
    const loadTodaysData = async () => {
      try {
        setLoading(true);
        const items = await getTodaysPlanItems();
        setTodayItems(items);
      } catch (error) {
        console.error('Error loading today\'s plan items:', error);
      } finally {
        setLoading(false);
      }
    };

    const updateDateTime = () => {
      const now = new Date();
      setCurrentDate(now.toLocaleDateString('en-IN', {
        timeZone: 'Asia/Kolkata',
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }));
      setCurrentTime(now.toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
      }));
    };

    loadTodaysData();
    updateDateTime();
    
    // Update time every minute
    const interval = setInterval(updateDateTime, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const updateItemStatus = async (id: number, status: 'todo' | 'in_progress' | 'done') => {
    try {
      // Optimistic update
      setTodayItems(prev => 
        prev.map(item => 
          item.id === id ? { ...item, status } : item
        )
      );
      
      // Persist to database
      await updatePlanItemStatus(id, status);
    } catch (error) {
      console.error('Error updating item status:', error);
      
      // Revert on error - reload data
      try {
        const items = await getTodaysPlanItems();
        setTodayItems(items);
      } catch (reloadError) {
        console.error('Error reloading data after failed update:', reloadError);
      }
    }
  };

  const openResourceLink = (resourcePointer: string) => {
    if (resourcePointer.includes('→')) {
      const playbookFile = resourcePointer.split('→')[1].trim();
      // Navigate to playbook - this would be implemented with router
      console.log(`Opening playbook: ${playbookFile}`);
    } else {
      window.open(resourcePointer, '_blank', 'noopener,noreferrer');
    }
  };

  const handleSessionComplete = async (durationMins: number, kind: string, notes?: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      await saveSession({
        date: today,
        kind,
        durationMins,
        notes,
        linkedPlanItemId: selectedItemId || undefined,
      });
      
      console.log('Session saved successfully');
    } catch (error) {
      console.error('Error saving session:', error);
    } finally {
      setSelectedItemId(null);
    }
  };

  const completedCount = todayItems.filter(item => item.status === 'done').length;
  const totalCount = todayItems.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <ProtectedRoute>
      <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Today&apos;s Plan</h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {currentDate || 'Loading...'}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {currentTime ? `${currentTime} IST` : 'Loading...'}
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">
            {completedCount}/{totalCount}
          </div>
          <div className="text-sm text-gray-600">Tasks completed</div>
          <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today&apos;s Tasks */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Tasks</h2>
          
          {loading ? (
            <Card className="p-8 text-center">
              <div className="text-gray-500">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-lg font-medium">Loading today's plan...</p>
              </div>
            </Card>
          ) : todayItems.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="text-gray-500">
                <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No tasks scheduled for today</p>
                <p className="text-sm mt-2">Import your Excel file to see your plan</p>
              </div>
            </Card>
          ) : (
            todayItems.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {item.taskType}
                        </Badge>
                        <StatusPill status={item.status} />
                      </div>
                      <CardTitle className="text-lg leading-tight">
                        {item.taskDesc}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{item.theme}</p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {item.status !== 'done' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateItemStatus(item.id, 'in_progress')}
                          disabled={item.status === 'in_progress'}
                        >
                          <PlayCircle className="h-4 w-4 mr-1" />
                          {item.status === 'in_progress' ? 'In Progress' : 'Start'}
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedItemId(selectedItemId === item.id ? null : item.id)}
                          className={selectedItemId === item.id ? 'bg-blue-50 border-blue-200' : ''}
                        >
                          <Clock className="h-4 w-4 mr-1" />
                          Timer
                        </Button>
                      </>
                    )}
                    
                    <Button
                      size="sm"
                      variant={item.status === 'done' ? 'default' : 'outline'}
                      onClick={() => updateItemStatus(item.id, item.status === 'done' ? 'todo' : 'done')}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      {item.status === 'done' ? 'Completed' : 'Mark Done'}
                    </Button>

                    {item.resourcePointer && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openResourceLink(item.resourcePointer!)}
                      >
                        {item.resourcePointer.includes('→') ? (
                          <>
                            <BookOpen className="h-4 w-4 mr-1" />
                            Playbook
                          </>
                        ) : (
                          <>
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Resource
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  {item.weeklyChallenge && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <Lightbulb className="h-5 w-5 text-amber-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-amber-800 text-sm">Weekly Challenge</p>
                          <p className="text-amber-700 text-sm mt-1">{item.weeklyChallenge}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Session Timer */}
        <div className="space-y-6">
          <SessionTimer 
            onSessionComplete={handleSessionComplete}
            linkedItemId={selectedItemId || undefined}
            linkedItemType="plan"
          />

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Today&apos;s Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Completed</span>
                <span className="font-semibold">{completedCount}/{totalCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">In Progress</span>
                <span className="font-semibold">
                  {todayItems.filter(item => item.status === 'in_progress').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Remaining</span>
                <span className="font-semibold">
                  {todayItems.filter(item => item.status === 'todo').length}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                View This Week
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <BookOpen className="h-4 w-4 mr-2" />
                Browse Playbooks
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Target className="h-4 w-4 mr-2" />
                Schedule Mock
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </ProtectedRoute>
  );
}
