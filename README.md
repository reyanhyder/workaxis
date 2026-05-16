# WorkAxis

WorkAxis is a professional command center for managing daily work, tasks, finances, network follow-ups, career goals, reminders, and AI-generated briefings in one focused workspace.

Live app: https://workaxis.vercel.app

## What It Does

- Cinematic landing experience with a post-login command hero
- Google sign-in with Firebase Authentication
- Personalized greetings and preferred-name setup
- Dashboard with AI briefing, task signals, spending, contacts, career goals, and reports
- Task manager with priority, due dates, reminders, and completion alerts
- Finance tracker for logging expenses
- Network CRM for professional contacts
- Career tracker for goals, certifications, applications, and next moves
- Monthly intelligence report view
- Settings for name, notification preference, compact mode, and workspace theme

## Tech Stack

- Frontend: React, Firebase Auth, Firestore, GSAP, Lucide React
- Backend: Flask, Gunicorn, Groq API
- Database/Auth: Firebase
- Frontend Hosting: Vercel
- Backend Hosting: Railway

## Project Structure

```txt
workaxis/
├── backend/    # Flask API and reminder worker
├── frontend/   # React app
└── DEPLOYMENT_PLAN.md
```

## Local Development

Frontend:

```bash
cd frontend
npm install
npm start
```

Backend:

```bash
cd backend
pip install -r requirements.txt
python app.py
```

Create `backend/.env` locally:

```env
GROQ_API_KEY=your_groq_api_key
ALLOWED_ORIGINS=http://localhost:3000
REMINDER_WORKER_SECRET=your_reminder_worker_secret
```

Create `frontend/.env` locally if needed:

```env
REACT_APP_API_URL=http://localhost:5000
```

## Deployment

Frontend is deployed on Vercel from the `frontend` directory.

Backend is deployed on Railway from the `backend` directory.

See [DEPLOYMENT_PLAN.md](DEPLOYMENT_PLAN.md) for the full deployment setup.

## Security

Do not commit real `.env` files or API keys. Use `.env.example` files for placeholders only, and keep production secrets in Railway or Vercel environment variables.
