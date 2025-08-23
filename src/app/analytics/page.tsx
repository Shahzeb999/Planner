'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Clock,
  AlertTriangle,
  Star,
  Activity
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { getAnalyticsData } from '@/app/actions/data';

interface AnalyticsData {
  weeklyProgress: { week: number; completed: number; total: number; timeSpent: number }[];
  problemProgress: { week: number; easy: number; medium: number; hard: number }[];
  taskTypeDistribution: { name: string; value: number; color: string }[];
  mockPerformance: { week: number; systemDesign: number; coding: number; behavioral: number; mlDesign: number }[];
  studyTimeByCategory: { category: string; hours: number; sessions: number }[];
  gaps: { area: string; mentions: number; lastEdited: string }[];
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('6weeks');
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    weeklyProgress: [],
    problemProgress: [],
    taskTypeDistribution: [],
    mockPerformance: [],
    studyTimeByCategory: [],
    gaps: []
  });

  // Load analytics data
  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const rawData = await getAnalyticsData();
        
        // Transform the data to match expected structure
        const transformedData = {
          weeklyProgress: rawData.weeklyProgress.map(week => ({
            week: week.week,
            completed: week.completed || 0,
            total: week.total || 0,
            timeSpent: 0 // Will be calculated from sessionTime
          })),
          problemProgress: transformProblemData(rawData.problemsByDifficulty),
          taskTypeDistribution: rawData.taskTypeDistribution.map(task => ({
            name: task.taskType,
            value: task.count,
            color: getTaskTypeColor(task.taskType)
          })),
          mockPerformance: transformMockData(rawData.mockPerformance),
          studyTimeByCategory: transformSessionData(rawData.sessionTime),
          gaps: [] // Knowledge gaps not implemented yet
        };
        
        setAnalyticsData(transformedData);
      } catch (error) {
        console.error('Error loading analytics data:', error);
        // Keep empty data on error
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [dateRange]);

  // Helper functions to transform data
  const transformProblemData = (problemsByDifficulty: any[]) => {
    const weekMap: Record<number, { week: number; easy: number; medium: number; hard: number }> = {};
    
    problemsByDifficulty.forEach(item => {
      if (!weekMap[item.week]) {
        weekMap[item.week] = { week: item.week, easy: 0, medium: 0, hard: 0 };
      }
      
      if (item.difficulty === 'Easy') weekMap[item.week].easy = item.solved || 0;
      if (item.difficulty === 'Medium') weekMap[item.week].medium = item.solved || 0;
      if (item.difficulty === 'Hard') weekMap[item.week].hard = item.solved || 0;
    });
    
    return Object.values(weekMap);
  };
  
  const transformMockData = (mockPerformance: any[]) => {
    const weekMap: Record<number, { week: number; systemDesign: number; coding: number; behavioral: number; mlDesign: number }> = {};
    
    mockPerformance.forEach(item => {
      if (!weekMap[item.week]) {
        weekMap[item.week] = { week: item.week, systemDesign: 0, coding: 0, behavioral: 0, mlDesign: 0 };
      }
      // This would need more sophisticated transformation based on mockType and outcome
    });
    
    return Object.values(weekMap);
  };
  
  const transformSessionData = (sessionTime: any[]) => {
    const categoryMap: Record<string, { category: string; hours: number; sessions: number }> = {};
    
    sessionTime.forEach(session => {
      if (!categoryMap[session.kind]) {
        categoryMap[session.kind] = { category: session.kind, hours: 0, sessions: 0 };
      }
      
      categoryMap[session.kind].hours += (session.totalMinutes || 0) / 60;
      categoryMap[session.kind].sessions += 1;
    });
    
    return Object.values(categoryMap);
  };
  
  const getTaskTypeColor = (taskType: string) => {
    const colors: Record<string, string> = {
      'Study': '#3B82F6',
      'Practice': '#10B981', 
      'Project': '#8B5CF6',
      'Mock': '#F59E0B',
      'Challenge': '#EF4444'
    };
    return colors[taskType] || '#6B7280';
  };

  // Calculate derived metrics
  const totalCompleted = analyticsData.weeklyProgress.reduce((sum, week) => sum + week.completed, 0);
  const totalPlanned = analyticsData.weeklyProgress.reduce((sum, week) => sum + week.total, 0);
  const totalTimeSpent = analyticsData.weeklyProgress.reduce((sum, week) => sum + week.timeSpent, 0);
  const overallProgress = totalPlanned > 0 ? (totalCompleted / totalPlanned) * 100 : 0;

  const totalProblems = analyticsData.problemProgress.reduce((sum, week) => 
    sum + week.easy + week.medium + week.hard, 0
  );
  
  const averageMockScore = analyticsData.mockPerformance.length > 0 ? 
    analyticsData.mockPerformance.reduce((sum, week) => {
      const scores = [week.systemDesign, week.coding, week.behavioral, week.mlDesign].filter(s => s > 0);
      return sum + (scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0);
    }, 0) / analyticsData.mockPerformance.length : 0;

  const currentWeek = analyticsData.weeklyProgress.length > 0 ? 
    Math.max(...analyticsData.weeklyProgress.map(w => w.week)) : 0;
  const lastWeekProgress = analyticsData.weeklyProgress.find(w => w.week === currentWeek);
  const prevWeekProgress = analyticsData.weeklyProgress.find(w => w.week === currentWeek - 1);
  
  const progressTrend = lastWeekProgress && prevWeekProgress 
    ? ((lastWeekProgress.completed / lastWeekProgress.total) - (prevWeekProgress.completed / prevWeekProgress.total)) * 100
    : 0;

  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ dataKey: string; value: number; color: string }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{`Week ${label}`}</p>
          {payload.map((entry, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">
            Track your progress and identify areas for improvement.
          </p>
        </div>
        
        <div className="flex gap-2">
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="p-2 border rounded-md text-sm"
          >
            <option value="2weeks">Last 2 Weeks</option>
            <option value="4weeks">Last 4 Weeks</option>
            <option value="6weeks">Last 6 Weeks</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{Math.round(overallProgress)}%</div>
            <div className="text-sm text-gray-600">Overall Progress</div>
            <div className={`text-xs mt-1 flex items-center justify-center gap-1 ${
              progressTrend >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className="h-3 w-3" />
              {progressTrend >= 0 ? '+' : ''}{progressTrend.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{totalCompleted}</div>
            <div className="text-sm text-gray-600">Tasks Completed</div>
            <div className="text-xs text-gray-500 mt-1">of {totalPlanned} total</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{totalTimeSpent}h</div>
            <div className="text-sm text-gray-600">Time Invested</div>
            <div className="text-xs text-gray-500 mt-1">
              {analyticsData.weeklyProgress.length > 0 ? Math.round(totalTimeSpent / analyticsData.weeklyProgress.length) : 0}h/week avg
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{totalProblems}</div>
            <div className="text-sm text-gray-600">Problems Solved</div>
            <div className="text-xs text-gray-500 mt-1">
              {analyticsData.problemProgress.length > 0 ? Math.round(totalProblems / analyticsData.problemProgress.length) : 0}/week avg
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{averageMockScore.toFixed(1)}</div>
            <div className="text-sm text-gray-600">Mock Avg Score</div>
            <div className="text-xs text-gray-500 mt-1">out of 5.0</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="problems">Problems</TabsTrigger>
          <TabsTrigger value="mocks">Mock Performance</TabsTrigger>
          <TabsTrigger value="time">Time Analysis</TabsTrigger>
          <TabsTrigger value="gaps">Knowledge Gaps</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Weekly Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-[300px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.weeklyProgress}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="completed" fill="#10B981" name="Completed" />
                    <Bar dataKey="total" fill="#E5E7EB" name="Total" />
                  </BarChart>
                </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Task Type Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Task Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-[300px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.taskTypeDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }: { name?: string; percent?: number }) => 
                        `${name || ''} ${percent ? (percent * 100).toFixed(0) : '0'}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analyticsData.taskTypeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Time Spent Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Time Investment Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analyticsData.weeklyProgress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="timeSpent" 
                    stroke="#8B5CF6" 
                    fill="#8B5CF6" 
                    fillOpacity={0.3}
                    name="Hours Spent"
                  />
                </AreaChart>
              </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="problems" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Problem Difficulty Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Problems by Difficulty</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-[300px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.problemProgress}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="easy" stackId="a" fill="#10B981" name="Easy" />
                    <Bar dataKey="medium" stackId="a" fill="#F59E0B" name="Medium" />
                    <Bar dataKey="hard" stackId="a" fill="#EF4444" name="Hard" />
                  </BarChart>
                </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Problem Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Problem Solving Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {analyticsData.problemProgress.reduce((sum, week) => sum + week.easy, 0)}
                    </div>
                    <div className="text-sm text-gray-600">Easy</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">
                      {analyticsData.problemProgress.reduce((sum, week) => sum + week.medium, 0)}
                    </div>
                    <div className="text-sm text-gray-600">Medium</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">
                      {analyticsData.problemProgress.reduce((sum, week) => sum + week.hard, 0)}
                    </div>
                    <div className="text-sm text-gray-600">Hard</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Easy Problems</span>
                      <span>75%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Medium Problems</span>
                      <span>60%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Hard Problems</span>
                      <span>35%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-red-600 h-2 rounded-full" style={{ width: '35%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="mocks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Mock Interview Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-[400px]">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={analyticsData.mockPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis domain={[0, 5]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="systemDesign" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    name="System Design"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="coding" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    name="Coding"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="behavioral" 
                    stroke="#8B5CF6" 
                    strokeWidth={2}
                    name="Behavioral"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="mlDesign" 
                    stroke="#F59E0B" 
                    strokeWidth={2}
                    name="ML Design"
                  />
                </LineChart>
              </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="time" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Study Time by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : analyticsData.studyTimeByCategory.map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{category.category}</div>
                      <div className="text-sm text-gray-600">
                        {category.sessions} sessions
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">
                        {category.hours}h
                      </div>
                      <div className="text-xs text-gray-500">
                        {Math.round(category.hours / category.sessions * 10) / 10}h avg
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gaps" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Knowledge Gaps & Focus Areas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Areas frequently mentioned in notes and requiring more attention.
              </p>
              <div className="space-y-3">
                {loading ? (
                  <div className="flex items-center justify-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : analyticsData.gaps.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No knowledge gaps identified yet.</p>
                    <p className="text-sm mt-1">Gaps will be identified based on your notes and sessions.</p>
                  </div>
                ) : analyticsData.gaps.map((gap, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{gap.area}</div>
                      <div className="text-sm text-gray-600">
                        Last edited: {format(parseISO(gap.lastEdited), 'MMM d, yyyy')}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {gap.mentions} mentions
                      </Badge>
                      <Button size="sm" variant="outline">
                        Review
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
