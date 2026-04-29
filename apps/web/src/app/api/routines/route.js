import sql from "@/app/api/utils/sql";

export async function GET() {
  try {
    const routines = await sql`SELECT * FROM routines ORDER BY created_at DESC`;
    return Response.json(routines);
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to fetch routines" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const { name, frequency, time_of_day } = await request.json();
    const [newRoutine] = await sql`
      INSERT INTO routines (name, frequency, time_of_day)
      VALUES (${name}, ${frequency}, ${time_of_day})
      RETURNING *
    `;
    return Response.json(newRoutine);
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to create routine" },
      { status: 500 },
    );
  }
}
