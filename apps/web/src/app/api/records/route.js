import sql from "@/app/api/utils/sql";

export async function GET() {
  try {
    const records =
      await sql`SELECT * FROM health_records ORDER BY record_date DESC`;
    return Response.json(records);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to fetch records" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { title, description, record_date, type } = await request.json();
    const [newRecord] = await sql`
      INSERT INTO health_records (title, description, record_date, type)
      VALUES (${title}, ${description}, ${record_date}, ${type})
      RETURNING *
    `;
    return Response.json(newRecord);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to create record" }, { status: 500 });
  }
}
