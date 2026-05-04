# Night Out

A restaurant and bar social app for the Bay Area — save places, rate them, and eventually share with friends. Currently an MVP for personal use.

**Stack:** FastAPI · PostgreSQL · Next.js 15 · MapLibre

---

## Local setup

### Prerequisites

- Python 3.12+, [uv](https://docs.astral.sh/uv/getting-started/installation/)
- Node 20+
- PostgreSQL (or Docker)

### 1. Database

```bash
docker run -d --name nightout-db \
  -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=nightout \
  -p 5432:5432 postgres:16
```

### 2. Backend

```bash
cd backend
cp .env.example .env        # fill in SECRET_KEY and GOOGLE_PLACES_API_KEY at minimum
uv sync
uv run alembic upgrade head
uv run uvicorn app.main:app --reload
```

API runs at `http://localhost:8000` · Swagger docs at `http://localhost:8000/docs`

> Generate a secret key: `openssl rand -hex 32`

### 3. Frontend

```bash
cd web
cp .env.local.example .env.local
npm install
npm run dev
```

App runs at `http://localhost:3000`

---

## Project structure

```
backend/
  app/
    api/v1/       # routes: auth, users, places
    models/       # SQLAlchemy ORM (User, Place, UserPlace, Friendship)
    schemas/      # Pydantic request/response types
    services/
      places/     # PlaceResolver + Google/Foursquare/OSM providers
    core/         # config, database, JWT/bcrypt

web/
  app/
    (auth)/       # login, register
    (app)/        # places list, place detail, map
  components/     # PlaceSearchModal, MapComponent
  lib/            # API client, auth context, shared types
```
