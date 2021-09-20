const { auth } = require("../middlewares");

//express
const express = require("express");
const router = express.Router();

//prisma
const { PrismaClient, UserType, QuestionType } = require("@prisma/client");

const prisma = new PrismaClient();

const questionFields = {
    id: true,
    type: true,
    text: true,
    choices: {
        select: {
            id: true,
            text: true,
        },
    },
};

const questionAssessmentFields = {
    ...questionFields,
    assessment: {
        select: {
            id: true,
            startTime: true,
            endTime: true,
            subject: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    },
};

router.get("/assessment/:assessmentId", auth(), async(req, res, next) => {
    try {
        const questions = await prisma.question.findMany({
            where: {
                assessmentId: req.params.assessmentId,
            },
            select: questionFields,
        });
        res.send(questions);
    } catch (err) {
        next(err);
    }
});

router.get("/:id", auth(), async(req, res, next) => {
    try {
        const question = await prisma.question.findUnique({
            where: {
                id: req.params.id,
            },
            select: questionAssessmentFields,
        });
        res.send(question);
    } catch (err) {
        next(err);
    }
});

router.post("/", auth({ type: UserType.TEACHER }), async(req, res, next) => {
    try {
        const { type, text, assessmentId, choices } = req.body;

        const question = await prisma.question.create({
            data: {
                type: type,
                text: text,
                assessment: {
                    connect: {
                        id: assessmentId,
                    },
                },
                choices: type == QuestionType.MCQ ?
                    {
                        create: choices,
                    } :
                    {},
            },
            select: questionAssessmentFields,
        });
        res.send(question);
    } catch (err) {
        next(err);
    }
});

router.delete(
    "/:id",
    auth({ type: UserType.TEACHER }),
    async(req, res, next) => {
        try {
            const question = await prisma.question.delete({
                where: {
                    id: req.params.id,
                },
                select: questionAssessmentFields,
            });

            res.send(question);
        } catch (err) {
            next(err);
        }
    }
);

router.patch(
    "/:id",
    auth({ type: UserType.TEACHER }),
    async(req, res, next) => {
        try {
            const { type, text, assessmentId } = req.body;

            const question = await prisma.question.update({
                where: {
                    id: req.params.id,
                },
                data: {
                    type: type,
                    text: text,
                    assessment: {
                        connect: {
                            id: assessmentId,
                        },
                    },
                },
                select: questionAssessmentFields,
            });
            res.send(question);
        } catch (err) {
            next(err);
        }
    }
);

module.exports = router;