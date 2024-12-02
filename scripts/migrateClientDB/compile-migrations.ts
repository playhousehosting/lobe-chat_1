import { readMigrationFiles } from 'drizzle-orm/migrator';
import { join } from 'node:path';

const dbBase = join(__dirname, '../../src/database');
const migrationsFolder = join(dbBase, './migrations');

const migrations = readMigrationFiles({ migrationsFolder: migrationsFolder });

// eslint-disable-next-line no-undef
await Bun.write(join(dbBase, './client/migrations.json'), JSON.stringify(migrations));

console.log('🏁Migrations compiled!');
