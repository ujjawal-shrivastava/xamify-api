const { auth } = require("../middlewares");
const { userType } = require("../utils/types");

//express
const express = require("express");
const router = express.Router();

//prisma
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

router.get("/", auth({ type: userType.teacher }), async(req, res, next) => {
    try {
        const courses = await prisma.course.findMany({});
        res.send(courses);
    } catch (err) {
        next(err);
    }
});

router.get("/:id", auth({ type: userType.teacher }), async(req, res, next) => {
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

router.post("/", auth({ type: userType.teacher }), async(req, res, next) => {
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
    auth({ type: userType.teacher }),
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
    auth({ type: userType.teacher }),
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