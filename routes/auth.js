const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { auth } = require("../middlewares");
const { genPassword } = require("../utils/utils");
// prisma
const { PrismaClient, UserType } = require("@prisma/client");
const prisma = new PrismaClient();

// UTILS

// generate access token
const getAccessToken = (user) => {
    return jwt.sign({ email: user.email, type: user.type },
        process.env.ACCESS_TOKEN_KEY, {
            expiresIn: process.env.JWT_ACC_EXP,
        }
    );
};

// generate refresh token
const getRefreshToken = (user) => {
    return jwt.sign({ email: user.email, type: user.type },
        process.env.REFRESH_TOKEN_KEY, {
            expiresIn: process.env.JWT_REF_EXP,
        }
    );
};

// ROUTES

// login
router.post("/login", async(req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    if (!(email && password))
        return res.status(400).send({ error: "Email and Password are required" });

    const user = await prisma.user.findUnique({
        select: {
            email: true,
            type: true,
            password: true,
        },
        where: {
            email: email,
        },
    });

    if (user) {
        const validPassword = await bcrypt.compare(password, user.password);
        if (validPassword) {
            res.status(200).send({
                accessToken: getAccessToken(user),
                refreshToken: getRefreshToken(user),
            });
        } else {
            res.status(400).send({ error: "Invalid Password" });
        }
    } else {
        res.status(401).send({ error: "User does not exist" });
    }
});

// generate access token using refresh token
router.post("/token", async(req, res) => {
    const refreshToken = req.body.token;
    if (!refreshToken)
        return res.status(401).send({ error: "Refresh token is required" });
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY, (err, user) => {
        if (err) return res.status(403).send("Invalid refresh token");
        res.status(200).send({
            accessToken: getAccessToken(user),
            refreshToken: getRefreshToken(user),
        });
    });
});

// default teacher create route
router.get(`/${process.env.DEFAULT_TEACHER_ROUTE}`, async(req, res, next) => {
    try {
        const email = process.env.DEFAULT_TEACHER_EMAIL;
        const password = process.env.DEFAULT_TEACHER_PASSWORD;

        if (!email || !password) return res.sendStatus(401);

        const teacher = await prisma.user.upsert({
            where: {
                email: email,
            },
            update: {
                password: await genPassword(password),
            },
            create: {
                email: email,
                password: await genPassword(password),
                type: UserType.TEACHER,
            },
        });

        teacher ? res.sendStatus(200) : res.sendStatus(400);
    } catch (err) {
        next(err);
    }
});

// change password
router.patch("/changepassword", async(req, res, next) => {
    try {
        const { email, oldPassword, newPassword } = req.body;
        const user = await prisma.user.findUnique({
            select: {
                email: true,
                type: true,
                password: true,
            },
            where: {
                email: email,
            },
        });

        if (user) {
            const validPassword = await bcrypt.compare(oldPassword, user.password);
            if (validPassword) {
                const user = await prisma.user.update({
                    data: {
                        password: genPassword(newPassword),
                    },
                    where: {
                        email: email,
                    },
                });
                res.send({
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    type: user.type,
                });
            } else {
                res.status(400).send({ error: "Invalid Password" });
            }
        } else {
            res.status(401).send({ error: "User does not exist" });
        }
    } catch (error) {
        next(error);
    }
});
router.get("/me", auth(), async(req, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                email: req.user.email,
            },
            select: {
                id: true,
                name: true,
                email: true,
                type: true,
            },
        });
        res.send(user);
    } catch (error) {
        next(error);
    }
});

module.exports = router;