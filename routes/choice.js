const { auth } = require("../middlewares");

//express
const express = require("express");
const router = express.Router();

//prisma
const { PrismaClient, UserType } = require("@prisma/client");
const prisma = new PrismaClient();

const choiceFields = {
    id: true,
    text: true,
};

const choiceQuestionFields = {
    ...choiceFields,
    question: {
        select: {
            id: true,
            text: true,
            assessment: {
                select: {
                    id: true,
                    subject: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            },
        },
    },
};

router.get("/question/:questionId", auth(), async(req, res, next) => {
    try {
        const choices = await prisma.choice.findMany({
            where: {
                questionId: req.params.questionId,
            },
            select: choiceFields,
        });
        res.send(choices);
    } catch (err) {
        next(err);
    }
});

router.get("/:id", auth(), async(req, res, next) => {
    try {
        const choice = await prisma.choice.findUnique({
            where: {
                id: req.params.id,
            },
            select: choiceQuestionFields,
        });
        res.send(choice);
    } catch (err) {
        next(err);
    }
});

router.post("/", auth({ type: UserType.TEACHER }), async(req, res, next) => {
    try {
        const { text, questionId } = req.body;
        const choice = await prisma.choice.create({
            data: {
                text: text,
                question: {
                    connect: {
                        id: questionId,
                    },
                },
            },
            select: choiceQuestionFields,
        });
        res.send(choice);
    } catch (err) {
        next(err);
    }
});

router.delete(
    "/:id",
    auth({ type: UserType.TEACHER }),
    async(req, res, next) => {
        try {
            const choice = await prisma.choice.delete({
                where: {
                    id: req.params.id,
                },
                select: choiceQuestionFields,
            });

            res.send(choice);
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
            const { text, questionId } = req.body;
            const choice = await prisma.choice.update({
                where: {
                    id: req.params.id,
                },
                data: {
                    text: text,
                    question: {
                        connect: {
                            id: questionId,
                        },
                    },
                },
                select: choiceQuestionFields,
            });
            res.send(choice);
        } catch (err) {
            next(err);
        }
    }
);

module.exports = router;