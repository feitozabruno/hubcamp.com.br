import database from "infra/database.js";
import crypto from "node:crypto";
import bcrypt from "bcrypt";
import { NotFoundError, ValidationError } from "infra/errors.js";
import user from "models/user.js";

export async function createSession(identifier, password) {
  const userQuery = await user.findByUsernameOrEmail(identifier);

  const foundUser = userQuery.rows[0];

  const isPasswordValid = await bcrypt.compare(password, foundUser.password);

  if (!isPasswordValid) {
    throw new ValidationError({
      message: "Senha inválida.",
      action: "Verifique a senha informada e tente novamente.",
      statusCode: 401,
    });
  }

  const maxAge = 7 * 24 * 60 * 60; // 7 dias em segundos
  const expiresAt = new Date(Date.now() + maxAge * 1000);

  const token = {
    code: crypto.randomBytes(32).toString("hex"),
    expiration: maxAge,
  };

  await database.query({
    text: `
      INSERT INTO
        sessions (user_id, token, expires_at)
      VALUES
        ($1, $2, $3)
    ;`,
    values: [foundUser.id, token.code, expiresAt],
  });

  await database.query({
    text: `
      DELETE FROM
        sessions
      WHERE
        user_id = $1
      AND
        expires_at < NOW()
    ;`,
    values: [foundUser.id],
  });

  return token;
}

export async function deleteSession(token) {
  const result = await database.query({
    text: `
      SELECT
        user_id
      FROM
        sessions
      WHERE
        token = $1
    ;`,
    values: [token],
  });

  if (result.rowCount === 0) {
    throw new NotFoundError({
      message: "Sessão não encontrada.",
      action: "Verifique se a sessão informada está correta.",
    });
  }

  const userId = result.rows[0].user_id;

  await database.query({
    text: `
      DELETE FROM
        sessions
      WHERE
        token = $1
    ;`,
    values: [token],
  });

  await database.query({
    text: `
      DELETE FROM
        sessions
      WHERE
        user_id = $1
      AND
        expires_at < NOW()
    ;`,
    values: [userId],
  });
}
