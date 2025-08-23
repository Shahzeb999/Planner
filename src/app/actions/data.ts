'use server';

import { db } from '@/db';
import { planItems, problems, oopProblems, mocks, resources, sessions, playbookChecklists } from '@/db/schema';
import { eq, and, gte, lte, desc, asc, sql, count } from 'drizzle-orm';
import { format, startOfDay, endOfDay } from 'date-fns';

// Today's plan items
export async function getTodaysPlanItems(date?: string) {
  // Use consistent date calculation - set to start of day first
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDate = date || today.toISOString().split('T')[0];
  
  const items = await db
    .select()
    .from(planItems)
    .where(eq(planItems.date, targetDate))
    .orderBy(asc(planItems.taskType));
    
  return items;
}

// Plan items for date range (for calendar)
export async function getPlanItemsByDateRange(startDate: string, endDate: string) {
  const items = await db
    .select()
    .from(planItems)
    .where(and(
      gte(planItems.date, startDate),
      lte(planItems.date, endDate)
    ))
    .orderBy(asc(planItems.date));
    
  return items;
}

// All problems with filters
export async function getProblems(filters?: {
  week?: number;
  category?: string;
  difficulty?: string;
  status?: string;
}) {
  let query = db.select().from(problems);
  
  const conditions = [];
  if (filters?.week) conditions.push(eq(problems.week, filters.week));
  if (filters?.category) conditions.push(eq(problems.category, filters.category));
  if (filters?.difficulty) conditions.push(eq(problems.difficulty, filters.difficulty as any));
  if (filters?.status) conditions.push(eq(problems.status, filters.status as any));
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }
  
  const result = await query.orderBy(asc(problems.week), asc(problems.category));
  return result;
}

// OOP problems with filters
export async function getOopProblems(filters?: {
  week?: number;
  track?: string;
  difficulty?: string;
  status?: string;
}) {
  let query = db.select().from(oopProblems);
  
  const conditions = [];
  if (filters?.week) conditions.push(eq(oopProblems.week, filters.week));
  if (filters?.track) conditions.push(eq(oopProblems.track, filters.track));
  if (filters?.difficulty) conditions.push(eq(oopProblems.difficulty, filters.difficulty as any));
  if (filters?.status) conditions.push(eq(oopProblems.status, filters.status as any));
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }
  
  const result = await query.orderBy(asc(oopProblems.week), asc(oopProblems.track));
  return result;
}

// Mocks with filters
export async function getMocks(filters?: {
  week?: number;
  mockType?: string;
  outcome?: string;
}) {
  let query = db.select().from(mocks);
  
  const conditions = [];
  if (filters?.week) conditions.push(eq(mocks.week, filters.week));
  if (filters?.mockType) conditions.push(eq(mocks.mockType, filters.mockType));
  if (filters?.outcome) conditions.push(eq(mocks.outcome, filters.outcome as any));
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }
  
  const result = await query.orderBy(desc(mocks.scheduledAt), desc(mocks.createdAt));
  return result;
}

// Resources
export async function getResources(filters?: {
  week?: number;
  area?: string;
  pinned?: boolean;
}) {
  let query = db.select().from(resources);
  
  const conditions = [];
  if (filters?.week) conditions.push(eq(resources.week, filters.week));
  if (filters?.area) conditions.push(eq(resources.area, filters.area));
  if (filters?.pinned !== undefined) conditions.push(eq(resources.pinned, filters.pinned));
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }
  
  const result = await query.orderBy(desc(resources.pinned), asc(resources.week), asc(resources.area));
  return result;
}

