import migrationManager from "infra/models/migrationModel.js";
import { handleError, MigrationError } from "utils/errors";

export async function GET() {
  try {
    const migrations = await migrationManager.runMigrations({ dryRun: true });
    if (!Array.isArray(migrations)) {
      throw new MigrationError();
    }
    return Response.json(migrations, { status: 200 });
  } catch (err) {
    return handleError(err);
  }
}

export async function POST() {
  try {
    const migrations = await migrationManager.runMigrations();
    if (!Array.isArray(migrations)) {
      throw new MigrationError();
    }
    const status = migrations.length > 0 ? 201 : 200;
    return Response.json(migrations, { status });
  } catch (err) {
    return handleError(err);
  }
}
