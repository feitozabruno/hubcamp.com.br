import { NextResponse } from "next/server";
import user from "models/user.js";
import { NotFoundError, ValidationError } from "infra/errors.js";
import { controller } from "infra/controller.js";

async function getHandler(request, { params }) {
  const { username } = await params;

  const result = await user.findByUsernameOrEmail(username);

  if (result.rowCount === 0) {
    throw new NotFoundError({
      message: "Usuário não encontrado.",
      action: "Verifique o username informado e tente novamente.",
    });
  }

  return NextResponse.json(result.rows[0]);
}

async function putHandler(request, { params }) {
  const { username: currentUsername } = await params;

  let body;
  try {
    body = await request.json();
  } catch (error) {
    throw new ValidationError({
      message: "Erro ao processar o corpo da requisição.",
      action: "Verifique se o corpo da requisição está correto.",
      cause: error,
    });
  }

  const updatableFields = ["username", "email", "password"];

  const updateData = Object.fromEntries(
    Object.entries(body).filter(([key]) => updatableFields.includes(key)),
  );

  if (Object.keys(updateData).length === 0) {
    throw new ValidationError({
      message: "Nenhum campo permitido para atualização foi informado.",
      action: "Informe ao menos um campo válido para atualização.",
    });
  }

  const result = await user.updateUser(updateData, currentUsername);

  if (result.rowCount === 0) {
    throw new NotFoundError({
      message: "Usuário não encontrado.",
      action: "Verifique o username informado e tente novamente.",
    });
  }

  return NextResponse.json(result.rows[0], { status: 200 });
}

export const GET = controller(getHandler);
export const PUT = controller(putHandler);
