const api = require("express").Router();

api.use("/auth", require("./auth"));
api.use("/teachers", require("./teacher"));

module.exports = api;