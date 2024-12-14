import database from "../database.js";
import { ValidationError } from "utils/errors";

export async function createUser({ name, username, email, password }) {
  if (!name || !username || !email || !password) {
    throw new ValidationError();
  }

  await database.query(
    "INSERT INTO users (name, username, email, password) VALUES ($1, $2, $3, $4)",
    [name, username, email, password],
  );
}
