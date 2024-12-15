import orchestrator from "tests/orchestrator";
import bcrypt from "bcrypt";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runMigrations();
});

describe("GET /api/v1/users[username]", () => {
  describe("User fetch", () => {
    describe("Valid cases", () => {
      test("should return the data of an existing user", async () => {
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

        const response = await fetch(
          "http://localhost:3000/api/v1/users/testuser",
        );

        const responseBody = await response.json();

        const pw = await bcrypt.compare(
          userData.password,
          responseBody.password,
        );

        if (pw) {
          responseBody.password = userData.password;
        }

        delete responseBody.id;
        delete responseBody.created_at;

        expect(response.status).toBe(200);
        expect(responseBody).toEqual(userData);
      });

      test("should return 404 for a non-existing user", async () => {
        const response = await fetch(
          "http://localhost:3000/api/v1/users/nonexistent",
        );

        const error = await response.json();

        expect(response.status).toBe(404);
        expect(error).toEqual({
          name: "not_found_error",
          message: "Usuário não encontrado.",
          action: "Verifique se o usuário existe e tente novamente.",
          status_code: 404,
        });
      });
    });
  });
});
