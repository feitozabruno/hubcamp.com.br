import migrationRunner from "node-pg-migrate";
import { resolve } from "node:path";
import database from "infra/database.js";

const MIGRATIONS_DIR = resolve("infra", "migrations");

async function handleMigration({ dryRun, statusOnSuccess }) {
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

    return Response.json(migrations, {
      status: statusOnSuccess(migrations),
    });
  } catch (error) {
    console.error("Migration error:", error);

    return Response.json(
      { error: "An error occurred during migration." },
      {
        status: 500,
      },
    );
  } finally {
    if (dbClient) {
      await dbClient.end();
    }
  }
}

export async function GET() {
  return handleMigration({
    dryRun: true,
    statusOnSuccess: () => 200,
  });
}

export async function POST() {
  return handleMigration({
    dryRun: false,
    statusOnSuccess: (migrations) => (migrations.length > 0 ? 201 : 200),
  });
}
