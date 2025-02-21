import migrator from "models/migrator.js";

export async function GET() {
  const migrations = await migrator.listPendingMigrations();
  return Response.json(migrations, { status: 200 });
}

export async function POST() {
  const migrations = await migrator.runPendingMigrations();
  const statusCode = migrations.length > 0 ? 201 : 200;
  return Response.json(migrations, { status: statusCode });
}
