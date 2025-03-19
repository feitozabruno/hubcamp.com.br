import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/users/[username]", () => {
  describe("Existing user", () => {
    test("should return the user's data when the username exists", async () => {
      const userData = {
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

      const response = await fetch(
        "http://localhost:3000/api/v1/users/testuser",
      );
      const responseBody = await response.json();

      expect(response.status).toBe(200);
      expect(responseBody).toMatchObject({
        username: userData.username,
        email: userData.email,
      });
    });
  });

  describe("Non-existing user", () => {
    test("should return a 404 error when the username does not exist", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/nonexistent",
      );
      const responseBody = await response.json();

      expect(response.status).toBe(404);
      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "Usuário não encontrado.",
        action: "Verifique o username informado e tente novamente.",
        status_code: 404,
      });
    });
  });
});
