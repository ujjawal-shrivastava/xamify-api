/*
  Warnings:

  - A unique constraint covering the columns `[studentId,assessmentId]` on the table `submission` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "submission_studentId_assessmentId_key" ON "submission"("studentId", "assessmentId");
