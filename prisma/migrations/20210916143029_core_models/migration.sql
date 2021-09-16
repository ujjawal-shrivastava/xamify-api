/*
  Warnings:

  - Changed the type of `type` on the `user` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "user_type" AS ENUM ('STUDENT', 'TEACHER');

-- CreateEnum
CREATE TYPE "assessment_type" AS ENUM ('DIGITAL', 'WRITTEN');

-- CreateEnum
CREATE TYPE "question_type" AS ENUM ('MCQ', 'TYPE', 'IMAGE');

-- CreateEnum
CREATE TYPE "submission_type" AS ENUM ('OFFLINE', 'ONLINE');

-- AlterTable
ALTER TABLE "user" DROP COLUMN "type",
ADD COLUMN     "type" "user_type" NOT NULL;

-- DropEnum
DROP TYPE "UserType";

-- CreateTable
CREATE TABLE "profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rollNo" TEXT NOT NULL,
    "dob" TIMESTAMP(3) NOT NULL,
    "yearId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,

    CONSTRAINT "profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "year" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "year_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subject" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "yearId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,

    CONSTRAINT "subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment" (
    "id" TEXT NOT NULL,
    "type" "assessment_type" NOT NULL,
    "authorId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,

    CONSTRAINT "assessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question" (
    "id" TEXT NOT NULL,
    "type" "question_type" NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "choice" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "choice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submission" (
    "id" TEXT NOT NULL,
    "type" "submission_type" NOT NULL,
    "studentId" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "answer" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "text" TEXT,
    "choiceId" TEXT NOT NULL,

    CONSTRAINT "answer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "image" (
    "id" TEXT NOT NULL,
    "data" BYTEA NOT NULL,
    "answerId" TEXT,

    CONSTRAINT "image_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profile_userId_unique" ON "profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "year_label_key" ON "year"("label");

-- CreateIndex
CREATE UNIQUE INDEX "course_name_key" ON "course"("name");

-- CreateIndex
CREATE UNIQUE INDEX "subject_name_key" ON "subject"("name");

-- AddForeignKey
ALTER TABLE "profile" ADD CONSTRAINT "profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile" ADD CONSTRAINT "profile_yearId_fkey" FOREIGN KEY ("yearId") REFERENCES "year"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile" ADD CONSTRAINT "profile_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subject" ADD CONSTRAINT "subject_yearId_fkey" FOREIGN KEY ("yearId") REFERENCES "year"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subject" ADD CONSTRAINT "subject_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment" ADD CONSTRAINT "assessment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment" ADD CONSTRAINT "assessment_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question" ADD CONSTRAINT "question_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "assessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "choice" ADD CONSTRAINT "choice_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission" ADD CONSTRAINT "submission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission" ADD CONSTRAINT "submission_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "assessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answer" ADD CONSTRAINT "answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answer" ADD CONSTRAINT "answer_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "submission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answer" ADD CONSTRAINT "answer_choiceId_fkey" FOREIGN KEY ("choiceId") REFERENCES "choice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "image" ADD CONSTRAINT "image_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES "answer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
