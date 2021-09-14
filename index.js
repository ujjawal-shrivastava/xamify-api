const { userType } = require("./utils");

// express
const express = require("express");
const app = express();
app.use(express.json());

// prisma
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

app.get("/", async(req, res) => {
    const allUsers = await prisma.user.findMany();
    res.send(allUsers);
});

app.get("/create/:name", async(req, res) => {
    const { name } = req.params;
    const user = await prisma.user.create({
        data: {
            name: name,
            email: `${name}@test.com`,
            type: userType.teacher,
        },
    });
    res.send(user);
});

PORT = process.env.PORT || 8000;

const server = app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});