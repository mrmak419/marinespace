// Cloudflare Pages Function: GET /api/map/ports
export async function onRequestGet(context: any) {
  const url = new URL(context.request.url);
  const dataUrl = `${url.origin}/data/indian_ports.geojson`;
  
  try {
    const res = await fetch(dataUrl);
    if (res.ok) {
      const data = await res.json();
      return new Response(JSON.stringify(data), {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=3600",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
  } catch (e) {}

  return new Response(JSON.stringify({ type: "FeatureCollection", features: [] }), {
    headers: { "Content-Type": "application/json" }
  });
}
