import orchestrator from "tests/orchestrator";
import bcrypt from "bcrypt";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runMigrations();
});

describe("PUT /api/v1/users[username]", () => {
  describe("User update", () => {
    describe("Valid cases", () => {
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

        const pw = await bcrypt.compare(
          updatedUserData.password,
          responseBody.password,
        );

        if (pw) {
          responseBody.password = updatedUserData.password;
        }

        delete responseBody.id;
        delete responseBody.created_at;
        delete responseBody.updated_at;

        expect(response.status).toBe(200);
        expect(responseBody).toEqual(updatedUserData);
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
          name: "not_found_error",
          message: "Usuário não encontrado.",
          action: "Verifique se o usuário existe e tente novamente.",
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
            body: JSON.stringify({}), // Corpo vazio
          },
        );

        expect(response.status).toBe(400);

        const error = await response.json();
        expect(error).toEqual({
          name: "validation_error",
          message: "Nenhum dado para atualizar foi enviado.",
          action: "Verifique os campos enviados e tente novamente.",
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

        expect(response.status).toBe(400);

        const error = await response.json();
        expect(error).toEqual({
          name: "validation_error",
          message: "Nenhum campo permitido para atualização foi enviado.",
          action: "Verifique os campos enviados e tente novamente.",
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
          name: "request_body_error",
          message:
            "Não foi possível converter o corpo da requisição para JSON.",
          action:
            "Verifique o formato do corpo da requisição e tente novamente.",
          status_code: 400,
        });
      });
    });
  });
});
