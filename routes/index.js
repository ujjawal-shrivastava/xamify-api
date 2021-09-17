const api = require("express").Router();

api.use("/ping", async(req, res) => {
    res.send("Pong");
});

api.use("/auth", require("./auth"));
api.use("/teachers", require("./teacher"));
api.use("/courses", require("./course"));

module.exports = api;