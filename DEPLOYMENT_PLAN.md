# WorkAxis Deployment Plan

## Recommended Launch Shape

Use Vercel for the React frontend and Railway for the Flask backend.

- Frontend: `frontend`
- Backend API: `backend`
- Auth/database: Firebase Auth + Firestore
- AI briefing API: Railway Flask service
- Reminder worker: Railway cron service, using `backend/reminder_worker.py`

## Vercel Frontend

Project settings:

- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `build`
- Environment Variable:
  - `REACT_APP_API_URL=https://your-railway-api-domain.up.railway.app`

After Railway gives the backend a public URL, add that URL to Vercel before the production deploy.

## Railway Backend

Service settings:

- Root Directory: `backend`
- Start Command: `gunicorn app:app --bind 0.0.0.0:$PORT`
- Public URL: generate one in Railway networking settings

Environment variables:

- `GROQ_API_KEY`
- `ALLOWED_ORIGINS=https://your-vercel-domain.vercel.app,http://localhost:3000`
- `FIREBASE_SERVICE_ACCOUNT_JSON`
- `REMINDER_WORKER_SECRET`

## Railway Reminder Worker

Create a second Railway service from the same repo/backend directory.

- Root Directory: `backend`
- Start Command: `python reminder_worker.py`
- Cron Schedule: every 5 minutes or every 10 minutes
- Same Firebase env vars as the backend service

This worker marks due reminders on the backend. Browser push notifications outside an open tab will need a later push-subscription layer, but the backend reminder schedule is now prepared.

## Firebase

Before public launch:

- Add the Vercel production domain to Firebase Authentication authorized domains.
- Confirm Firestore rules require `request.auth.uid == resource.data.uid` for private collections.
- Generate a Firebase service account JSON for Railway backend reminders.

## Launch Order

1. Deploy backend to Railway.
2. Generate Railway public domain.
3. Put Railway domain into Vercel as `REACT_APP_API_URL`.
4. Put Vercel domain into Railway `ALLOWED_ORIGINS`.
5. Add Vercel domain to Firebase authorized domains.
6. Deploy frontend to Vercel.
7. Create Railway reminder cron service.
8. Test Google login, briefing refresh, task creation, reminder due behavior, and reports.
