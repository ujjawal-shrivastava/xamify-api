/*
  Warnings:

  - A unique constraint covering the columns `[questionId,text]` on the table `choice` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "choice_questionId_text_key" ON "choice"("questionId", "text");
