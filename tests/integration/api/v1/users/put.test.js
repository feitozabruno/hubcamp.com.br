import orchestrator from "tests/orchestrator";
import bcrypt from "bcrypt";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("PUT /api/v1/users[username]", () => {
  describe("User update", () => {
    test("should update the data of an existing user", async () => {
      const userData = {
        username: "testuser",
        email: "testuser@example.com",
        password: "password123",
      };

      const updatedUserData = {
        username: "updatedtestuser",
        email: "updatedtestuser@example.com",
        password: "updatedpassword123",
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
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedUserData),
        },
      );

      const responseBody = await response.json();

      const passwordMatches = await bcrypt.compare(
        updatedUserData.password,
        responseBody.password,
      );

      expect(response.status).toBe(200);
      expect(responseBody.username).toBe(updatedUserData.username);
      expect(responseBody.email).toBe(updatedUserData.email);
      expect(passwordMatches).toBe(true);
    });

    test("should throw an error when trying to update a non-existent user", async () => {
      const updateData = {
        username: "NonexistentUser",
      };

      const response = await fetch(
        "http://localhost:3000/api/v1/users/nonexistentuser",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        },
      );

      const error = await response.json();

      expect(response.status).toBe(404);

      expect(error).toEqual({
        name: "NotFoundError",
        message: "Usuário não encontrado.",
        action: "Verifique o username informado e tente novamente.",
        status_code: 404,
      });
    });

    test("should throw an error when sending an empty body request", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/updatedtestuser",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        },
      );

      const error = await response.json();

      expect(response.status).toBe(400);
      expect(error).toEqual({
        name: "ValidationError",
        message: "Nenhum campo permitido para atualização foi informado.",
        action: "Informe ao menos um campo válido para atualização.",
        status_code: 400,
      });
    });

    test("should throw an error when sending invalid fields for update", async () => {
      const invalidData = {
        invalidField: "Invalid Value",
      };

      const response = await fetch(
        "http://localhost:3000/api/v1/users/updatedtestuser",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(invalidData),
        },
      );

      const error = await response.json();

      expect(response.status).toBe(400);

      expect(error).toEqual({
        name: "ValidationError",
        message: "Nenhum campo permitido para atualização foi informado.",
        action: "Informe ao menos um campo válido para atualização.",
        status_code: 400,
      });
    });

    test("should throw an error when sending an invalid (non-JSON) body", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/updatedtestuser",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: "Invalid JSON",
        },
      );

      expect(response.status).toBe(400);

      const error = await response.json();
      expect(error).toEqual({
        name: "ValidationError",
        message: "Erro ao processar o corpo da requisição.",
        action: "Verifique se o corpo da requisição está correto.",
        status_code: 400,
      });
    });
  });
});
