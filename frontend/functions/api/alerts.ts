// Cloudflare Pages Function: GET /api/alerts
export async function onRequestGet() {
  const alerts = [
    {
      id: "incois-alert-01",
      region: "Andhra Pradesh & Odisha Coast",
      severity: "caution",
      title: "INCOIS High Wave & Swell Surge Advisory",
      details: "Waves of 1.8 to 2.6 meters forecasted off Visakhapatnam to Gopalpur. Small non-mechanized vessels advised to exercise caution during high tide.",
      source: "INCOIS",
      timestamp: new Date().toISOString()
    },
    {
      id: "imd-warning-02",
      region: "Southwest Bay of Bengal & Palk Bay",
      severity: "info",
      title: "IMD Fishermen Warning: Squally Weather Alert",
      details: "Wind speeds reaching 35-45 kmph with occasional gusts up to 55 kmph. Fishermen advised not to venture into deep waters off Tamil Nadu coast.",
      source: "IMD RSMC",
      timestamp: new Date().toISOString()
    },
    {
      id: "ndma-alert-03",
      region: "Gujarat & Northern Arabian Sea",
      severity: "info",
      title: "NDMA SACHET: General Marine Advisory",
      details: "Normal to moderate sea conditions prevailing along Saurashtra coast. Safe for regular inshore fishing activities.",
      source: "NDMA SACHET",
      timestamp: new Date().toISOString()
    }
  ];

  return new Response(JSON.stringify({
    status: "success",
    count: alerts.length,
    alerts: alerts
  }), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=300",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
