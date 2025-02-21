import database from "infra/database";
import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runMigrations();
});

const BASE_URL = "http://localhost:3000";

describe("DELETE /api/v1/sessions", () => {
  describe("Delete Session", () => {
    test("should log out successfully", async () => {
      const userData = {
        name: "Test User",
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

      const loginResponse = await fetch(`${BASE_URL}/api/v1/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: "testuser",
          password: "password123",
        }),
      });

      const cookie = loginResponse.headers.get("set-cookie");

      const logoutResponse = await fetch(`${BASE_URL}/api/v1/sessions`, {
        method: "DELETE",
        headers: {
          Cookie: cookie,
        },
      });

      const responseBody = await logoutResponse.json();

      expect(logoutResponse.status).toBe(200);
      expect(responseBody).toEqual({ message: "Logged out" });

      const sessionResult = await database.query("SELECT * FROM sessions");
      expect(sessionResult.rowCount).toBe(0);
    });

    test("should return 400 if no active session is found", async () => {
      const response = await fetch(`${BASE_URL}/api/v1/sessions`, {
        method: "DELETE",
      });

      const responseBody = await response.json();

      expect(response.status).toBe(400);
      expect(responseBody).toEqual({ message: "No active session found" });
    });
  });
});
