const { auth } = require("../middlewares");
const { genPassword } = require("../utils/utils");
//express
const express = require("express");
const router = express.Router();

//prisma
const { PrismaClient, UserType } = require("@prisma/client");

const prisma = new PrismaClient();

const teacherFields = {
    id: true,
    email: true,
    name: true,
    type: true,
};

router.get("/", auth({ type: UserType.TEACHER }), async(req, res, next) => {
    try {
        const teachers = await prisma.user.findMany({
            select: teacherFields,
            where: {
                type: UserType.TEACHER,
            },
        });
        res.send(teachers);
    } catch (err) {
        next(err);
    }
});

router.get("/:id", auth({ type: UserType.TEACHER }), async(req, res, next) => {
    try {
        const teacher = await prisma.user.findUnique({
            where: {
                id: req.params.id,
            },
            select: teacherFields,
        });

        teacher && teacher.type == UserType.TEACHER ?
            res.send(teacher) :
            res.status(404).send({ error: "Teacher not found" });
    } catch (err) {
        next(err);
    }
});

router.post("/", auth({ type: UserType.TEACHER }), async(req, res, next) => {
    try {
        const teacher = await prisma.user.create({
            data: {
                email: req.body.email,
                password: await genPassword(req.body.password),
                type: UserType.TEACHER,
            },
            select: teacherFields,
        });
        res.send(teacher);
    } catch (err) {
        next(err);
    }
});

router.delete(
    "/:id",
    auth({ type: UserType.TEACHER }),
    async(req, res, next) => {
        try {
            const teacher = await prisma.user.delete({
                where: {
                    id: req.params.id,
                },
                select: teacherFields,
            });

            res.send(teacher);
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
            const teacher = await prisma.user.update({
                where: {
                    id: id,
                },
                data: {
                    email: req.body.email,
                    name: req.body.name,
                },
                select: teacherFields,
            });
            res.send(teacher);
        } catch (err) {
            next(err);
        }
    }
);

module.exports = router;