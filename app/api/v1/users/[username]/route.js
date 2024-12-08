import database from "infra/database";

export async function GET(request, { params }) {
  const { username } = await params;

  const result = await database.query(
    "SELECT * FROM users WHERE username = $1",
    [username],
  );

  return Response.json(result.rows[0]);
}
