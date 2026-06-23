// including authentication and rate limiting
const jwt = require("jsonwebtoken");


const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if(
            !authHeader ||
            !authHeader.startsWith("Bearer ")
        ) {
            return res.status(401).json({
                error: "Access denied. No token provided."
            });
        }

        const token = authHeader.split(" ")[1];
            // removes bearer and takes just the token

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );
            // verify the token

        req.user = decoded;
            // attach the user data

        next();
    } catch (err) {
        return res.status(401).json({
            error: "Invalid or expired token"
        });
    }
};

module.exports = authMiddleware;