//express
const express = require("express");
const router = express.Router();

//prisma
const { UserType, AssessmentType, QuestionType } = require("@prisma/client");

router.get("/", async(req, res, next) => {
    try {
        res.send({
            userTypes: UserType,
            assessmentType: AssessmentType,
            questionType: QuestionType,
        });
    } catch (error) {
        next(error);
    }
});
module.exports = router;