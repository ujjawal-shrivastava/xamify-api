-- DropForeignKey
ALTER TABLE "answer" DROP CONSTRAINT "answer_choiceId_fkey";

-- AlterTable
ALTER TABLE "answer" ALTER COLUMN "choiceId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "answer" ADD CONSTRAINT "answer_choiceId_fkey" FOREIGN KEY ("choiceId") REFERENCES "choice"("id") ON DELETE SET NULL ON UPDATE CASCADE;
