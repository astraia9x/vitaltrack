import sql from "@/app/api/utils/sql";

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const { is_active } = await request.json();
    const [updated] = await sql`
      UPDATE routines 
      SET is_active = ${is_active} 
      WHERE id = ${id} 
      RETURNING *
    `;
    return Response.json(updated);
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to update routine" },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    await sql`DELETE FROM routines WHERE id = ${id}`;
    return Response.json({ success: true });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to delete routine" },
      { status: 500 },
    );
  }
}
