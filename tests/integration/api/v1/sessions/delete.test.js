import database from "infra/database";
import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("DELETE /api/v1/sessions", () => {
  test("should logout successfully", async () => {
    const userData = {
      name: "Test User",
      username: "testuser",
      email: "testuser@example.com",
      password: "password123",
    };

    await fetch("http://localhost:3000/api/v1/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const loginResponse = await fetch("http://localhost:3000/api/v1/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        identifier: "testuser",
        password: "password123",
      }),
    });
    expect(loginResponse.status).toBe(200);

    const cookie = loginResponse.headers.get("set-cookie");
    expect(cookie).toMatch(/session_token=/);

    const logoutResponse = await fetch(
      "http://localhost:3000/api/v1/sessions",
      {
        method: "DELETE",
        headers: {
          Cookie: cookie,
        },
      },
    );
    expect(logoutResponse.status).toBe(200);
    expect(logoutResponse.headers.get("set-cookie")).toMatch(
      /session_token=;.*Max-Age=0/,
    );

    const responseBody = await logoutResponse.json();
    expect(responseBody).toEqual({
      message: "Logout realizado com sucesso!",
    });

    const sessionResult = await database.query("SELECT * FROM sessions");
    expect(sessionResult.rowCount).toBe(0);
  });

  test("should return 400 if no active session is found", async () => {
    const response = await fetch("http://localhost:3000/api/v1/sessions", {
      method: "DELETE",
    });

    const responseBody = await response.json();

    expect(response.status).toBe(400);
    expect(responseBody).toEqual({
      message: "Nenhuma sessão ativa encontrada.",
    });
  });

  test("should delete current session and expired sessions", async () => {
    const userData = {
      name: "Test User",
      username: "testuser",
      email: "testuser@example.com",
      password: "password123",
    };

    await fetch("http://localhost:3000/api/v1/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const loginResponse = await fetch("http://localhost:3000/api/v1/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: "testuser", password: "password123" }),
    });
    const cookie = loginResponse.headers.get("set-cookie");

    const userQuery = await database.query({
      text: "SELECT id FROM users WHERE username = $1",
      values: ["testuser"],
    });
    const userId = userQuery.rows[0].id;

    await database.query({
      text: `
        INSERT INTO sessions (user_id, token, expires_at)
        VALUES ($1, $2, $3)
      `,
      values: [userId, "expired-token", new Date(Date.now() - 1000)],
    });

    const logoutResponse = await fetch(
      "http://localhost:3000/api/v1/sessions",
      {
        method: "DELETE",
        headers: { Cookie: cookie },
      },
    );

    expect(logoutResponse.status).toBe(200);
    const sessionResult = await database.query({
      text: "SELECT * FROM sessions",
    });
    expect(sessionResult.rowCount).toBe(0);
  });
});
