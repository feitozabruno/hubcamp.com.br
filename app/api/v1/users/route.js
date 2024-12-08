import database from "infra/database";
import { handleError, ValidationError } from "utils/errors";

export async function POST(request) {
  try {
    const { name, username, email, password } = await request.json();

    if (!name || !username || !email || !password) {
      throw new ValidationError();
    }

    await database.query(
      "INSERT INTO users (name, username, email, password) VALUES ($1, $2, $3, $4)",
      [name, username, email, password],
    );

    return Response.json(
      { message: `Usuário ${username} criado com sucesso!` },
      { status: 201 },
    );
  } catch (err) {
    console.log(err);

    return handleError(err);
  }
}
