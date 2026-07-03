-- Drop Session table entirely — sessions are now managed in Redis with sliding TTL.
DROP TABLE IF EXISTS "Session";
