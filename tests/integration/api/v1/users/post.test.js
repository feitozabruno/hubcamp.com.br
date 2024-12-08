import { POST } from "app/api/v1/users/route.js";
import database from "infra/database";

// Mock do banco de dados
jest.mock("infra/database");

describe("POST /api/v1/users", () => {
  it("should create a user successfully", async () => {
    // Configura o mock para retornar uma resposta simulada
    database.query.mockResolvedValueOnce({}); // Simula que o banco não retornou erro

    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        name: "John Doe",
        username: "john123",
        email: "john@example.com",
        password: "password123",
      }),
    };

    const response = await POST(mockRequest); // Chama o seu endpoint

    // Verifica se a resposta é a esperada
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({
      message: "Usuário john123 criado com sucesso!",
    });
  });

  it("should handle validation error", async () => {
    // Mocka o erro de validação
    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        name: "", // Nome vazio, simulando erro de validação
        username: "john123",
        email: "john@example.com",
        password: "password123",
      }),
    };

    const response = await POST(mockRequest); // Chama o seu endpoint

    // Verifica se o erro foi tratado corretamente
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      name: "validation_error",
      message:
        "Todos os campos (name, username, email, password) são obrigatórios.",
      action: "Verifique os campos enviados e tente novamente.",
      status_code: 400,
    });
  });

  it("should handle database errors", async () => {
    // Simula erro no banco de dados (exemplo: erro de conexão)
    database.query.mockRejectedValueOnce(new Error("Database error"));

    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        name: "John Doe",
        username: "john123",
        email: "john@example.com",
        password: "password123",
      }),
    };

    const response = await POST(mockRequest); // Chama o seu endpoint

    // Verifica se o erro foi tratado corretamente
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      name: "internal_server_error",
      message: "Erro interno no servidor.",
      action: "Tente novamente mais tarde ou contate o suporte.",
      status_code: 500,
    });
  });
});
