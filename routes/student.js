const { auth } = require("../middlewares");
const { genPassword, dateFormat } = require("../utils/utils");
const { userType } = require("../utils/types");

//express
const express = require("express");
const router = express.Router();

//prisma
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const studentFields = {
    id: true,
    email: true,
    name: true,
    type: true,
    profile: true,
};

router.get("/", auth({ type: userType.teacher }), async(req, res, next) => {
    try {
        const students = await prisma.user.findMany({
            select: studentFields,
            where: {
                type: userType.student,
            },
        });
        res.send(students);
    } catch (err) {
        next(err);
    }
});

router.get("/:id", auth({ type: userType.teacher }), async(req, res, next) => {
    try {
        const student = await prisma.user.findUnique({
            where: {
                id: req.params.id,
            },
            select: studentFields,
        });

        student && student.type == userType.student ?
            res.send(student) :
            res.status(404).send({ error: "Student not found" });
    } catch (err) {
        next(err);
    }
});

router.post("/", auth({ type: userType.teacher }), async(req, res, next) => {
    try {
        const { email, name, rollNo, dob, yearId, courseId } = req.body;
        const dateFormatted = await dateFormat(dob);
        const student = await prisma.user.create({
            data: {
                email: email,
                name: name,
                password: await genPassword(`${rollNo}@${dateFormatted}`),
                type: userType.student,
                profile: {
                    create: {
                        rollNo: rollNo,
                        dob: dob,
                        yearId: yearId,
                        courseId: courseId,
                    },
                },
            },
            select: studentFields,
        });
        res.send(student);
    } catch (err) {
        next(err);
    }
});

router.post(
    "/bulk",
    auth({ type: userType.teacher }),
    async(req, res, next) => {
        try {
            const { email, name, rollNo, dob, yearId, courseId } = req.body;
            const dateFormatted = await dateFormat(dob);
            const students = await prisma.user.createMany({
                skipDuplicates: true,
                data: {},
            });
            res.send(students);
        } catch (err) {
            next(err);
        }
    }
);

router.delete(
    "/:id",
    auth({ type: userType.teacher }),
    async(req, res, next) => {
        try {
            const student = await prisma.user.delete({
                where: {
                    id: req.params.id,
                },
                select: studentFields,
            });

            res.send(student);
        } catch (err) {
            next(err);
        }
    }
);

router.patch(
    "/:id",
    auth({ type: userType.teacher }),
    async(req, res, next) => {
        try {
            const { id } = req.params;
            const student = await prisma.user.update({
                where: {
                    id: id,
                },
                data: req.body,
                select: studentFields,
            });
            res.send(student);
        } catch (err) {
            next(err);
        }
    }
);

module.exports = router;