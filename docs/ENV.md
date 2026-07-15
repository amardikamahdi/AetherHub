# Environment Variables

## Frontend (`frontend/.env.local`)

<!-- AUTO-GENERATED -->
| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | No | Backend API base URL (default: `http://localhost:8080`) | `http://localhost:8080` |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes* | Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes* | Supabase anonymous key | `eyJxxx...` |
<!-- /AUTO-GENERATED -->

*Required when Supabase integration is enabled (currently using in-memory repositories).

## Backend (`backend/.env`)

<!-- AUTO-GENERATED -->
| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `PORT` | No | Server port (default: `8080`) | `8080` |
| `JWT_SECRET` | Yes | Secret key for JWT signing | `your-secret-key-min-32-chars` |
| `JWT_EXPIRY` | No | JWT token expiry duration (default: `24h`) | `24h`, `7d` |
| `SUPABASE_URL` | Yes* | Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_KEY` | Yes* | Supabase service role key | `eyJxxx...` |
<!-- /AUTO-GENERATED -->

*Required when Supabase integration is enabled.

## Example `.env` Files

### Frontend `.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
# NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

### Backend `.env`
```env
PORT=8080
JWT_SECRET=change-me-to-a-secure-random-string-at-least-32-chars
JWT_EXPIRY=24h
# SUPABASE_URL=https://xxx.supabase.co
# SUPABASE_SERVICE_KEY=eyJxxx...
```
