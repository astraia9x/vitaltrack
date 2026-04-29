import sql from "@/app/api/utils/sql";

export async function GET() {
  try {
    const appointments =
      await sql`SELECT * FROM appointments ORDER BY appointment_date ASC`;
    return Response.json(appointments);
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to fetch appointments" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const { doctor_name, specialty, appointment_date, reason } =
      await request.json();
    const [newAppointment] = await sql`
      INSERT INTO appointments (doctor_name, specialty, appointment_date, reason)
      VALUES (${doctor_name}, ${specialty}, ${appointment_date}, ${reason})
      RETURNING *
    `;
    return Response.json(newAppointment);
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to create appointment" },
      { status: 500 },
    );
  }
}
