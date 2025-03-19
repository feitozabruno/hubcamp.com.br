import database from "infra/database";
import orchestrator from "tests/orchestrator";

beforeEach(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/sessions", () => {
  test("should login with valid credentials", async () => {
    const userData = {
      username: "testuser",
      email: "testuser@example.com",
      password: "password123",
    };

    const userResponse = await fetch("http://localhost:3000/api/v1/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    expect(userResponse.status).toBe(201);

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
    expect(response.status).toBe(200);
    expect(response.headers.get("set-cookie")).toMatch(/session_token=/);

    const responseBody = await response.json();
    expect(responseBody).toEqual({ message: "Login realizado com sucesso!" });

    const sessionResult = await database.query({
      text: "SELECT * FROM sessions",
      values: [],
    });

    const userResult = await database.query({
      text: "SELECT * FROM users WHERE username = $1",
      values: [userData.username],
    });

    expect(sessionResult.rowCount).toBe(1);
    expect(userResult.rowCount).toBe(1);
    expect(sessionResult.rows[0].user_id).toBe(userResult.rows[0].id);
  });

  test("should return 401 if password is incorrect", async () => {
    const userData = {
      username: "testuser",
      email: "testuser@example.com",
      password: "password123",
    };

    const userResponse = await fetch("http://localhost:3000/api/v1/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    expect(userResponse.status).toBe(201);

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
      name: "ValidationError",
      message: "Senha inválida.",
      action: "Verifique a senha informada e tente novamente.",
      status_code: 401,
    });
  });

  test("should return 404 if user is not found", async () => {
    const userData = {
      username: "testuser",
      email: "testuser@example.com",
      password: "password123",
    };

    const userResponse = await fetch("http://localhost:3000/api/v1/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    expect(userResponse.status).toBe(201);

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
      name: "NotFoundError",
      message: "Usuário não encontrado.",
      action: "Verifique o username informado e tente novamente.",
      status_code: 404,
    });

    const sessionResult = await database.query({
      text: "SELECT * FROM sessions",
    });
    expect(sessionResult.rowCount).toBe(0);
  });
});
