export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city") || "San Francisco";

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_CREATE_APP_URL}/integrations/weather-by-city/weather/${encodeURIComponent(city)}`,
    );

    if (!response.ok) {
      return Response.json(
        { error: "Failed to fetch weather data" },
        { status: 500 },
      );
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error("Weather fetch error:", error);
    return Response.json(
      { error: "Failed to fetch weather data" },
      { status: 500 },
    );
  }
}
