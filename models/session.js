import database from "infra/database";

export async function createSession(userId, token, expiresAt) {
  await database.query(
    "INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)",
    [userId, token, expiresAt],
  );

  await database.query(
    "DELETE FROM sessions WHERE user_id = $1 AND expires_at <= NOW()",
    [userId],
  );
}

export async function deleteSession(token) {
  await database.query("DELETE FROM sessions WHERE token = $1", [token]);
}
