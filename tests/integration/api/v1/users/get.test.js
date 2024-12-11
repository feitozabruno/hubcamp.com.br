import { GET } from "app/api/v1/users/[username]/route.js";
import database from "infra/database";

// Mock do banco de dados
jest.mock("infra/database");

describe("GET /api/v1/users/[username]", () => {
  it("should return user details successfully", async () => {
    const mockUser = {
      id: 1,
      name: "John Doe",
      username: "john123",
      email: "john@example.com",
    };

    database.query.mockResolvedValueOnce({
      rowCount: 1,
      rows: [mockUser],
    });

    const mockParams = { username: "john123" };
    const mockRequest = {};

    const response = await GET(mockRequest, { params: mockParams });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(mockUser);
  });

  it("should handle user not found", async () => {
    database.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });

    const mockParams = { username: "nonexistent" };
    const mockRequest = {};

    const response = await GET(mockRequest, { params: mockParams });

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

    const mockParams = { username: "john123" };
    const mockRequest = {};

    const response = await GET(mockRequest, { params: mockParams });

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      name: "internal_server_error",
      message: "Erro interno no servidor.",
      action: "Tente novamente mais tarde ou contate o suporte.",
      status_code: 500,
    });
  });
});
