import database from "infra/database.js";
import { ValidationError } from "infra/errors.js";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

async function hashPassword(password) {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

export async function createUser({ username, email, password }) {
  if (!username || !email || !password) {
    throw new ValidationError();
  }

  const hashedPassword = await hashPassword(password);

  await database.query(
    "INSERT INTO users (username, email, password) VALUES ($1, $2, $3)",
    [username, email, hashedPassword],
  );
}

export async function getUserByEmailOrUsername(identifier) {
  const result = await database.query(
    "SELECT * FROM users WHERE email = $1 OR username = $1",
    [identifier],
  );

  return result;
}

export async function updateUser(updateData, currentUsername) {
  const setClauses = [];
  const values = [];
  let index = 1;

  if (updateData.password) {
    updateData.password = await hashPassword(updateData.password);
  }

  for (const [key, value] of Object.entries(updateData)) {
    setClauses.push(`${key} = $${index}`);
    values.push(value);
    index++;
  }

  const query = `
    UPDATE users
    SET ${setClauses.join(", ")}
    WHERE username = $${index}
    RETURNING *;
  `;

  values.push(currentUsername);

  return await database.query(query, values);
}
