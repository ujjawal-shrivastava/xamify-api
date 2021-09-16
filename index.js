require("dotenv").config();
const { userType } = require("./utils");
const bcrypt = require("bcrypt");
const auth = require("./middlewares/auth");
// express
const express = require("express");
const app = express();
app.use(express.json());

// prisma
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// routes
const routes = require("./routes");

app.get("/", async(req, res) => {
    const allUsers = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            name: true,
            type: true,
        },
    });
    res.send(allUsers);
});

app.get("/protected", auth({ type: userType.teacher }), async(req, res) => {
    const allUsers = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            name: true,
            type: true,
        },
    });
    res.send(allUsers);
});

// auth routes
app.use("/auth", routes.auth);

PORT = process.env.PORT || 8000;

module.exports = app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});