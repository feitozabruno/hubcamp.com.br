import { NextResponse } from "next/server";
import { createSession, deleteSession } from "models/session.js";
import { ValidationError } from "infra/errors.js";
import { controller } from "infra/controller.js";

async function postHandler(request) {
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

  const { identifier, password } = body;

  if (!identifier || !password) {
    throw new ValidationError({
      message: "Campos obrigatórios não foram preenchidos.",
      action: "Preencha os campos 'identifier' e 'password' e tente novamente.",
    });
  }

  const token = await createSession(identifier, password);

  return NextResponse.json(
    { message: "Login realizado com sucesso!" },
    {
      status: 200,
      headers: {
        "Set-Cookie": `session_token=${token.code}; HttpOnly; Path=/; Max-Age=${token.expiration}; Secure`,
      },
    },
  );
}

async function deleteHandler(request) {
  const cookies = request.headers.get("cookie");
  const token = cookies?.match(/session_token=([^;]*)/)?.[1];

  if (!token) {
    return NextResponse.json(
      { message: "Nenhuma sessão ativa encontrada." },
      { status: 400 },
    );
  }

  await deleteSession(token);

  return NextResponse.json(
    { message: "Logout realizado com sucesso!" },
    {
      status: 200,
      headers: {
        "Set-Cookie": "session_token=; HttpOnly; Path=/; Max-Age=0; Secure;",
      },
    },
  );
}

export const POST = controller(postHandler);
export const DELETE = controller(deleteHandler);
