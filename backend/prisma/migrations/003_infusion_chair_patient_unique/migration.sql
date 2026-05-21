-- Clear duplicate chair assignments (keep most recently updated patient per chair)
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

-- Enforce at most one patient per infusion chair
CREATE UNIQUE INDEX "patients_infusion_chair_id_key" ON "patients"("infusion_chair_id");
