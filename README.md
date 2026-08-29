# MarineSpace

🐋 **ORCA** — Marine EcOsystem Reasoning with Collaborative Agents

An Agentic AI-powered marine intelligence platform for Indian fishermen, coastal communities, and maritime operators. Built for Smart India Hackathon.

## What It Does

Ask questions in natural language, get intelligent answers backed by real-time satellite, ocean, and weather data:

- 🐟 "Where is the nearest Potential Fishing Zone today?"
- ⚠️ "Is it safe to venture into the sea tomorrow morning?"
- 🌊 "What are the tide, weather, and sea conditions near Vizag?"
- 🌀 "Are there any cyclone alerts in the Bay of Bengal?"
- 🗺️ "Which regions show high chlorophyll and favorable SST?"

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + TypeScript + Tailwind CSS |
| Maps | React-Leaflet + Leaflet.js |
| Backend | Python FastAPI + LangGraph |
| LLM | Google Gemini API |
| Database | Supabase (PostgreSQL + PostGIS) |
| Cache | Upstash Redis |
| Hosting | Cloudflare Pages (frontend) + Railway (backend) |

## Data Sources

### 🇮🇳 Indian Government (Primary)
- **INCOIS** — ERDDAP, THREDDS, PFZ Advisory, High Wave Alerts, Tsunami Warnings
- **ISRO MOSDAC** — OceanSat-3 Chlorophyll, SST, SCATSAT Wind Vectors
- **ISRO Bhuvan** — Satellite Map Tiles (WMS/WFS)
- **IMD** — Cyclone Bulletins, Weather Warnings
- **NDMA SACHET** — Real-time Disaster Alerts (CAP/RSS)

### 🌍 Global (Enrichment)
- **Open-Meteo** — Weather + Marine Forecasts
- **Copernicus Marine** — High-res SST, Chlorophyll, Currents

## Quick Start

### Frontend
```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

### Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env  # Fill in your API keys
uvicorn app.main:app --reload --port 8000
# → http://localhost:8000
```

## Team MarineSpace
Built with ❤️ for Smart India Hackathon
