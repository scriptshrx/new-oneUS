-- CreateEnum
CREATE TYPE "reminder_types" AS ENUM ('BEFORE_INFUSION_72H', 'BEFORE_INFUSION_24H', 'AFTER_TREATMENT_2H');

-- CreateEnum
CREATE TYPE "reminder_statuses" AS ENUM ('PENDING', 'SENT', 'CANCELLED');

-- CreateTable
CREATE TABLE "reminders" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "appointment_id" TEXT NOT NULL,
    "type" "reminder_types" NOT NULL,
    "scheduled_for" TIMESTAMP(3) NOT NULL,
    "sent_at" TIMESTAMP(3),
    "status" "reminder_statuses" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reminders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reminders_patient_id_idx" ON "reminders"("patient_id");

-- CreateIndex
CREATE INDEX "reminders_scheduled_for_idx" ON "reminders"("scheduled_for");

-- CreateIndex
CREATE INDEX "reminders_status_idx" ON "reminders"("status");

-- CreateIndex
CREATE UNIQUE INDEX "reminders_appointment_id_type_key" ON "reminders"("appointment_id", "type");

-- AddForeignKey
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
