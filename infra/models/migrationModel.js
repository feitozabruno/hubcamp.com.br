import migrationRunner from "node-pg-migrate";
import { resolve } from "node:path";
import database from "../database.js";
import { handleError, MigrationError } from "utils/errors.js";

const MIGRATIONS_DIR = resolve("infra", "migrations");

async function runMigrations({ dryRun = false } = {}) {
  let dbClient;

  try {
    dbClient = await database.getNewClient();

    const migrationOptions = {
      dbClient,
      dryRun,
      dir: MIGRATIONS_DIR,
      direction: "up",
      verbose: true,
      migrationsTable: "pgmigrations",
    };

    const migrations = await migrationRunner(migrationOptions);

    if (!Array.isArray(migrations)) {
      throw new MigrationError();
    }

    return migrations; // Retorna as migrations aplicadas.
  } catch (err) {
    return handleError(err);
  } finally {
    if (dbClient) {
      await dbClient.end();
    }
  }
}

const migrationManager = { runMigrations };

export default migrationManager;
