# Docker Setup

## Quick Start

```bash
# Build and start services
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f

# Stop services
docker compose down
```

## Services

| Service | Port | Description |
|---------|------|-------------|
| backend | 8080 | Go/Fiber API server |
| frontend | 3000 | Next.js web app |

## Environment Variables

Create `backend/.env` before running:

```env
PORT=8080
JWT_SECRET=your-secret-key-min-32-chars
SEED_ADMIN_EMAIL=admin@aetherhub.com
SEED_ADMIN_PASSWORD=your-secure-password
```

## Development

For local development without Docker:

```bash
# Backend
cd backend
go run cmd/server/main.go

# Frontend
cd frontend
npm run dev
```

## Production

```bash
# Build images
docker compose build

# Start in production mode
docker compose -f docker-compose.yml up -d
```

## CI/CD

GitHub Actions workflows:

- `.github/workflows/ci.yml` — Runs tests on push/PR
- `.github/workflows/docker.yml` — Builds and pushes Docker images

Required secrets:
- `DOCKER_USERNAME` — Docker Hub username
- `DOCKER_PASSWORD` — Docker Hub password
