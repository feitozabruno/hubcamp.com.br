import migrator from "models/migrator.js";
import { controller } from "infra/controller.js";

async function getHandler() {
  const migrations = await migrator.listPendingMigrations();
  return Response.json(migrations, { status: 200 });
}

async function postHandler() {
  const migrations = await migrator.runPendingMigrations();
  const statusCode = migrations.length > 0 ? 201 : 200;
  return Response.json(migrations, { status: statusCode });
}

export const GET = controller(getHandler);
export const POST = controller(postHandler);
