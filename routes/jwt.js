
import jwt from "jsonwebtoken";


// const jwt  =  JsonWebTokenError
export const jwtErrorHandler = (err, req, res, next) => {
    if (err instanceof JsonWebTokenError) {
        return res.status(401).json({
            message: "Invalid token",
        });
    }
    next(err);
};


export const jwtGetUserFromToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "No token provided",
        });
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({
            message: "Invalid token",
        });
    }
};


export const jwtGeneratorToken = (user) => {
    const payload = {
        id: user._id,
        username: user.username,
        email: user.email,
    };
    // expiresIn as seconds (1 hour)
    return jwt.sign(payload, process.env.JWT_SECRET || process.env.SECRET_KEY, { expiresIn: 3600 });
};


export const jwtVerifyToken = (token,res) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET || process.env.SECRET_KEY);
    } catch (err) {
        console.error("Token verification error:", err);
        return null;
        // res.status(401).json({
        //     message: "Invalid token",
        // });

    }
};


export const jwtVerifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
        console.error("Refresh token verification error:", err);
        throw new JsonWebTokenError("Invalid refresh token");
    }
};

export const jwtGenerateRefreshToken = (user) => {
    const payload = {
        id: user._id,
        username: user.username,
        email: user.email,
    };
    // refresh token expires in 7 days (in seconds)
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: 7 * 24 * 60 * 60 });
};




export const jwtRefreshToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || process.env.SECRET_KEY);
        const newToken = jwt.sign(
            {
                id: decoded.id,
                username: decoded.username,
                email: decoded.email,
            },
            process.env.JWT_SECRET || process.env.SECRET_KEY,
            { expiresIn: 3600 }
        );
        return newToken;
    } catch (err) {
        throw new JsonWebTokenError("Invalid token");
    }
};

