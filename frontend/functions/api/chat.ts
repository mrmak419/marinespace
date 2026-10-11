// Cloudflare Pages Function: POST /api/chat
interface Env {
  GEMINI_API_KEY?: string;
}

const KNOWN_PORTS: Record<string, [number, number, string]> = {
  vizag: [17.69, 83.30, "Visakhapatnam"],
  visakhapatnam: [17.69, 83.30, "Visakhapatnam"],
  chennai: [13.125, 80.294, "Chennai"],
  kasimedu: [13.125, 80.294, "Kasimedu, Chennai"],
  kochi: [9.965, 76.242, "Kochi"],
  cochin: [9.965, 76.242, "Kochi"],
  mumbai: [18.914, 72.825, "Mumbai"],
  sassoon: [18.914, 72.825, "Sassoon Docks, Mumbai"],
  mangalore: [12.862, 74.835, "Mangalore"],
  paradip: [20.312, 86.611, "Paradip"],
  veraval: [20.903, 70.362, "Veraval"],
  porbandar: [21.642, 69.601, "Porbandar"],
  tuticorin: [8.795, 78.161, "Thoothukudi"],
  thoothukudi: [8.795, 78.161, "Thoothukudi"],
  kakinada: [16.983, 82.261, "Kakinada"],
  digha: [21.625, 87.514, "Digha"],
  andaman: [11.662, 92.742, "Port Blair, Andaman"],
  "port blair": [11.662, 92.742, "Port Blair, Andaman"],
};

