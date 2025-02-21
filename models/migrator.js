import database from "infra/database";
import { ServiceError } from "infra/errors.js";
import migrationRunner from "node-pg-migrate";
import { resolve } from "node:path";

const defaultMigrationOptions = {
  dryRun: true,
  dir: resolve("infra", "migrations"),
  direction: "up",
  log: () => {},
  migrationsTable: "pgmigrations",
};

async function executeMigration(options = {}) {
  let dbClient;

  try {
    dbClient = await database.getNewClient();

    return await migrationRunner({
      ...defaultMigrationOptions,
      ...options,
      dbClient,
    });
  } catch (error) {
    throw new ServiceError({
      message: "Falha ao executar migração.",
      cause: error,
    });
  } finally {
    await dbClient?.end();
  }
}

const migrator = {
  listPendingMigrations: () => executeMigration(),
  runPendingMigrations: () => executeMigration({ dryRun: false }),
};

export default migrator;
