import { getUserByEmailOrUsername, updateUser } from "infra/models/userModel";
import {
  handleError,
  NotFoundError,
  RequestBodyError,
  ValidationError,
} from "utils/errors";

export async function GET(request, { params }) {
  const { username } = await params;

  try {
    const result = await getUserByEmailOrUsername(username);

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
      throw new RequestBodyError();
    }

    if (!body || Object.keys(body).length === 0) {
      throw new ValidationError("Nenhum dado para atualizar foi enviado.");
    }

    const updatableFields = ["name", "username", "email", "password"];

    const updateData = Object.keys(body)
      .filter((field) => updatableFields.includes(field))
      .reduce((acc, field) => {
        acc[field] = body[field];
        return acc;
      }, {});

    if (Object.keys(updateData).length === 0) {
      throw new ValidationError(
        "Nenhum campo permitido para atualização foi enviado.",
      );
    }

    const result = await updateUser(updateData, currentUsername);

    if (result.rowCount === 0) {
      throw new NotFoundError("Usuário");
    }

    return Response.json(result.rows[0], { status: 200 });
  } catch (err) {
    return handleError(err);
  }
}
