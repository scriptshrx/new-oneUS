-- Add infusion_chair_id column to patients table
ALTER TABLE "patients" ADD COLUMN "infusion_chair_id" TEXT;

-- Add foreign key constraint
ALTER TABLE "patients" ADD CONSTRAINT "patients_infusion_chair_id_fkey" FOREIGN KEY ("infusion_chair_id") REFERENCES "infusion_chairs"("id") ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX "patients_infusion_chair_id_idx" ON "patients"("infusion_chair_id");
