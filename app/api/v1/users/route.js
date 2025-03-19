import { NextResponse } from "next/server";
import user from "models/user.js";
import { ValidationError } from "infra/errors.js";
import { controller } from "infra/controller.js";

async function postHandler(request) {
  const userData = await request.json();

  if (!userData.username || !userData.email || !userData.password) {
    throw new ValidationError({
      message: "Os campos username, email e password são obrigatórios.",
      action: "Preencha os campos obrigatórios e tente novamente.",
    });
  }

  const createdUser = await user.create(userData);

  return NextResponse.json(createdUser, { status: 201 });
}

export const POST = controller(postHandler);