// Analytics data
export async function getAnalyticsData() {
  // Weekly progress
  const weeklyProgress = await db
    .select({
      week: planItems.week,
      total: count(planItems.id),
      completed: sql<number>`SUM(CASE WHEN ${planItems.status} = 'done' THEN 1 ELSE 0 END)`,
      inProgress: sql<number>`SUM(CASE WHEN ${planItems.status} = 'in_progress' THEN 1 ELSE 0 END)`,
    })
    .from(planItems)
    .groupBy(planItems.week)
    .orderBy(asc(planItems.week));

  // Problem progress by difficulty
  const problemsByDifficulty = await db
    .select({
      week: problems.week,
      difficulty: problems.difficulty,
      total: count(problems.id),
      solved: sql<number>`SUM(CASE WHEN ${problems.status} = 'solved' THEN 1 ELSE 0 END)`,
    })
    .from(problems)
    .groupBy(problems.week, problems.difficulty)
    .orderBy(asc(problems.week));

  // Task type distribution
  const taskTypeDistribution = await db
    .select({
      taskType: planItems.taskType,
      count: count(planItems.id),
    })
    .from(planItems)
    .groupBy(planItems.taskType);

  // Mock performance
  const mockPerformance = await db
    .select({
      week: mocks.week,
      mockType: mocks.mockType,
      outcome: mocks.outcome,
      count: count(mocks.id),
    })
    .from(mocks)
    .where(sql`${mocks.outcome} IS NOT NULL`)
    .groupBy(mocks.week, mocks.mockType, mocks.outcome)
    .orderBy(asc(mocks.week));

  // Session time data
  const sessionTime = await db
    .select({
      date: sessions.date,
      kind: sessions.kind,
      totalMinutes: sql<number>`SUM(${sessions.durationMins})`,
    })
    .from(sessions)
    .groupBy(sessions.date, sessions.kind)
    .orderBy(asc(sessions.date));

  return {
    weeklyProgress,
    problemsByDifficulty,
    taskTypeDistribution,
    mockPerformance,
    sessionTime,
  };
}

// Search across all tables
export async function searchContent(query: string, filters?: {
  type?: string;
  week?: number;
  status?: string;
  difficulty?: string;
}) {
  const results: any[] = [];
  
  if (!filters?.type || filters.type === 'plan') {
    const planResults = await db
      .select()
      .from(planItems)
      .where(sql`
        ${planItems.taskDesc} LIKE ${`%${query}%`} OR 
        ${planItems.theme} LIKE ${`%${query}%`} OR
        ${planItems.resourcePointer} LIKE ${`%${query}%`}
      `)
      .limit(20);
    
    results.push(...planResults.map(item => ({
      ...item,
      type: 'plan',
      title: item.taskDesc,
      description: `${item.theme} - Week ${item.week}`,
      content: item.resourcePointer || '',
    })));
  }

  if (!filters?.type || filters.type === 'problem') {
    const problemResults = await db
      .select()
      .from(problems)
      .where(sql`
        ${problems.name} LIKE ${`%${query}%`} OR 
        ${problems.category} LIKE ${`%${query}%`} OR
        ${problems.notes} LIKE ${`%${query}%`}
      `)
      .limit(20);
    
    results.push(...problemResults.map(item => ({
      ...item,
      type: 'problem',
      title: item.name,
      description: `${item.category} - ${item.difficulty}`,
      content: item.notes || '',
    })));
  }

  if (!filters?.type || filters.type === 'oop_problem') {
    const oopResults = await db
      .select()
      .from(oopProblems)
      .where(sql`
        ${oopProblems.name} LIKE ${`%${query}%`} OR 
        ${oopProblems.track} LIKE ${`%${query}%`} OR
        ${oopProblems.notes} LIKE ${`%${query}%`}
      `)
      .limit(20);
    
    results.push(...oopResults.map(item => ({
      ...item,
      type: 'oop_problem',
      title: item.name,
      description: `${item.track} - ${item.difficulty}`,
      content: item.notes || '',
    })));
  }

  if (!filters?.type || filters.type === 'resource') {
    const resourceResults = await db
      .select()
      .from(resources)
      .where(sql`
        ${resources.title} LIKE ${`%${query}%`} OR 
        ${resources.area} LIKE ${`%${query}%`} OR
        ${resources.notes} LIKE ${`%${query}%`}
      `)
      .limit(20);
    
    results.push(...resourceResults.map(item => ({
      ...item,
      type: 'resource',
      title: item.title,
      description: `${item.area} - Week ${item.week}`,
      content: item.notes || '',
    })));
  }

  if (!filters?.type || filters.type === 'mock') {
    const mockResults = await db
      .select()
      .from(mocks)
      .where(sql`
        ${mocks.goal} LIKE ${`%${query}%`} OR 
        ${mocks.mockType} LIKE ${`%${query}%`} OR
        ${mocks.feedback} LIKE ${`%${query}%`}
      `)
      .limit(20);
    
    results.push(...mockResults.map(item => ({
      ...item,
      type: 'mock',
      title: item.goal,
      description: `${item.mockType} - Week ${item.week}`,
      content: item.feedback || item.notes || '',
    })));
  }

  return results;
}

// Update functions
export async function updatePlanItemStatus(id: number, status: 'todo' | 'in_progress' | 'done') {
  await db
    .update(planItems)
    .set({ status, updatedAt: Math.floor(Date.now() / 1000) })
    .where(eq(planItems.id, id));
}

