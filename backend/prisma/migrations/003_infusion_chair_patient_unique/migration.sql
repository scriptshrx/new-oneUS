-- Enforce at most one patient per infusion chair
CREATE UNIQUE INDEX "patients_infusion_chair_id_key" ON "patients"("infusion_chair_id");
