import { createUser } from "models/user.js";
import { handleError, RequestBodyError } from "infra/errors.js";

export async function POST(request) {
  try {
    let userData;

    try {
      userData = await request.json();
    } catch {
      throw new RequestBodyError();
    }

    await createUser(userData);

    return Response.json(
      { message: `Usuário ${userData.username} criado com sucesso!` },
      { status: 201 },
    );
  } catch (err) {
    return handleError(err);
  }
}
