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
        const years = await prisma.year.findMany({});
        res.send(years);
    } catch (err) {
        next(err);
    }
});

router.get("/:id", auth({ type: userType.teacher }), async(req, res, next) => {
    try {
        const year = await prisma.year.findUnique({
            where: {
                id: req.params.id,
            },
        });
        res.send(year);
    } catch (err) {
        next(err);
    }
});

router.post("/", auth({ type: userType.teacher }), async(req, res, next) => {
    try {
        const year = await prisma.year.create({
            data: {
                label: req.body.label,
            },
        });
        res.send(year);
    } catch (err) {
        next(err);
    }
});

router.delete(
    "/:id",
    auth({ type: userType.teacher }),
    async(req, res, next) => {
        try {
            const year = await prisma.year.delete({
                where: {
                    id: req.params.id,
                },
            });

            res.send(year);
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
            const year = await prisma.year.update({
                where: {
                    id: id,
                },
                data: req.body,
            });
            res.send(year);
        } catch (err) {
            next(err);
        }
    }
);

module.exports = router;