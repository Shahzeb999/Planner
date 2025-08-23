import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import path from 'path';

const sqlite = new Database(path.join(process.cwd(), 'data', 'app.db'));

// Enable WAL mode for better performance
sqlite.pragma('journal_mode = WAL');

// Run migrations immediately on database initialization
try {
  migrate(drizzle(sqlite), { migrationsFolder: path.join(process.cwd(), 'src', 'db', 'migrations') });
  console.log('✅ Database migrations completed');
} catch (error) {
  console.error('❌ Migration failed:', error);
}

export const db = drizzle(sqlite, { schema });

// Run migrations on startup (for manual calls)
export function runMigrations() {
  try {
    migrate(db, { migrationsFolder: path.join(process.cwd(), 'src', 'db', 'migrations') });
    console.log('✅ Database migrations completed');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

export * from './schema';

