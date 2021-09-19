const { auth } = require("../middlewares");

//express
const express = require("express");
const router = express.Router();

//prisma
const { PrismaClient, UserType } = require("@prisma/client");

const prisma = new PrismaClient();

const subjectFields = {
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
};

router.get("/", auth(), async(req, res, next) => {
    try {
        const subjects = await prisma.subject.findMany({
            select: subjectFields,
        });
        res.send(subjects);
    } catch (err) {
        next(err);
    }
});

router.get("/:id", auth(), async(req, res, next) => {
    try {
        const subject = await prisma.subject.findUnique({
            where: {
                id: req.params.id,
            },
            select: subjectFields,
        });
        res.send(subject);
    } catch (err) {
        next(err);
    }
});

router.post("/", auth({ type: UserType.TEACHER }), async(req, res, next) => {
    try {
        const subject = await prisma.subject.create({
            data: {
                name: req.body.name,
                yearId: req.body.yearId,
                courseId: req.body.courseId,
            },
            select: subjectFields,
        });
        res.send(subject);
    } catch (err) {
        next(err);
    }
});

router.delete(
    "/:id",
    auth({ type: UserType.TEACHER }),
    async(req, res, next) => {
        try {
            const subject = await prisma.subject.delete({
                where: {
                    id: req.params.id,
                },
            });

            res.send(subject);
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
            const subject = await prisma.subject.update({
                where: {
                    id: id,
                },
                data: req.body,
                select: subjectFields,
            });
            res.send(subject);
        } catch (err) {
            next(err);
        }
    }
);

module.exports = router;