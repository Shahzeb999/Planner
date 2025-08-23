'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusPill } from '@/components/status-pill';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  Target,
  CheckCircle2,
  Plus,
  Filter
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameMonth, isSameDay, parseISO } from 'date-fns';
import { getPlanItemsByDateRange, getMocksByDateRange, updatePlanItemStatus } from '@/app/actions/data';

interface CalendarPlanItem {
  id: number;
  date: string; // ISO date string
  taskType: string;
  taskDesc: string;
  theme: string;
  status: 'todo' | 'in_progress' | 'done';
  weeklyChallenge?: string;
}

interface CalendarMock {
  id: number;
  scheduledAt: number; // Unix timestamp
  mockType: string;
  goal: string;
  outcome?: 'pass' | 'borderline' | 'fail';
}

// Interfaces remain the same - data will come from database

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [planItems, setPlanItems] = useState<CalendarPlanItem[]>([]);
  const [mocks, setMocks] = useState<CalendarMock[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    taskType: '',
    status: '',
    theme: '',
  });

  // Load data for current month view
  useEffect(() => {
    const loadCalendarData = async () => {
      try {
        setLoading(true);
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        
        const startDate = format(monthStart, 'yyyy-MM-dd');
        const endDate = format(monthEnd, 'yyyy-MM-dd');
        
        const [planData, mockData] = await Promise.all([
          getPlanItemsByDateRange(startDate, endDate),
          getMocksByDateRange(startDate, endDate)
        ]);
        
        setPlanItems(planData);
        setMocks(mockData);
      } catch (error) {
        console.error('Error loading calendar data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCalendarData();
  }, [currentDate]);

  // Calendar calculations
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Add padding days for proper calendar grid
  const startDay = getDay(monthStart);
  const paddingDays = Array.from({ length: startDay }, (_, i) => {
    const date = new Date(monthStart);
    date.setDate(date.getDate() - (startDay - i));
    return date;
  });

  const allCalendarDays = [...paddingDays, ...calendarDays];

  // Filter functions
  const getItemsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return planItems.filter(item => {
      if (item.date !== dateStr) return false;
      if (filters.taskType && item.taskType !== filters.taskType) return false;
      if (filters.status && item.status !== filters.status) return false;
      if (filters.theme && item.theme !== filters.theme) return false;
      return true;
    });
  };

  const getMocksForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return mocks.filter(mock => {
      const mockDate = format(new Date(mock.scheduledAt * 1000), 'yyyy-MM-dd');
      return mockDate === dateStr;
    });
  };

  // Statistics
  const currentMonthItems = planItems.filter(item => {
    const itemDate = parseISO(item.date);
    return isSameMonth(itemDate, currentDate);
  });

  const completedCount = currentMonthItems.filter(item => item.status === 'done').length;
  const totalCount = currentMonthItems.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Event handlers
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1));
  };

  const updateItemStatus = async (id: number, status: 'todo' | 'in_progress' | 'done') => {
    try {
      // Optimistic update
      setPlanItems(prev => 
        prev.map(item => 
          item.id === id ? { ...item, status } : item
        )
      );
      
      // Persist to database
      await updatePlanItemStatus(id, status);
    } catch (error) {
      console.error('Error updating item status:', error);
      // Revert on error - reload data
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      const startDate = format(monthStart, 'yyyy-MM-dd');
      const endDate = format(monthEnd, 'yyyy-MM-dd');
      const planData = await getPlanItemsByDateRange(startDate, endDate);
      setPlanItems(planData);
    }
  };

  const getTaskTypeColor = (taskType: string) => {
    switch (taskType) {
      case 'Study': return 'bg-blue-100 text-blue-800';
      case 'Practice': return 'bg-green-100 text-green-800';
      case 'Project': return 'bg-purple-100 text-purple-800';
      case 'Challenge': return 'bg-orange-100 text-orange-800';
      case 'Mock Interview': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMockOutcomeColor = (outcome?: string) => {
    switch (outcome) {
      case 'pass': return 'bg-green-100 text-green-800';
      case 'borderline': return 'bg-yellow-100 text-yellow-800';
      case 'fail': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const taskTypes = Array.from(new Set(planItems.map(item => item.taskType)));
  const themes = Array.from(new Set(planItems.map(item => item.theme)));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Calendar</h1>
          <p className="text-gray-600">
            Track your preparation timeline and scheduled activities.
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'month' ? 'default' : 'outline'}
            onClick={() => setViewMode('month')}
          >
            Month
          </Button>
          <Button
            variant={viewMode === 'week' ? 'default' : 'outline'}
            onClick={() => setViewMode('week')}
          >
            Week
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            {loading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-blue-600">{totalCount}</div>
                <div className="text-sm text-gray-600">Total This Month</div>
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
                <div className="text-2xl font-bold text-green-600">{completedCount}</div>
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
                <div className="text-2xl font-bold text-orange-600">
                  {currentMonthItems.filter(item => item.status === 'in_progress').length}
                </div>
                <div className="text-sm text-gray-600">In Progress</div>
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
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(progressPercentage)}%
                </div>
                <div className="text-sm text-gray-600">Progress</div>
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
              value={filters.taskType} 
              onChange={(e) => setFilters(prev => ({ ...prev, taskType: e.target.value }))}
              className="p-2 border rounded-md text-sm"
            >
              <option value="">All Task Types</option>
              {taskTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
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
            </select>
            <select 
              value={filters.theme} 
              onChange={(e) => setFilters(prev => ({ ...prev, theme: e.target.value }))}
              className="p-2 border rounded-md text-sm"
            >
              <option value="">All Themes</option>
              {themes.map(theme => (
                <option key={theme} value={theme}>{theme}</option>
              ))}
            </select>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setFilters({ taskType: '', status: '', theme: '' })}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  {format(currentDate, 'MMMM yyyy')}
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth('prev')}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentDate(new Date())}
                  >
                    Today
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth('next')}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Calendar Header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar Grid */}
              {loading ? (
                <div className="flex items-center justify-center h-96">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : (
              <div className="grid grid-cols-7 gap-1">
                {allCalendarDays.map((day, index) => {
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isToday = isSameDay(day, new Date());
                  const dayItems = getItemsForDate(day);
                  const dayMocks = getMocksForDate(day);
                  // const hasEvents = dayItems.length > 0 || dayMocks.length > 0;
                  
                  return (
                    <div
                      key={index}
                      className={`min-h-24 p-1 border rounded cursor-pointer transition-colors ${
                        isCurrentMonth 
                          ? 'bg-white hover:bg-gray-50' 
                          : 'bg-gray-50 text-gray-400'
                      } ${
                        isToday ? 'ring-2 ring-blue-500' : ''
                      } ${
                        selectedDate && isSameDay(day, selectedDate) ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                      onClick={() => setSelectedDate(day)}
                    >
                      <div className="text-sm font-medium mb-1">
                        {format(day, 'd')}
                      </div>
                      
                      {/* Plan Items */}
                      <div className="space-y-1">
                        {dayItems.slice(0, 2).map(item => (
                          <div
                            key={item.id}
                            className={`text-xs p-1 rounded truncate ${getTaskTypeColor(item.taskType)}`}
                            title={item.taskDesc}
                          >
                            {item.weeklyChallenge ? '🏆' : ''} {item.taskDesc}
                          </div>
                        ))}
                        
                        {/* Mocks */}
                        {dayMocks.map(mock => (
                          <div
                            key={mock.id}
                            className={`text-xs p-1 rounded truncate ${getMockOutcomeColor(mock.outcome)}`}
                            title={`${mock.mockType}: ${mock.goal}`}
                          >
                            🎯 {mock.mockType}
                          </div>
                        ))}
                        
                        {/* Show more indicator */}
                        {(dayItems.length + dayMocks.length) > 2 && (
                          <div className="text-xs text-gray-500">
                            +{(dayItems.length + dayMocks.length) - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Selected Date Details */}
          {selectedDate && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Plan Items for Selected Date */}
                {getItemsForDate(selectedDate).map(item => (
                  <div key={item.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={getTaskTypeColor(item.taskType)}>
                        {item.taskType}
                      </Badge>
                      <StatusPill status={item.status} />
                    </div>
                    <p className="text-sm font-medium mb-1">{item.taskDesc}</p>
                    <p className="text-xs text-gray-600">{item.theme}</p>
                    
                    {item.weeklyChallenge && (
                      <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded">
                        <p className="text-xs font-medium text-orange-800">Weekly Challenge</p>
                        <p className="text-xs text-orange-700 mt-1">{item.weeklyChallenge}</p>
                      </div>
                    )}
                    
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateItemStatus(item.id, 
                          item.status === 'done' ? 'todo' : 'done')}
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {item.status === 'done' ? 'Undo' : 'Done'}
                      </Button>
                    </div>
                  </div>
                ))}
                
                {/* Mocks for Selected Date */}
                {getMocksForDate(selectedDate).map(mock => (
                  <div key={mock.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-red-100 text-red-800">
                        {mock.mockType}
                      </Badge>
                      {mock.outcome && (
                        <Badge className={getMockOutcomeColor(mock.outcome)}>
                          {mock.outcome}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm font-medium mb-1">{mock.goal}</p>
                    <p className="text-xs text-gray-600">
                      {format(new Date(mock.scheduledAt * 1000), 'h:mm a')}
                    </p>
                  </div>
                ))}
                
                {getItemsForDate(selectedDate).length === 0 && getMocksForDate(selectedDate).length === 0 && (
                  <div className="text-center py-4">
                    <Target className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm text-gray-500">No events scheduled</p>
                    <Button size="sm" variant="outline" className="mt-2">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Event
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Plan Item
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Target className="h-4 w-4 mr-2" />
                Schedule Mock
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Clock className="h-4 w-4 mr-2" />
                Set Reminder
              </Button>
            </CardContent>
          </Card>

          {/* Month Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Month Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Completed</span>
                  <span>{completedCount}/{totalCount}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">In Progress</span>
                  <span className="font-medium">
                    {currentMonthItems.filter(item => item.status === 'in_progress').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Remaining</span>
                  <span className="font-medium">
                    {currentMonthItems.filter(item => item.status === 'todo').length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
