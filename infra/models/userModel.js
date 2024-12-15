import database from "../database.js";
import { ValidationError } from "utils/errors";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

async function hashPassword(password) {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

export async function createUser({ name, username, email, password }) {
  if (!name || !username || !email || !password) {
    throw new ValidationError();
  }

  const hashedPassword = await hashPassword(password);

  await database.query(
    "INSERT INTO users (name, username, email, password) VALUES ($1, $2, $3, $4)",
    [name, username, email, hashedPassword],
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

  const hashedPassword = await hashPassword(updateData.password);

  updateData.password = hashedPassword;

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
