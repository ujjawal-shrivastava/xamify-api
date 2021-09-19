/*
  Warnings:

  - A unique constraint covering the columns `[assessmentId,text]` on the table `question` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "question_assessmentId_text_key" ON "question"("assessmentId", "text");