export async function updateProblemStatus(id: number, status: 'todo' | 'solved' | 'skipped') {
  await db
    .update(problems)
    .set({ status, updatedAt: Math.floor(Date.now() / 1000) })
    .where(eq(problems.id, id));
}

export async function updateOopProblemStatus(id: number, status: 'todo' | 'solved' | 'skipped') {
  await db
    .update(oopProblems)
    .set({ status, updatedAt: Math.floor(Date.now() / 1000) })
    .where(eq(oopProblems.id, id));
}

export async function addTimeToProblam(id: number, minutes: number) {
  await db
    .update(problems)
    .set({ 
      timeSpentMins: sql`${problems.timeSpentMins} + ${minutes}`,
      updatedAt: Math.floor(Date.now() / 1000)
    })
    .where(eq(problems.id, id));
}

export async function addTimeToOopProblem(id: number, minutes: number) {
  await db
    .update(oopProblems)
    .set({ 
      timeSpentMins: sql`${oopProblems.timeSpentMins} + ${minutes}`,
      updatedAt: Math.floor(Date.now() / 1000)
    })
    .where(eq(oopProblems.id, id));
}

// Session tracking
export async function saveSession(session: {
  date: string;
  kind: string;
  durationMins: number;
  notes?: string;
  linkedPlanItemId?: number;
  linkedProblemId?: number;
  linkedOopProblemId?: number;
}) {
  await db.insert(sessions).values(session);
}

// Get all mocks
export async function getAllMocks() {
  const mocksData = await db
    .select()
    .from(mocks)
    .orderBy(desc(mocks.updatedAt));
    
  return mocksData;
}

// Get mocks for date range
export async function getMocksByDateRange(startDate: string, endDate: string) {
  const startDateObj = new Date(startDate + 'T00:00:00.000Z');
  const endDateObj = new Date(endDate + 'T23:59:59.999Z');
  
  if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
    console.error('Invalid date range:', { startDate, endDate });
    return [];
  }
  
  const startTimestamp = startDateObj.getTime() / 1000;
  const endTimestamp = endDateObj.getTime() / 1000;
  
  const mocksData = await db
    .select()
    .from(mocks)
    .where(and(
      gte(mocks.scheduledAt, startTimestamp),
      lte(mocks.scheduledAt, endTimestamp)
    ))
    .orderBy(asc(mocks.scheduledAt));
    
  return mocksData;
}

// Update mock outcome
export async function updateMockOutcome(mockId: number, outcome: 'pass' | 'borderline' | 'fail', feedback?: string, score?: number) {
  const result = await db
    .update(mocks)
    .set({
      outcome,
      feedback,
      score,
      updatedAt: Math.floor(Date.now() / 1000),
    })
    .where(eq(mocks.id, mockId));

  return result;
}

// Schedule a mock
export async function scheduleMock(mockId: number, scheduledAt: string, interviewer?: string, duration?: number) {
  const scheduledDate = new Date(scheduledAt);
  
  if (isNaN(scheduledDate.getTime())) {
    throw new Error(`Invalid scheduled date: ${scheduledAt}`);
  }
  
  const scheduledTimestamp = Math.floor(scheduledDate.getTime() / 1000);
  
  const result = await db
    .update(mocks)
    .set({
      scheduledAt: scheduledTimestamp,
      interviewer,
      duration,
      updatedAt: Math.floor(Date.now() / 1000),
    })
    .where(eq(mocks.id, mockId));

  return result;
}

