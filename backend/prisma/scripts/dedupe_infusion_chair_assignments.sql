-- Run before migration 003 if patients share the same infusion_chair_id.
-- Keeps the most recently updated patient per chair; clears the rest.

-- Inspect duplicates (optional)
-- SELECT infusion_chair_id, COUNT(*) AS patient_count
-- FROM patients
-- WHERE infusion_chair_id IS NOT NULL
-- GROUP BY infusion_chair_id
-- HAVING COUNT(*) > 1;

WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY infusion_chair_id
      ORDER BY updated_at DESC NULLS LAST, created_at DESC
    ) AS rn
  FROM patients
  WHERE infusion_chair_id IS NOT NULL
)
UPDATE patients AS p
SET infusion_chair_id = NULL
FROM ranked AS r
WHERE p.id = r.id
  AND r.rn > 1;
