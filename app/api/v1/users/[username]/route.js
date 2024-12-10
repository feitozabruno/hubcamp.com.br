import database from "infra/database";
import { handleError, NotFoundError, ValidationError } from "utils/errors";

export async function GET(request, { params }) {
  const { username } = await params;

  try {
    const result = await database.query(
      "SELECT * FROM users WHERE username = $1",
      [username],
    );

    if (result.rowCount === 0) {
      throw new NotFoundError("Usuário");
    }

    return Response.json(result.rows[0]);
  } catch (err) {
    return handleError(err);
  }
}

export async function PUT(request, { params }) {
  const { username: currentUsername } = await params;

  try {
    let body;

    try {
      body = await request.json();
    } catch {
      throw new ValidationError("Corpo da requisição está vazio.");
    }

    body.id && delete body.id;
    body.created_at && delete body.created_at;

    if (!body || Object.keys(body).length === 0) {
      throw new ValidationError("Nenhum dado para atualizar foi enviado.");
    }

    // Se o próprio username está sendo alterado, gerencie o caso
    const newUsername = body.username;
    delete body.username; // Remover o username do corpo para evitar problemas na query dinâmica

    // Monta a query dinamicamente com base nos campos fornecidos
    const setClauses = [];
    const values = [];
    let index = 1;

    for (const [key, value] of Object.entries(body)) {
      setClauses.push(`${key} = $${index++}`);
      values.push(value);
    }

    // Adiciona a atualização do username, se presente
    if (newUsername) {
      setClauses.push(`username = $${index}`);
      values.push(newUsername);
      index++;
    }

    // Adiciona o username atual como condição na query
    const query = `
      UPDATE users
      SET ${setClauses.join(", ")}
      WHERE username = $${index}
      RETURNING *;
    `;

    values.push(currentUsername);

    const result = await database.query(query, values);

    if (result.rowCount === 0) {
      throw new NotFoundError("Usuário");
    }

    return Response.json(result.rows[0], { status: 200 });
  } catch (err) {
    return handleError(err);
  }
}
