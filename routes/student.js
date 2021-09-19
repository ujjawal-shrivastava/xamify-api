const { auth } = require("../middlewares");
const { genPassword, dateFormat } = require("../utils/utils");
//express
const express = require("express");
const router = express.Router();

//prisma
const { PrismaClient, UserType } = require("@prisma/client");

const prisma = new PrismaClient();

const studentsData = async(students) => {
    return await students.map(async(value) => {
        const { email, name, rollNo, dob, yearId, courseId } = value;
        const dateFormatted = await dateFormat(dob);
        return {
            email: email,
            name: name,
            password: await genPassword(`${rollNo}@${dateFormatted}`),
            type: UserType.STUDENT,
            profile: {
                create: {
                    rollNo: rollNo,
                    dob: dob,
                    yearId: yearId,
                    courseId: courseId,
                },
            },
        };
    });
};

const studentFields = {
    id: true,
    email: true,
    name: true,
    type: true,
    profile: {
        select: {
            rollNo: true,
            year: true,
            course: true,
        },
    },
};

router.get("/", auth({ type: UserType.TEACHER }), async(req, res, next) => {
    try {
        const students = await prisma.user.findMany({
            select: studentFields,
            where: {
                type: UserType.STUDENT,
            },
        });
        res.send(students);
    } catch (err) {
        next(err);
    }
});

router.get("/:id", auth({ type: UserType.TEACHER }), async(req, res, next) => {
    try {
        const student = await prisma.user.findUnique({
            where: {
                id: req.params.id,
            },
            select: studentFields,
        });

        student && student.type == UserType.STUDENT ?
            res.send(student) :
            res.status(404).send({ error: "Student not found" });
    } catch (err) {
        next(err);
    }
});

router.post("/", auth({ type: UserType.TEACHER }), async(req, res, next) => {
    try {
        const { email, name, rollNo, dob, yearId, courseId } = req.body;
        const dateFormatted = await dateFormat(dob);
        const student = await prisma.user.create({
            data: {
                email: email,
                name: name,
                password: await genPassword(`${rollNo}@${dateFormatted}`),
                type: UserType.STUDENT,
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
    auth({ type: UserType.TEACHER }),
    async(req, res, next) => {
        try {
            const data = await studentsData(req.body.students);
            var students = [];
            await prisma.$transaction(async(prisma) => {
                for (let i = 0; i < data.length; i++) {
                    const studentData = await data[i];
                    const student = await prisma.user.create({
                        data: studentData,
                        select: studentFields,
                    });
                    students.push(student);
                }
            });
            res.send(students);
        } catch (err) {
            next(err);
        }
    }
);

router.delete(
    "/:id",
    auth({ type: UserType.TEACHER }),
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
    auth({ type: UserType.TEACHER }),
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