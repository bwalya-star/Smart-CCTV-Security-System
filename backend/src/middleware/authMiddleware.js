const jwt = require("jsonwebtoken");


function authenticateToken(req, res, next) {

    try {

        const authHeader = req.headers.authorization;

        if (!authHeader) {

            return res.status(401).json({
                error: "Access token required"
            });

        }

        const parts = authHeader.split(" ");

        if (
            parts.length !== 2 ||
            parts[0] !== "Bearer"
        ) {

            return res.status(401).json({
                error: "Invalid authorization format"
            });

        }

        const token = parts[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = decoded;

        console.log(
            "Authenticated user:",
            req.user
        );

        next();

    } catch (error) {

        console.error(
            "Authentication error:",
            error.message
        );

        return res.status(403).json({
            error: "Invalid or expired token"
        });

    }
}


module.exports = {
    authenticateToken
};