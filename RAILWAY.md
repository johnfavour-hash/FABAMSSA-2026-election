# Railway deployment

## Backend service

Create a Railway service from this repository and set its root directory to `backend`. Railway will use `backend/railway.json` to install dependencies, start Gunicorn, and check `/api/health`.

Set these variables in the Railway service:

```text
BAMSSA_DB_PATH=/data/election_demo.db
BAMSSA_ADMIN_PASSCODE=<your admin passcode>
BAMSSA_ADMIN_EMAILS=<comma-separated authorized admin emails>
BAMSSA_ADMIN_NAME=Administrator
BAMSSA_CORS_ORIGINS=https://bamssa-uniport-elections-2026.vercel.app,https://*.vercel.app
```

Attach a Railway volume and mount it at `/data`. Without the volume, SQLite data can be lost when Railway replaces or restarts the service.

## Frontend service

In the Vercel project, set:

```text
VITE_API_BASE_URL=https://<your-railway-domain>
```

The frontend adds `/api` automatically. Redeploy Vercel after changing this variable.

Test the backend before testing the frontend:

```text
https://<your-railway-domain>/api/health
```