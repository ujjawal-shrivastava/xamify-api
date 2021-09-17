require("dotenv").config();

// express
const express = require("express");
const app = express();
app.use(express.json());

// routes
app.use("/api", require("./routes"));

app.use("/ping", async(req, res) => {
    res.send("Pong");
});

// error handler
app.use(async(err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }
    res
        .status(err.status || 500)
        .send({ error: err.message || "Some error occured" });
});

PORT = process.env.PORT || 8000;

module.exports = app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});