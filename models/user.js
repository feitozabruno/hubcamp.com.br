import database from "infra/database.js";
import bcrypt from "bcrypt";
import { NotFoundError, ValidationError } from "infra/errors.js";

async function create(userInputValues) {
  await validateUniqueEmail(userInputValues.email);
  await validateUniqueUsername(userInputValues.username);

  const newUser = await runInsertQuery(userInputValues);
  return newUser;

  async function validateUniqueEmail() {
    const results = await database.query({
      text: `
        SELECT
          email
        FROM
          users
        WHERE
          LOWER(email) = LOWER($1)
        ;`,
      values: [userInputValues.email],
    });

    if (results.rowCount > 0) {
      throw new ValidationError({
        message: "O email informado já está sendo utilizado.",
        action: "Utilize outro email para realizar o cadastro.",
      });
    }
  }

  async function validateUniqueUsername() {
    const results = await database.query({
      text: `
        SELECT
          username
        FROM
          users
        WHERE
          LOWER(username) = LOWER($1)
        ;`,
      values: [userInputValues.username],
    });

    if (results.rowCount > 0) {
      throw new ValidationError({
        message: "O username informado já está sendo utilizado.",
        action: "Utilize outro username para realizar o cadastro.",
      });
    }
  }

  async function runInsertQuery(userInputValues) {
    const hashedPassword = await bcrypt.hash(userInputValues.password, 10);

    const results = await database.query({
      text: `
        INSERT INTO
          users (username, email, password)
        VALUES
          ($1, $2, $3)
        RETURNING
          *
        ;`,
      values: [userInputValues.username, userInputValues.email, hashedPassword],
    });

    return results.rows[0];
  }
}

async function findByUsernameOrEmail(identifier) {
  const result = await database.query({
    text: `
      SELECT
        *
      FROM
        users
      WHERE
        email = $1
      OR
        username = $1
    ;`,
    values: [identifier],
  });

  if (result.rowCount === 0) {
    throw new NotFoundError({
      message: "Usuário não encontrado.",
      action: "Verifique o username informado e tente novamente.",
    });
  }

  return result;
}

async function updateUser(updateData, currentUsername) {
  const setClauses = [];
  const values = [];
  let index = 1;

  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 10);
  }

  for (const [key, value] of Object.entries(updateData)) {
    setClauses.push(`${key} = $${index}`);
    values.push(value);
    index++;
  }

  setClauses.push(`updated_at = NOW()`);

  values.push(currentUsername);

  return await database.query({
    text: `
      UPDATE
        users
      SET
        ${setClauses.join(", ")}
      WHERE
        username = $${index}
      RETURNING
        *
    ;`,
    values,
  });
}

const user = {
  create,
  findByUsernameOrEmail,
  updateUser,
};

export default user;