// Search across all tables
export async function searchAllData(query: string) {
  if (!query.trim()) {
    return [];
  }

  const searchTerm = `%${query.toLowerCase()}%`;
  
  // Search plan items
  const planResults = await db
    .select()
    .from(planItems)
    .where(sql`lower(${planItems.taskDesc}) like ${searchTerm} or lower(${planItems.theme}) like ${searchTerm}`)
    .limit(50);
  
  // Search problems  
  const problemResults = await db
    .select()
    .from(problems)
    .where(sql`lower(${problems.name}) like ${searchTerm} or lower(${problems.category}) like ${searchTerm} or lower(${problems.notes}) like ${searchTerm}`)
    .limit(50);
    
  // Search OOP problems
  const oopResults = await db
    .select()
    .from(oopProblems)
    .where(sql`lower(${oopProblems.name}) like ${searchTerm} or lower(${oopProblems.track}) like ${searchTerm} or lower(${oopProblems.notes}) like ${searchTerm}`)
    .limit(50);
    
  // Search resources
  const resourceResults = await db
    .select()
    .from(resources)
    .where(sql`lower(${resources.title}) like ${searchTerm} or lower(${resources.area}) like ${searchTerm} or lower(${resources.notes}) like ${searchTerm}`)
    .limit(50);
    
  // Search mocks
  const mockResults = await db
    .select()
    .from(mocks)
    .where(sql`lower(${mocks.goal}) like ${searchTerm} or lower(${mocks.mockType}) like ${searchTerm} or lower(${mocks.notes}) like ${searchTerm} or lower(${mocks.feedback}) like ${searchTerm}`)
    .limit(50);

  // Transform results to unified format
  const results = [
    ...planResults.map(item => ({
      id: `plan-${item.id}`,
      type: 'plan' as const,
      title: item.taskDesc,
      description: `${item.theme} - ${item.taskType}`,
      content: item.notes || '',
      metadata: {
        week: item.week,
        status: item.status,
        taskType: item.taskType,
        date: item.date,
      },
      relevanceScore: calculateRelevanceScore(query, item.taskDesc + ' ' + item.theme + ' ' + (item.notes || '')),
      matchedFields: []
    })),
    ...problemResults.map(item => ({
      id: `problem-${item.id}`,
      type: 'problem' as const,
      title: item.name,
      description: `${item.category} - ${item.difficulty}`,
      content: item.notes || '',
      metadata: {
        difficulty: item.difficulty,
        category: item.category,
        status: item.status,
        url: item.url,
      },
      relevanceScore: calculateRelevanceScore(query, item.name + ' ' + item.category + ' ' + (item.notes || '')),
      matchedFields: []
    })),
    ...oopResults.map(item => ({
      id: `oop-${item.id}`,
      type: 'oop_problem' as const,
      title: item.name,
      description: `${item.track} - ${item.difficulty}`,
      content: item.notes || '',
      metadata: {
        difficulty: item.difficulty,
        track: item.track,
        status: item.status,
        url: item.url,
      },
      relevanceScore: calculateRelevanceScore(query, item.name + ' ' + item.track + ' ' + (item.notes || '')),
      matchedFields: []
    })),
    ...resourceResults.map(item => ({
      id: `resource-${item.id}`,
      type: 'resource' as const,
      title: item.title,
      description: `${item.area} - Week ${item.week}`,
      content: item.notes || '',
      metadata: {
        area: item.area,
        week: item.week,
        url: item.url,
        pinned: item.pinned,
      },
      relevanceScore: calculateRelevanceScore(query, item.title + ' ' + item.area + ' ' + (item.notes || '')),
      matchedFields: []
    })),
    ...mockResults.map(item => ({
      id: `mock-${item.id}`,
      type: 'mock' as const,
      title: item.goal,
      description: `${item.mockType} - Week ${item.week}`,
      content: (item.notes || '') + ' ' + (item.feedback || ''),
      metadata: {
        mockType: item.mockType,
        week: item.week,
        outcome: item.outcome,
        score: item.score,
        scheduledAt: item.scheduledAt,
      },
      relevanceScore: calculateRelevanceScore(query, item.goal + ' ' + item.mockType + ' ' + (item.notes || '') + ' ' + (item.feedback || '')),
      matchedFields: []
    }))
  ];

  // Sort by relevance score and return top results
  return results
    .filter(item => item.relevanceScore > 30)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 100);
}

// Simple relevance scoring function
function calculateRelevanceScore(query: string, text: string): number {
  if (!query.trim() || !text) return 0;
  
  const queryLower = query.toLowerCase().trim();
  const textLower = text.toLowerCase();
  
  // Exact phrase match gets highest score
  if (textLower.includes(queryLower)) {
    return textLower === queryLower ? 100 : 80;
  }
  
  // Word-based matching
  const queryWords = queryLower.split(' ').filter(word => word.length > 0);
  const textWords = textLower.split(' ');
  
  let matchCount = 0;
  let partialMatches = 0;
  
  for (const queryWord of queryWords) {
    for (const textWord of textWords) {
      if (textWord === queryWord) {
        matchCount++;
        break;
      } else if (textWord.includes(queryWord) || queryWord.includes(textWord)) {
        partialMatches++;
      }
    }
  }
  
  const wordMatchScore = (matchCount / queryWords.length) * 60;
  const partialMatchScore = (partialMatches / queryWords.length) * 30;
  
  return Math.min(wordMatchScore + partialMatchScore, 100);
}


