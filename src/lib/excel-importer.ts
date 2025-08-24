import * as XLSX from 'xlsx';
import * as fs from 'fs';
import { db } from '@/db';
import {
  planItems,
  problems,
  oopProblems,
  resources,
  mocks,
  settings,
  type NewPlanItem,
  type NewProblem,
  type NewOopProblem,
  type NewResource,
  type NewMock,
  difficultyEnum
} from '@/db/schema';
import { z } from 'zod';
import { eq, and, sql } from 'drizzle-orm';

// Validation schemas
const planRowSchema = z.object({
  Date: z.string(),
  Week: z.number().optional(),
  'Week Range': z.string().optional(),
  Day: z.string().optional(),
  Phase: z.string().optional(),
  'Theme (Week Focus)': z.string(),
  'Task Type': z.string(),
  'Task Description': z.string(),
  'Weekly Challenge (Sat)': z.string().optional(),
  'Resource Pointer': z.string().optional(),
});

const problemRowSchema = z.object({
  Week: z.number(),
  Topic: z.string(),
  Problem: z.string(),
  Difficulty: z.enum(difficultyEnum),
  URL: z.string().optional(),
  Notes: z.string().optional(),
});

const oopProblemRowSchema = z.object({
  Week: z.number(),
  Track: z.string(),
  Problem: z.string(),
  Difficulty: z.enum(difficultyEnum),
  URL: z.string().optional(),
  Notes: z.string().optional(),
});

const resourceRowSchema = z.object({
  Week: z.number(),
  Area: z.string(),
  Resource: z.string(),
  URL: z.string().optional(),
  Notes: z.string().optional(),
});

const mockRowSchema = z.object({
  Week: z.number(),
  'Mock Type': z.string(),
  Goal: z.string(),
  Notes: z.string().optional(),
});

export interface ImportSummary {
  plan: { inserted: number; updated: number; errors: string[] };
  problems: { inserted: number; updated: number; errors: string[] };
  oopProblems: { inserted: number; updated: number; errors: string[] };
  resources: { inserted: number; updated: number; errors: string[] };
  mocks: { inserted: number; updated: number; errors: string[] };
}

function parseDate(dateStr: string): string {
  // Handle various date formats and convert to YYYY-MM-DD
  const date = new Date(dateStr);
  if (isNaN(date.valueOf())) {
    throw new Error(`Invalid date: ${dateStr}`);
  }
  return date.toISOString().split('T')[0];
}

function getDayName(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

function getWeekNumber(dateStr: string): number {
  const date = new Date(dateStr);
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.valueOf() - startOfYear.valueOf()) / 86400000;
  return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
}

