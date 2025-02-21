import crypto from "node:crypto";
import bcrypt from "bcrypt";
import { getUserByEmailOrUsername } from "models/user.js";
import { createSession, deleteSession } from "models/session.js";
import {
  handleError,
  InvalidCredentials,
  NotFoundError,
  RequestBodyError,
} from "infra/errors.js";

export async function POST(request) {
  try {
    let body;

    try {
      body = await request.json();
    } catch {
      throw new RequestBodyError();
    }

    const { identifier, password } = body;

    const userQuery = await getUserByEmailOrUsername(identifier);

    if (userQuery.rowCount === 0) {
      throw new NotFoundError("Usuário/Email");
    }

    const user = userQuery.rows[0];

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new InvalidCredentials();
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Sessão válida por 7 dias

    await createSession(user.id, token, expiresAt);

    const response = new Response(JSON.stringify({ message: "Logged in" }), {
      status: 200,
    });
    response.headers.set(
      "Set-Cookie",
      `session_token=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}`,
    );

    return response;
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(request) {
  const cookies = request.headers.get("cookie");
  const token = cookies?.match(/session_token=([^;]*)/)?.[1];

  if (!token) {
    return Response.json(
      { message: "No active session found" },
      { status: 400 },
    );
  }

  try {
    await deleteSession(token);

    return new Response(JSON.stringify({ message: "Logged out" }), {
      status: 200,
      headers: {
        "Set-Cookie": `session_token=; Path=/; HttpOnly; Secure; Expires=Thu, 01 Jan 1970 00:00:00 GMT`,
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    return handleError(err);
  }
}
