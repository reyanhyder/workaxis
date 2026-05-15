from datetime import datetime, timezone

from app import get_firebase_db


def main():
    db = get_firebase_db()
    if not db:
      print("Firebase admin credentials are not configured.")
      return

    now = datetime.now(timezone.utc)
    due_count = 0

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
            due_count += 1
            task_doc.reference.update({"backendNotifiedAt": now.isoformat()})
            print(f"Reminder due: {task_doc.id} | {task.get('text')}")

    print(f"Processed {due_count} due reminder(s).")


if __name__ == "__main__":
    main()
