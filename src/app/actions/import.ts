'use server';

import { importExcelFile, type ImportSummary } from '@/lib/excel-importer';
import { runMigrations } from '@/db';
import { db } from '@/db';
import { planItems, problems, oopProblems, resources, mocks, sessions, settings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import path from 'path';
import fs from 'fs/promises';

export async function importExcel(formData: FormData): Promise<{
  success: boolean;
  data?: ImportSummary;
  error?: string;
}> {
  try {
    // Ensure database is initialized
    runMigrations();

    const file = formData.get('excel-file') as File;
    if (!file) {
      return { success: false, error: 'No file provided' };
    }

    // Save uploaded file temporarily
    const tempDir = path.join(process.cwd(), 'temp');
    await fs.mkdir(tempDir, { recursive: true });
    
    const tempFilePath = path.join(tempDir, `import-${Date.now()}.xlsx`);
    const arrayBuffer = await file.arrayBuffer();
    await fs.writeFile(tempFilePath, Buffer.from(arrayBuffer));

    // Import the data
    const summary = await importExcelFile(tempFilePath);

    // Clean up temp file
    await fs.unlink(tempFilePath);

    return { success: true, data: summary };
  } catch (error) {
    console.error('Import error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

export async function importFromDefaultFile(): Promise<{
  success: boolean;
  data?: ImportSummary;
  error?: string;
}> {
  try {
    // Ensure database is initialized
    runMigrations();

    // Try multiple possible locations for the Excel file
    const possiblePaths = [
      // Parent directory (most likely location based on error)
      path.join(process.cwd(), '..', 'full_fledged_plan_v2.xlsx'),
      // Current directory
      path.join(process.cwd(), 'full_fledged_plan_v2.xlsx'),
      // In llm-prep-app folder
      path.join(process.cwd(), 'llm-prep-app', 'full_fledged_plan_v2.xlsx'),
      // In data folder
      path.join(process.cwd(), 'data', 'full_fledged_plan_v2.xlsx'),
      // In public folder
      path.join(process.cwd(), 'public', 'full_fledged_plan_v2.xlsx'),
    ];

    let foundPath: string | null = null;
    
    for (const filePath of possiblePaths) {
      try {
        await fs.access(filePath);
        foundPath = filePath;
        console.log(`✅ Found Excel file at: ${filePath}`);
        break;
      } catch {
        console.log(`❌ Not found at: ${filePath}`);
        continue;
      }
    }
    
    if (!foundPath) {
      const searchedPaths = possiblePaths.map(p => `  • ${p}`).join('\n');
      return {
        success: false,
        error: `Excel file 'full_fledged_plan_v2.xlsx' not found. Searched locations:\n${searchedPaths}\n\nPlease either:\n1. Place the file in the Planner folder (parent directory)\n2. Upload it manually using the file picker above`,
      };
    }

    const summary = await importExcelFile(foundPath);
    return { success: true, data: summary };
    
  } catch (error) {
    console.error('Default import error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

export async function resetAllData(): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    // Ensure database is initialized
    runMigrations();

    console.log('🗑️ Starting database reset...');
    
    // Delete all data from all tables (in order to handle foreign keys)
    await db.delete(sessions);
    console.log('✅ Sessions cleared');
    
    await db.delete(planItems);
    console.log('✅ Plan items cleared');
    
    await db.delete(problems);
    console.log('✅ Problems cleared');
    
    await db.delete(oopProblems);
    console.log('✅ OOP problems cleared');
    
    await db.delete(resources);
    console.log('✅ Resources cleared');
    
    await db.delete(mocks);
    console.log('✅ Mocks cleared');
    
    await db.delete(settings);
    console.log('✅ Settings cleared');
    
    console.log('🎉 Database reset completed successfully!');
    console.log('📝 Note: Playbooks (markdown files) are not affected by reset as they are stored in the filesystem');
    
    return {
      success: true,
      message: 'All database data cleared successfully. Playbooks (markdown files) remain unchanged as they are stored in the filesystem.',
    };
  } catch (error) {
    console.error('Reset error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred during reset',
    };
  }
}

export async function debugDatabaseData(): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    // Ensure database is initialized
    runMigrations();

    // Use the same date calculation as import for consistency
    const debugDate = new Date();
    debugDate.setHours(0, 0, 0, 0); // Set to start of day
    const today = debugDate.toISOString().split('T')[0]; // YYYY-MM-DD format
    console.log(`🔍 Debug: Today's date is ${today}`);
    
    // Count all records
    const planCount = await db.select().from(planItems);
    const problemCount = await db.select().from(problems);
    const oopProblemCount = await db.select().from(oopProblems);
    const resourceCount = await db.select().from(resources);
    const mockCount = await db.select().from(mocks);
    
    // Get today's plan items
    const todayItems = await db
      .select()
      .from(planItems)
      .where(eq(planItems.date, today));
    
    // Get a few sample dates to see what's in there
    const sampleItems = await db
      .select({ date: planItems.date, taskType: planItems.taskType, taskDesc: planItems.taskDesc })
      .from(planItems)
      .limit(10);
    
    const debugData = {
      today: today,
      counts: {
        planItems: planCount.length,
        problems: problemCount.length,
        oopProblems: oopProblemCount.length,
        resources: resourceCount.length,
        mocks: mockCount.length
      },
      todayItemsCount: todayItems.length,
      sampleDates: sampleItems.map(item => ({
        date: item.date,
        taskType: item.taskType,
        taskDesc: item.taskDesc?.substring(0, 50) + '...'
      }))
    };
    
    console.log('📊 Database Debug Data:', JSON.stringify(debugData, null, 2));
    
    return {
      success: true,
      data: debugData
    };
  } catch (error) {
    console.error('Debug error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred during debug',
    };
  }
}

