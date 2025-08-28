-- Add assigned_staff_name to pickups so we can persist the staff display name selected from frontend
ALTER TABLE pickups
ADD COLUMN assigned_staff_name VARCHAR(255);

-- Optional: backfill from assigned_staff_id if you have a staff table; left empty for now.
