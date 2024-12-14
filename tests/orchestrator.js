import retry from "async-retry";
import database from "infra/database";
import migrationManager from "infra/models/migrationModel.js";

async function waitForAllServices() {
  await waitForWebServer();

  async function waitForWebServer() {
    return retry(fetchStatusPage, {
      retries: 100,
      maxTimeout: 1000,
    });

    async function fetchStatusPage() {
      const response = await fetch("http://localhost:3000/api/v1/status");

      if (response.status !== 200) {
        throw Error();
      }
    }
  }
}

async function clearDatabase() {
  await database.query("drop schema public cascade; create schema public;");
}

async function runMigrations() {
  await migrationManager.runMigrations();
}

const orchestrator = {
  waitForAllServices,
  clearDatabase,
  runMigrations,
};

export default orchestrator;
