import { PUT } from "app/api/v1/users/[username]/route.js";
import database from "infra/database";

// Mock do banco de dados
jest.mock("infra/database");

describe("PUT /api/v1/users/[username]", () => {
  it("should update user details successfully", async () => {
    const updatedUser = {
      id: 1,
      name: "John Doe Updated",
      username: "john123",
      email: "john.updated@example.com",
    };

    database.query.mockResolvedValueOnce({
      rowCount: 1,
      rows: [updatedUser],
    });

    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        name: "John Doe Updated",
        email: "john.updated@example.com",
      }),
    };

    const mockParams = { username: "john123" };

    const response = await PUT(mockRequest, { params: mockParams });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(updatedUser);
  });

  it("should handle no data to update", async () => {
    const mockRequest = {
      json: jest.fn().mockResolvedValue({}),
    };

    const mockParams = { username: "john123" };

    const response = await PUT(mockRequest, { params: mockParams });

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      name: "validation_error",
      message: "Nenhum dado para atualizar foi enviado.",
      action: "Verifique os campos enviados e tente novamente.",
      status_code: 400,
    });
  });

  it("should handle user not found", async () => {
    database.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });

    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        name: "John Doe Updated",
      }),
    };

    const mockParams = { username: "nonexistent" };

    const response = await PUT(mockRequest, { params: mockParams });

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({
      name: "not_found_error",
      message: "Usuário não encontrado.",
      action: "Verifique se o Usuário existe e tente novamente.",
      status_code: 404,
    });
  });

  it("should handle database errors", async () => {
    database.query.mockRejectedValueOnce(new Error("Database error"));

    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        name: "John Doe Updated",
      }),
    };

    const mockParams = { username: "john123" };

    const response = await PUT(mockRequest, { params: mockParams });

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      name: "internal_server_error",
      message: "Erro interno no servidor.",
      action: "Tente novamente mais tarde ou contate o suporte.",
      status_code: 500,
    });
  });
});
