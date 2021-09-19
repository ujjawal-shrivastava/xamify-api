const api = require("express").Router();

api.use("/ping", async(req, res) => {
    res.send("Pong");
});

api.use("/auth", require("./auth"));
api.use("/teachers", require("./teacher"));
api.use("/students", require("./student"));
api.use("/courses", require("./course"));
api.use("/years", require("./year"));
api.use("/subjects", require("./subject"));

module.exports = api;