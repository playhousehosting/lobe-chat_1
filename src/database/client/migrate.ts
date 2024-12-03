import { PgDialect } from 'drizzle-orm/pg-core';

import { clientDB } from './db';
import migrations from './migrations.json';

export const migrate = async () => {
  // refs: https://github.com/drizzle-team/drizzle-orm/discussions/2532
  // @ts-ignore
  await clientDB.dialect.migrate(migrations, clientDB.session, {});

  return clientDB;
};

export async function runMigrations(dbName: string) {
  //prevent multiple schema migrations to be run
  let isLocalDBSchemaSynced = false;

  console.log('isLocalDBSchemaSynced', isLocalDBSchemaSynced);
  if (!isLocalDBSchemaSynced) {
    const start = performance.now();
    try {
      await new PgDialect().migrate(
        migrations,
        //@ts-ignore
        clientDB._.session,
        dbName,
      );
      isLocalDBSchemaSynced = true;
      console.info(`✅ Local database ready in ${performance.now() - start}ms`);
    } catch (cause) {
      console.error('❌ Local database schema migration failed', cause);
      throw cause;
    }
  }

  return clientDB;
}
