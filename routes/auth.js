const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// prisma
const { PrismaClient } = require("@prisma/client");
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

module.exports = router;