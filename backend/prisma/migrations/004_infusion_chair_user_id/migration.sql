-- Add optional staff user assignment to infusion chairs
ALTER TABLE "infusion_chairs" ADD COLUMN "user_id" TEXT;

ALTER TABLE "infusion_chairs" ADD CONSTRAINT "infusion_chairs_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "infusion_chairs_user_id_idx" ON "infusion_chairs"("user_id");
