import database from "infra/database";
import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runMigrations();
});

const BASE_URL = "http://localhost:3000";

describe("POST /api/v1/sessions", () => {
  describe("Create Session", () => {
    test("should log in with valid credentials", async () => {
      const userData = {
        username: "testuser",
        email: "testuser@example.com",
        password: "password123",
      };

      await fetch(`${BASE_URL}/api/v1/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const response = await fetch(`${BASE_URL}/api/v1/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: "testuser",
          password: "password123",
        }),
      });

      const responseBody = await response.json();
      expect(response.status).toBe(200);
      expect(responseBody).toEqual({ message: "Logged in" });

      const sessionResult = await database.query("SELECT * FROM sessions");
      const userResult = await database.query(
        "SELECT * FROM users WHERE username = $1",
        [userData.username],
      );

      expect(sessionResult.rowCount).toBe(1);
      expect(userResult.rowCount).toBe(1);
      expect(sessionResult.rows[0].user_id).toBe(userResult.rows[0].id);
    });

    test("should return 404 if user is not found", async () => {
      const response = await fetch(`${BASE_URL}/api/v1/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: "unknownuser",
          password: "password123",
        }),
      });

      const responseBody = await response.json();

      expect(response.status).toBe(404);
      expect(responseBody).toEqual({
        name: "not_found_error",
        message: "Usuário/Email não encontrado.",
        action: "Verifique se o usuário/email existe e tente novamente.",
        status_code: 404,
      });
    });

    test("should return 401 if password is incorrect", async () => {
      const response = await fetch(`${BASE_URL}/api/v1/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: "testuser",
          password: "wrongpassword",
        }),
      });

      const responseBody = await response.json();

      expect(response.status).toBe(401);
      expect(responseBody).toEqual({
        name: "invalid_credentials_error",
        message: "Senha inválida.",
        action: "Verifique os dados de login e tente novamente.",
        status_code: 401,
      });
    });
  });
});
