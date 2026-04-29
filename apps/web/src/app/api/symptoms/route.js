import sql from "@/app/api/utils/sql";

export async function GET() {
  try {
    const symptoms = await sql`SELECT * FROM symptoms ORDER BY logged_at DESC`;
    return Response.json(symptoms);
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to fetch symptoms" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const { description, severity, city } = await request.json();

    let weatherData = null;
    if (city) {
      try {
        const weatherResponse = await fetch(
          `${process.env.NEXT_PUBLIC_CREATE_APP_URL}/integrations/weather-by-city/weather/${city}`,
        );
        if (weatherResponse.ok) {
          weatherData = await weatherResponse.json();
        }
      } catch (weatherError) {
        console.error("Weather fetch failed:", weatherError);
      }
    }

    const [newSymptom] = await sql`
      INSERT INTO symptoms (description, severity, weather_temp, weather_condition)
      VALUES (
        ${description}, 
        ${severity}, 
        ${weatherData?.current?.temp_c || null}, 
        ${weatherData?.current?.condition?.text || null}
      )
      RETURNING *
    `;
    return Response.json(newSymptom);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to log symptom" }, { status: 500 });
  }
}
