// Cloudflare Pages Function: GET /api/map/geojson/:layer
export async function onRequestGet(context: any) {
  const layer = context.params.layer;
  const allowed = ["india_eez", "maritime_boundaries", "marine_protected_areas", "indian_ports"];

  if (!allowed.includes(layer)) {
    return new Response(JSON.stringify({ error: `Layer ${layer} not found` }), {
      status: 404,
      headers: { "Content-Type": "application/json" }
    });
  }

  const url = new URL(context.request.url);
  const dataUrl = `${url.origin}/data/${layer}.geojson`;

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

  return new Response(JSON.stringify({ error: "Failed to load layer data" }), {
    status: 500,
    headers: { "Content-Type": "application/json" }
  });
}
