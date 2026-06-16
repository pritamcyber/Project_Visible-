


import express, { application } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cookiesParser from "cookie-parser";
import multer from "multer";
import  project_router from "./routes/project_route.js";

// import morgan from "morgan";
dotenv.config();

import auth_router from "./routes/auth_routes.js";

import {User} from "./schema/user_models_schema.js";
import {connectDB} from "./database/db.js";
import { jwtVerifyRefreshToken, jwtVerifyToken } from "./routes/jwt.js";
import files_router from "./routes/Files_hanndles.js";

connectDB();

const app = express();





// Allow requests from any origin and include credentials (cookies)
app.use(cors({
    origin: "http://localhost:5177",
    credentials: true,
}));
app.use(cookiesParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));
app.use("/api/files", files_router);
app.use("/api/projects", project_router);


// app.use(morgan("dev"));

app.get("/", (req, res) => {
    res.send("Hello world");

})

app.use("/api/auth", auth_router);

app.get("/api/protected", (req, res) => {
    // Get token from Authorization header or cookie
    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies && req.cookies.refreshToken;

    console.log("Auth header:", authHeader);
    console.log("Cookie token:", cookieToken);
    let token;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
    } else if (cookieToken) {
        token = cookieToken;
    }
console.log("Token to verify:", token);
    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    try {
        const decoded = jwtVerifyToken(token, res);
        if (decoded != null) {

            console.log("Decoded token:", decoded);
        } else {
            console.log("Token verification failed");
            const refresh_token =  req.cookies.refreshToken; // Clear the refresh token cookie
            const refreshDecoded = jwtVerifyRefreshToken(refresh_token);
            if (refreshDecoded) {
                console.log("Refresh token is valid");
                console.log("Decoded refresh token:", refreshDecoded);
                const user = User.findById(refreshDecoded.id, (err, user) => {
                    if (err) {
                        console.error("Error finding user:", err);
                        return res.status(500).json({ message: "Server error" });
                    }
                    if (!user) {
                        return res.status(404).json({ message: "User not found" });
                    }
                    
                    // console.log("User from refresh token:", user);
                })} else {
                throw new Error("Invalid token");
            }
        }
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
    return res.json({ message: "This is a protected route" });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
});
