import database from "infra/database";
import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runMigrations();
});

describe("POST /api/v1/sessions", () => {
  describe("Create Session", () => {
    test("should log in with valid credentials", async () => {
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

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
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
      expect(sessionResult.rowCount).toBe(1);
      expect(sessionResult.rows[0].user_id).toBe(1);
    });

    test("should return 404 if user is not found", async () => {
      const response = await fetch("http://localhost:3000/api/v1/sessions", {
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
      const response = await fetch("http://localhost:3000/api/v1/sessions", {
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
