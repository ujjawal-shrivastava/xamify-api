/*
  Warnings:

  - Added the required column `duration` to the `assessment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `schedule` to the `assessment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "assessment" ADD COLUMN     "duration" TIMETZ NOT NULL,
ADD COLUMN     "schedule" TIMESTAMPTZ NOT NULL;
