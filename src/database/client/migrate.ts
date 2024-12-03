import { clientDB } from './db';
import migrations from './migrations.json';

export const migrate = async () => {
  // refs: https://github.com/drizzle-team/drizzle-orm/discussions/2532
  // @ts-ignore
  await clientDB.dialect.migrate(migrations, clientDB.session, {});

  return clientDB;
};
