import retry from "async-retry";
import database from "infra/database";
import migrator from "models/migrator.js";

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
  await migrator.runPendingMigrations();
}

async function fetchLastEmail() {
  const response = await fetch("http://localhost:1080/messages");
  const messages = await response.json();

  if (messages.length === 0) {
    throw new Error("Nenhum email encontrado.");
  }

  const lastMessage = messages[messages.length - 1];

  // Buscando detalhes do e-mail
  const emailDetailsResponse = await fetch(
    `http://localhost:1080/messages/${lastMessage.id}.json`,
  );
  return emailDetailsResponse.json();
}

async function clearMailCatcherInbox() {
  await fetch("http://localhost:1080/messages", { method: "DELETE" });
}

const orchestrator = {
  waitForAllServices,
  clearDatabase,
  runMigrations,
  fetchLastEmail,
  clearMailCatcherInbox,
};

export default orchestrator;
