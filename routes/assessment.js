const { auth } = require("../middlewares");

//express
const express = require("express");
const router = express.Router();

//prisma
const { PrismaClient, UserType } = require("@prisma/client");

const prisma = new PrismaClient();

const assessmentFields = {
    id: true,
    type: true,
    author: {
        select: {
            id: true,
            email: true,
            name: true,
        },
    },
    subject: {
        select: {
            id: true,
            name: true,
            course: {
                select: {
                    id: true,
                    name: true,
                },
            },
            year: {
                select: {
                    id: true,
                    label: true,
                },
            },
        },
    },
    startTime: true,
    endTime: true,
    questions: {
        select: {
            id: true,
            type: true,
            text: true,
            choices: {
                select: {
                    id: true,
                    text: true,
                },
            },
        },
    },
};

router.get("/", auth(), async(req, res, next) => {
    try {
        const assessments = await prisma.assessment.findMany({
            select: assessmentFields,
        });
        res.send(assessments);
    } catch (err) {
        next(err);
    }
});

router.get("/:id", auth(), async(req, res, next) => {
    try {
        const assessment = await prisma.assessment.findUnique({
            where: {
                id: req.params.id,
            },
            select: assessmentFields,
        });
        res.send(assessment);
    } catch (err) {
        next(err);
    }
});

router.post("/", auth({ type: UserType.TEACHER }), async(req, res, next) => {
    try {
        const { type, subjectId, startTime, endTime } = req.body;
        const assessment = await prisma.assessment.create({
            data: {
                type: type,
                author: {
                    connect: {
                        email: req.user.email,
                    },
                },
                subject: {
                    connect: {
                        id: subjectId,
                    },
                },
                startTime: startTime,
                endTime: endTime,
            },
            select: assessmentFields,
        });
        res.send(assessment);
    } catch (err) {
        next(err);
    }
});

router.delete(
    "/:id",
    auth({ type: UserType.TEACHER }),
    async(req, res, next) => {
        try {
            const assessment = await prisma.assessment.delete({
                where: {
                    id: req.params.id,
                },
            });

            res.send(assessment);
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
            const { id } = req.params;
            const assessment = await prisma.assessment.update({
                where: {
                    id: id,
                },
                data: req.body,
                select: assessmentFields,
            });
            res.send(assessment);
        } catch (err) {
            next(err);
        }
    }
);

module.exports = router;