export async function importExcelFile(filePath: string): Promise<ImportSummary> {
  // Get today's date at the start of import for consistency throughout the function
  const importDate = new Date();
  importDate.setHours(0, 0, 0, 0); // Set to start of day
  const importDateString = importDate.toISOString().split('T')[0];
  
  let workbook: XLSX.WorkBook;
  
  try {
    // Check if file exists and is accessible
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    // Check file permissions
    try {
      fs.accessSync(filePath, fs.constants.R_OK);
    } catch {
      throw new Error(`File is not readable. Please check file permissions: ${filePath}`);
    }

    // Try to read file as buffer first (avoids file locking issues)
    let fileBuffer: Buffer;
    try {
      fileBuffer = fs.readFileSync(filePath);
    } catch (error: any) {
      if (error.code === 'EBUSY' || error.message.includes('being used')) {
        throw new Error(`File is currently open in another application (like Excel). Please close the file and try again: ${filePath}`);
      } else if (error.code === 'EACCES') {
        throw new Error(`Access denied. Please check file permissions: ${filePath}`);
      } else if (error.code === 'ENOENT') {
        throw new Error(`File not found: ${filePath}`);
      } else {
        throw new Error(`Cannot read file: ${error.message}`);
      }
    }

    // Parse Excel from buffer
    try {
      workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    } catch (error: any) {
      throw new Error(`Invalid Excel file format: ${error.message}`);
    }

  } catch (error: any) {
    console.error('Excel file access error:', error.message);
    throw error;
  }

  const summary: ImportSummary = {
    plan: { inserted: 0, updated: 0, errors: [] },
    problems: { inserted: 0, updated: 0, errors: [] },
    oopProblems: { inserted: 0, updated: 0, errors: [] },
    resources: { inserted: 0, updated: 0, errors: [] },
    mocks: { inserted: 0, updated: 0, errors: [] },
  };

  // Import Plan sheet (try both "Plan" and "Plan Sheet")
  const planSheetName = workbook.SheetNames.find(name => 
    name === 'Plan' || name === 'Plan Sheet'
  );
  
  if (planSheetName) {
    const planSheet = workbook.Sheets[planSheetName];
    const planData = XLSX.utils.sheet_to_json(planSheet);

    // Parse all rows first to find earliest date
    const validatedRows: any[] = [];
    let earliestDate: Date | null = null;

    for (const row of planData) {
      try {
        const validatedRow = planRowSchema.parse(row);
        const originalDate = new Date(validatedRow.Date);
        
        if (isNaN(originalDate.valueOf())) {
          summary.plan.errors.push(`Invalid date in row: ${validatedRow.Date}`);
          continue;
        }

        // Track earliest date
        if (!earliestDate || originalDate < earliestDate) {
          earliestDate = originalDate;
        }

        validatedRows.push({ validatedRow, originalDate });
      } catch (error) {
        summary.plan.errors.push(`Row validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Calculate the offset from earliest date to import date
    if (!earliestDate) {
      summary.plan.errors.push('No valid dates found in Plan sheet');
      return summary;
    }
    
    earliestDate.setHours(0, 0, 0, 0); // Set to start of day
    const dayOffset = Math.floor((importDate.valueOf() - earliestDate.valueOf()) / (1000 * 60 * 60 * 24));
    
    console.log(`📅 Adjusting plan dates from "${planSheetName}": Original start date was ${earliestDate.toISOString().split('T')[0]}, now starting from ${importDateString} (${dayOffset} day offset)`);

    // Now process all rows with adjusted dates
    for (const { validatedRow, originalDate } of validatedRows) {
      try {
        // Calculate new date based on offset from original start
        const adjustedDate = new Date(originalDate);
        adjustedDate.setDate(adjustedDate.getDate() + dayOffset);
        
        const isoDate = adjustedDate.toISOString().split('T')[0];
        const dayName = validatedRow.Day || getDayName(isoDate);
        const week = validatedRow.Week || getWeekNumber(isoDate);

        const planItem: NewPlanItem = {
          date: isoDate,
          week,
          weekRange: validatedRow['Week Range'] || null,
          dayName,
          phase: validatedRow.Phase || null,
          theme: validatedRow['Theme (Week Focus)'],
          taskType: validatedRow['Task Type'],
          taskDesc: validatedRow['Task Description'],
          weeklyChallenge: validatedRow['Weekly Challenge (Sat)'] || null,
          resourcePointer: validatedRow['Resource Pointer'] || null,
          status: 'todo',
        };

        // Upsert logic: check if item exists
        const existing = await db
          .select()
          .from(planItems)
          .where(
            and(
              eq(planItems.date, isoDate),
              eq(planItems.taskType, planItem.taskType),
              eq(planItems.theme, planItem.theme)
            )
          )
          .limit(1);

        if (existing.length > 0) {
          await db
            .update(planItems)
            .set({ ...planItem, updatedAt: sql`(unixepoch())` })
            .where(eq(planItems.id, existing[0].id));
          summary.plan.updated++;
        } else {
          await db.insert(planItems).values(planItem);
          summary.plan.inserted++;
        }
      } catch (error) {
        summary.plan.errors.push(`Row processing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  // Import Weekly Problem Sets sheet
  if (workbook.SheetNames.includes('Weekly Problem Sets')) {
    const problemsSheet = workbook.Sheets['Weekly Problem Sets'];
    const problemsData = XLSX.utils.sheet_to_json(problemsSheet);

    for (const row of problemsData) {
      try {
        const validatedRow = problemRowSchema.parse(row);

        const problem: NewProblem = {
          week: validatedRow.Week,
          category: validatedRow.Topic,
          name: validatedRow.Problem,
          difficulty: validatedRow.Difficulty,
          url: validatedRow.URL || null,
          notes: validatedRow.Notes || null,
          status: 'todo',
          timeSpentMins: 0,
        };

        // Upsert logic
        const existing = await db
          .select()
          .from(problems)
          .where(
            and(
              eq(problems.week, problem.week),
              eq(problems.name, problem.name),
              eq(problems.url, problem.url || '')
            )
          )
          .limit(1);

        if (existing.length > 0) {
          await db
            .update(problems)
            .set({ ...problem, updatedAt: sql`(unixepoch())` })
            .where(eq(problems.id, existing[0].id));
          summary.problems.updated++;
        } else {
          await db.insert(problems).values(problem);
          summary.problems.inserted++;
        }
      } catch (error) {
        summary.problems.errors.push(`Row error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  // Import OOP Problem Sets sheet
  if (workbook.SheetNames.includes('OOP Problem Sets')) {
    const oopProblemsSheet = workbook.Sheets['OOP Problem Sets'];
    const oopProblemsData = XLSX.utils.sheet_to_json(oopProblemsSheet);

    for (const row of oopProblemsData) {
      try {
        const validatedRow = oopProblemRowSchema.parse(row);

        const oopProblem: NewOopProblem = {
          week: validatedRow.Week,
          track: validatedRow.Track,
          name: validatedRow.Problem,
          difficulty: validatedRow.Difficulty,
          url: validatedRow.URL || null,
          notes: validatedRow.Notes || null,
          status: 'todo',
          timeSpentMins: 0,
        };

        // Upsert logic
        const existing = await db
          .select()
          .from(oopProblems)
          .where(
            and(
              eq(oopProblems.week, oopProblem.week),
              eq(oopProblems.name, oopProblem.name),
              eq(oopProblems.url, oopProblem.url || '')
            )
          )
          .limit(1);

        if (existing.length > 0) {
          await db
            .update(oopProblems)
            .set({ ...oopProblem, updatedAt: sql`(unixepoch())` })
            .where(eq(oopProblems.id, existing[0].id));
          summary.oopProblems.updated++;
        } else {
          await db.insert(oopProblems).values(oopProblem);
          summary.oopProblems.inserted++;
        }
      } catch (error) {
        summary.oopProblems.errors.push(`Row error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  // Import Projects & Resources sheet
  if (workbook.SheetNames.includes('Projects & Resources')) {
    const resourcesSheet = workbook.Sheets['Projects & Resources'];
    const resourcesData = XLSX.utils.sheet_to_json(resourcesSheet);

    for (const row of resourcesData) {
      try {
        const validatedRow = resourceRowSchema.parse(row);

        const resource: NewResource = {
          week: validatedRow.Week,
          area: validatedRow.Area,
          title: validatedRow.Resource,
          url: validatedRow.URL || null,
          notes: validatedRow.Notes || null,
          pinned: false,
        };

        // Upsert logic
        const existing = await db
          .select()
          .from(resources)
          .where(
            and(
              eq(resources.week, resource.week),
              eq(resources.title, resource.title),
              eq(resources.url, resource.url || '')
            )
          )
          .limit(1);

        if (existing.length > 0) {
          await db
            .update(resources)
            .set({ ...resource, updatedAt: sql`(unixepoch())` })
            .where(eq(resources.id, existing[0].id));
          summary.resources.updated++;
        } else {
          await db.insert(resources).values(resource);
          summary.resources.inserted++;
        }
      } catch (error) {
        summary.resources.errors.push(`Row error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  // Import Mocks & Checklists sheet
  if (workbook.SheetNames.includes('Mocks & Checklists')) {
    const mocksSheet = workbook.Sheets['Mocks & Checklists'];
    const mocksData = XLSX.utils.sheet_to_json(mocksSheet);

    for (const row of mocksData) {
      try {
        const validatedRow = mockRowSchema.parse(row);

        const mock: NewMock = {
          week: validatedRow.Week,
          mockType: validatedRow['Mock Type'],
          goal: validatedRow.Goal,
          notes: validatedRow.Notes || null,
          scheduledAt: null,
          outcome: null,
          feedback: null,
        };

        // Upsert logic
        const existing = await db
          .select()
          .from(mocks)
          .where(
            and(
              eq(mocks.week, mock.week),
              eq(mocks.mockType, mock.mockType),
              eq(mocks.goal, mock.goal)
            )
          )
          .limit(1);

        if (existing.length > 0) {
          await db
            .update(mocks)
            .set({ ...mock, updatedAt: sql`(unixepoch())` })
            .where(eq(mocks.id, existing[0].id));
          summary.mocks.updated++;
        } else {
          await db.insert(mocks).values(mock);
          summary.mocks.inserted++;
        }
      } catch (error) {
        summary.mocks.errors.push(`Row error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  // Set import timestamp
  await db
    .insert(settings)
    .values({
      key: 'last_import',
      value: new Date().toISOString(),
    })
    .onConflictDoUpdate({
      target: settings.key,
      set: {
        value: new Date().toISOString(),
        updatedAt: sql`(unixepoch())`,
      },
    });

  // Add helpful summary message about date adjustment
  if (summary.plan.inserted > 0 || summary.plan.updated > 0) {
    console.log(`✅ Import completed! Plan dates adjusted to start from today (${importDateString}). ${summary.plan.inserted} items inserted, ${summary.plan.updated} items updated.`);
  }

  return summary;
}

