const jwt = require("jsonwebtoken");

const auth = (options = {}) => {
    return (req, res, next) => {
        const authHeader = req.headers["authorization"];
        if (!authHeader)
            return res
                .status(401)
                .send({ error: "No authorization header provided" });
        const [prefix, token] = authHeader.split(" ");
        if (prefix != process.env.AUTH_TOKEN_PREFIX || !token)
            return res.status(401).send({ error: "Invalid authorization header" });

        jwt.verify(token, process.env.ACCESS_TOKEN_KEY, (err, user) => {
            if (err)
                return res.status(403).send({ error: "Token expired or invalid" });
            if (options.type && options.type != user.type)
                return res.status(403).send({
                    error: `${user.type} is not authorized to access this route`,
                });

            req.user = { email: user.email, type: user.type };
            next();
        });
    };
};

module.exports = auth;