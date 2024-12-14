import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runMigrations();
});

describe("POST /api/v1/users", () => {
  describe("User Creation", () => {
    describe("Valid cases", () => {
      test("should create a user with all valid fields", async () => {
        const userData = {
          name: "Test User",
          username: "testuser",
          email: "testuser@example.com",
          password: "password123",
        };

        const response = await fetch("http://localhost:3000/api/v1/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        });

        expect(response.status).toBe(201);

        const responseBody = await response.json();

        expect(responseBody).toEqual({
          message: "Usuário testuser criado com sucesso!",
        });
      });

      test("should throw an error if a required field is missing", async () => {
        const invalidUserData = {
          name: "Incomplete User",
          email: "incomplete@example.com",
        };

        const response = await fetch("http://localhost:3000/api/v1/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(invalidUserData),
        });

        expect(response.status).toBe(400);

        const responseBody = await response.json();

        expect(responseBody).toEqual({
          action: "Verifique os campos enviados e tente novamente.",
          message: "Todos os campos são obrigatórios.",
          name: "validation_error",
          status_code: 400,
        });
      });
    });
  });
});
