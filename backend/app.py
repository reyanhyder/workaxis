from flask import Flask, jsonify, request
from flask_cors import CORS
from groq import Groq
from dotenv import load_dotenv
from datetime import datetime, timezone
import os
import json

import firebase_admin
from firebase_admin import credentials, firestore

load_dotenv()

app = Flask(__name__)
CORS(app, origins=os.getenv("ALLOWED_ORIGINS", "*").split(","))

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

firebase_db = None


def get_firebase_db():
    global firebase_db
    if firebase_db:
        return firebase_db

    if not firebase_admin._apps:
        service_account_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
        credentials_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

        if service_account_json:
            cred = credentials.Certificate(json.loads(service_account_json))
        elif credentials_path:
            cred = credentials.Certificate(credentials_path)
        else:
            return None

        firebase_admin.initialize_app(cred)

    firebase_db = firestore.client()
    return firebase_db

@app.route("/")
def home():
    return jsonify({"status": "WorkAxis API is running"})

@app.route("/api/briefing", methods=["POST"])
def get_briefing():
    data = request.json
    tasks = data.get("tasks", [])
    expenses = data.get("expenses", [])
    contacts = data.get("contacts", [])
    name = data.get("name", "there")

    prompt = f"""
    You are a personal AI chief of staff for {name}.
    Generate a short, professional morning briefing based on:
    - Tasks: {tasks}
    - Recent expenses: {expenses}
    - Contacts to follow up: {contacts}
    
    Keep it under 100 words. Be direct, professional, and actionable.
    Format: 3 bullet points max.
    """

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}]
    )

    return jsonify({"briefing": response.choices[0].message.content})


@app.route("/api/reminders/due", methods=["GET"])
def get_due_reminders():
    worker_secret = os.getenv("REMINDER_WORKER_SECRET")
    if worker_secret and request.headers.get("X-Reminder-Worker-Secret") != worker_secret:
        return jsonify({"error": "Unauthorized"}), 401

    db = get_firebase_db()
    if not db:
        return jsonify({
            "configured": False,
            "due": [],
            "message": "Firebase admin credentials are not configured."
        }), 200

    now = datetime.now(timezone.utc)
    mark_notified = request.args.get("mark") == "true"
    due = []

    tasks_ref = db.collection("tasks").where("done", "==", False).stream()
    for task_doc in tasks_ref:
        task = task_doc.to_dict()
        reminder_at = task.get("reminderAt")
        already_notified = task.get("backendNotifiedAt")
        if not reminder_at or already_notified:
            continue

        try:
            reminder_time = datetime.fromisoformat(reminder_at.replace("Z", "+00:00"))
        except ValueError:
            continue

        if reminder_time <= now:
            due.append({
                "id": task_doc.id,
                "uid": task.get("uid"),
                "text": task.get("text"),
                "reminderAt": reminder_at,
                "priority": task.get("priority", "medium"),
            })
            if mark_notified:
                task_doc.reference.update({"backendNotifiedAt": now.isoformat()})

    return jsonify({"configured": True, "count": len(due), "due": due})

@app.route("/api/task-organize", methods=["POST"])
def organize_tasks():
    data = request.json
    tasks = data.get("tasks", [])

    prompt = f"""
    Organize these tasks by priority (High/Medium/Low) and suggest the best order to complete them today:
    {tasks}
    Return as JSON with format: [{{"task": "...", "priority": "High/Medium/Low", "reason": "..."}}]
    Return only JSON, no extra text.
    """

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}]
    )

    return jsonify({"organized": response.choices[0].message.content})

if __name__ == "__main__":
    app.run(debug=True, port=5000)
