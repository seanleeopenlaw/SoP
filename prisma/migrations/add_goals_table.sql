-- Add Goals table migration
-- Created: 2025-10-09

CREATE TABLE IF NOT EXISTS "goals" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "profile_id" UUID NOT NULL,
    "period" VARCHAR(100) NOT NULL,
    "professional_goals" TEXT,
    "personal_goals" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "goals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "goals_profile_id_key" ON "goals"("profile_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_goals_profile_id" ON "goals"("profile_id");

-- AddForeignKey
ALTER TABLE "goals" ADD CONSTRAINT "goals_profile_id_fkey"
    FOREIGN KEY ("profile_id") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
