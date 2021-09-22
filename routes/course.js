const { auth } = require("../middlewares");

//express
const express = require("express");
const router = express.Router();

//prisma
const { PrismaClient, UserType } = require("@prisma/client");

const prisma = new PrismaClient();

router.get("/", auth(), async(req, res, next) => {
    try {
        const courses = await prisma.course.findMany({});
        res.send(courses);
    } catch (err) {
        next(err);
    }
});

router.get("/:id", auth(), async(req, res, next) => {
    try {
        const course = await prisma.course.findUnique({
            where: {
                id: req.params.id,
            },
        });
        res.send(course);
    } catch (err) {
        next(err);
    }
});

router.get("/subjects/all", auth(), async(req, res, next) => {
    try {
        const [courses, subjects, years] = await prisma.$transaction([
            prisma.course.findMany({
                select: { id: true, name: true },
            }),
            prisma.subject.findMany({
                select: { id: true, name: true, yearId: true, courseId: true },
            }),
            prisma.year.findMany({
                select: { id: true, label: true },
            }),
        ]);
        var result = [];
        courses.forEach((course) => {
            const c = {...course, years: [] };
            years.forEach((year) => {
                const s = subjects.filter(
                    (subject) =>
                    subject.yearId == year.id && subject.courseId == course.id
                );
                const y = {...year, subjects: s };
                c.years.push(y);
            });
            result.push(c);
        });
        res.send(result);
    } catch (error) {
        next(error);
    }
});

router.post("/", auth({ type: UserType.TEACHER }), async(req, res, next) => {
    try {
        const course = await prisma.course.create({
            data: {
                name: req.body.name,
            },
        });
        res.send(course);
    } catch (err) {
        next(err);
    }
});

router.delete(
    "/:id",
    auth({ type: UserType.TEACHER }),
    async(req, res, next) => {
        try {
            const course = await prisma.course.delete({
                where: {
                    id: req.params.id,
                },
            });

            res.send(course);
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
            const course = await prisma.course.update({
                where: {
                    id: id,
                },
                data: req.body,
            });
            res.send(course);
        } catch (err) {
            next(err);
        }
    }
);

module.exports = router;