import { migrate } from 'drizzle-orm/neon-http/migrator';
import { db } from './connection.js';

async function runMigrations() {
               try {
                              console.log('🔄 Running migrations...');
                              await migrate(db, { migrationsFolder: 'drizzle' });
                              console.log('✅ Migrations completed successfully');
               } catch (error) {
                              console.error('❌ Migration failed:', error);
                              process.exit(1);
               }
}

// Run migrations if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
               runMigrations();
}