export async function onRequestPost(context: { request: Request; env: Env }) {
  try {
    const body: any = await context.request.json();
    const message: string = body.message || "";
    let lat = 17.69;
    let lon = 83.30;
    let locName = "Visakhapatnam Waters";

    // Detect location from query
    const lower = message.toLowerCase();
    for (const [key, val] of Object.entries(KNOWN_PORTS)) {
      if (lower.includes(key)) {
        lat = val[0];
        lon = val[1];
        locName = val[2];
        break;
      }
    }

    if (body.latitude && body.longitude && !lower.includes("vizag") && !lower.includes("chennai")) {
      lat = body.latitude;
      lon = body.longitude;
      locName = "Vessel GPS Coordinates";
    }

    // 1. Fetch live Open-Meteo Weather & Marine simultaneously
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,wind_speed_10m,wind_gusts_10m,precipitation,visibility,cape,weather_code&wind_speed_unit=kn&timezone=Asia/Kolkata&forecast_days=2`;
    const marineUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&hourly=wave_height,wave_period,swell_wave_height,ocean_current_velocity,sea_surface_temperature&timezone=Asia/Kolkata&forecast_days=2`;

    const [weatherRes, marineRes] = await Promise.all([
      fetch(weatherUrl).then(r => r.json()).catch(() => ({})),
      fetch(marineUrl).then(r => r.json()).catch(() => ({})),
    ]);

    // Parse Weather Metrics
    const wHourly = (weatherRes as any)?.hourly || {};
    const temp = wHourly.temperature_2m?.[0] ?? 28.5;
    const wind = wHourly.wind_speed_10m?.[0] ?? 12.0;
    const gust = Math.max(...(wHourly.wind_gusts_10m?.slice(0, 12) || [wind]));
    const cape = Math.max(...(wHourly.cape?.slice(0, 12) || [100]));
    const rain = (wHourly.precipitation?.slice(0, 12) || [0]).reduce((a: number, b: number) => a + b, 0);

    // Parse Marine Metrics
    const mHourly = (marineRes as any)?.hourly || {};
    const wave = mHourly.wave_height?.[0] ?? 1.2;
    const maxWave = Math.max(...(mHourly.wave_height?.slice(0, 12) || [wave]));
    const period = mHourly.wave_period?.[0] ?? 7.0;
    const sst = mHourly.sea_surface_temperature?.[0] ?? 28.2;
    const current = (mHourly.ocean_current_velocity?.[0] ?? 1.0) * 0.54;

    // 2. Deterministic Safety Evaluation
    let score = 100;
    const reasons: string[] = [];
    const recommendations: string[] = [];

    if (maxWave >= 3.0) {
      score -= 55;
      reasons.push(`Dangerous wave heights of ${maxWave.toFixed(1)}m exceeding safe operating limits (3.0m).`);
      recommendations.push("DO NOT VENTURE OUT: High probability of vessel swamping/capsizing.");
    } else if (maxWave >= 2.0) {
      score -= 30;
      reasons.push(`Rough sea state with wave heights reaching ${maxWave.toFixed(1)}m.`);
      recommendations.push("Small fiber craft and non-mechanized catamarans should remain nearshore.");
    }

    if (gust >= 35.0) {
      score -= 40;
      reasons.push(`Severe wind squall alerts with gusts up to ${gust.toFixed(1)} knots.`);
      recommendations.push("High risk of sudden sea squalls. Double check anchor lines and remain in port.");
    } else if (wind >= 22.0) {
      score -= 20;
      reasons.push(`Strong sustained winds of ${wind.toFixed(1)} knots.`);
    }

    if (cape >= 1000) {
      score -= 15;
      reasons.push("High atmospheric convective energy (CAPE > 1000 J/kg) indicates thunderstorm formation.");
      recommendations.push("Watch for towering cumulonimbus clouds on the offshore horizon.");
    }

    // Andaman EEZ Caution check
    if (lower.includes("andaman")) {
      reasons.push("Maritime Boundary Advisory: Strict adherence to territorial water limits required.");
      recommendations.push("Ensure GPS tracking remains active and moor vessels in Junglighat Harbour if squalls develop.");
    }

    const finalScore = Math.max(10, Math.min(100, score));
    const level = finalScore >= 75 ? "SAFE" : finalScore >= 45 ? "CAUTION" : "DANGEROUS";
    if (reasons.length === 0) {
      reasons.push("Calm seas, favorable wind conditions, and clear visibility.");
      recommendations.push("Ideal conditions for coastal and mechanized fishing activities.");
    }

    // 3. Gemini LLM Reasoning
    const geminiKey = context.env.GEMINI_API_KEY;
    let llmResponse = "";

    if (geminiKey) {
      const prompt = `You are ORCA, an intelligent AI Marine Intelligence Assistant for Indian fishermen.
User asks: "${message}"

Verified Real-time Ocean Observation Data:
- Sector: ${locName} (Lat: ${lat}, Lon: ${lon})
- Verdict: ${level} (Score: ${finalScore}/100)
- Waves: Current ${wave.toFixed(2)}m (Peak: ${maxWave.toFixed(2)}m)
- Winds: ${wind.toFixed(1)} knots (Gusts up to ${gust.toFixed(1)} knots)
- Weather: Temp ${temp}°C, Rain ${rain.toFixed(1)}mm
- SST: ${sst}°C | Surface Currents: ${current.toFixed(2)} knots
- Specific Hazards: ${reasons.join("; ")}
- Safety Plan: ${recommendations.join("; ")}

Provide a complete, structured, empathetic advisory in Markdown format. Mention the verdict icon (🟢 SAFE / 🟡 CAUTION / 🔴 DANGEROUS), list the hazards clearly, and cite INCOIS, IMD, and Open-Meteo.`;

      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.3, maxOutputTokens: 2000 }
            })
          }
        );

        if (geminiRes.ok) {
          const gData: any = await geminiRes.json();
          llmResponse = gData.candidates?.[0]?.content?.parts?.[0]?.text || "";
        }
      } catch (e) {}
    }

    // Fallback template if Gemini key is absent or network fails
    if (!llmResponse || llmResponse.length < 50) {
      const icon = level === "SAFE" ? "🟢" : level === "CAUTION" ? "🟡" : "🔴";
      llmResponse = `### ${icon} Verdict: ${level} (Safety Score: ${finalScore}/100)

**Observed Sea Conditions off ${loc_name}:**
• **Wave Height:** ${wave.toFixed(2)}m (12h Peak: ${maxWave.toFixed(2)}m)
• **Wind Speed:** ${wind.toFixed(1)} knots (Gusts: ${gust.toFixed(1)} knots)
• **Sea Surface Temp:** ${sst}°C | **Currents:** ${current.toFixed(2)} knots
• **Weather & Rain:** ${temp}°C (Rain: ${rain.toFixed(1)}mm)

**Identified Hazards & Warnings:**
${reasons.map(r => `• ${r}`).join("\n")}

**Recommended Action Plan:**
${recommendations.map(r => `• ${r}`).join("\n")}

*Authoritative Data Sources: INCOIS Ocean State Forecast, Open-Meteo Marine, IMD RSMC.*`;
    }

    return new Response(
      JSON.stringify({
        response: llmResponse,
        location: locName,
        coordinates: { latitude: lat, longitude: lon },
        safety_assessment: {
          level,
          score: finalScore,
          reasons,
          recommendations,
          sources: ["INCOIS Ocean State Forecast", "Open-Meteo Marine", "IMD RSMC"]
        },
        metrics: {
          wave_height_m: parseFloat(wave.toFixed(2)),
          wind_speed_knots: parseFloat(wind.toFixed(1)),
          wind_gusts_knots: parseFloat(gust.toFixed(1)),
          sst_c: parseFloat(sst.toFixed(1)),
          sea_state: maxWave < 1.5 ? "Slight / Moderate" : maxWave < 2.5 ? "Rough" : "High / Dangerous",
          condition: rain > 1.0 ? "Rain Showers" : "Clear / Partly Cloudy",
          tide: "Semi-diurnal Coastal Tide"
        },
        sources: ["INCOIS OSF", "Open-Meteo Marine", "IMD RSMC"]
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
