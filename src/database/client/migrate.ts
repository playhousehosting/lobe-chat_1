import type { MigrationConfig } from 'drizzle-orm/migrator';

import { clientDB } from './db';
import migrations from './migrations.json';

export const migrate = async () => {
  // refs: https://github.com/drizzle-team/drizzle-orm/discussions/2532
  // @ts-ignore
  clientDB.dialect.migrate(migrations, clientDB.session, {
    migrationsTable: 'drizzle_migrations',
  } satisfies Omit<MigrationConfig, 'migrationsFolder'>);

  return clientDB;
};
