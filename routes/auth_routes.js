

import mongoose from "mongoose";
import express from "express";

import dotenv from "dotenv";
dotenv.config();
import bcrypt from "bcrypt";
const saltRounds = 10; // higher = more secure but slower


import admin from "../FireBase_config/FireBase_config.js";

import { User } from "../schema/user_models_schema.js";
import { jwtGenerateRefreshToken, jwtGeneratorToken, jwtVerifyToken ,jwtVerifyRefreshToken} from "./jwt.js";

// import  from "./jwt.js";

// import jwtVerifyToken from "./jwt.js";
// import jwtGeneratorToken from "./jwt.js";

// import jwt from "jsonwebtoken";
// import { JsonWebTokenError } from "jsonwebtoken";


const auth_router = express.Router();


auth_router.post("/register", async (req, res) => {
    if (!req.body) {
        return res.status(400).json({
            message: "Request body is required",
        });
    }
    else{
        console.log("Received registration request with body:", req.body);
    }
    const { username, email, password } = req.body;s
    console.log("Received registration data:", { username, email, password });
    
    try {
        if (!username || !email || !password) {
            throw new Error("Missing required fields");
        }
    
    }
catch (error) {

        console.error("Error validating user input:", error);
        return res.status(500).json({
            message: "Server error",
        });
    }

    try {
        const existingUser = await User.findOne({
            email: email,
        });
        if (existingUser) {
            return res.status(400).json({
                message: "User already exists",
            });
        }
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        console.log("Hashed password:", hashedPassword);
        const newUser = new User({
            username,
            email,
                password: hashedPassword,
                createdAt: new Date(),
        });
        console.log("3", newUser);

        await newUser.save();
        console.log("4", newUser);

        const token = jwtGeneratorToken(newUser);
        const refreshToken = jwtGenerateRefreshToken(newUser);
        res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true, maxAge: 3600000 });
        res.status(201).json({
            message: "User registered successfully",
            user: newUser,
            token,
            
        });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({
            message: "Server error",
        });
    }
});



auth_router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    console.log("Received login data:", { email, password });
    try {
        if (!email || !password) {
            throw new Error("Missing required fields");
        }
    } catch (error) {
        console.error("Error validating user input:", error);
        return res.status(500).json({
            message: "please provide email and password",
        });
    }

    try {
        const user = await User.findOne
            ({
                email: email,
            });
        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password",
            });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({
                message: "Invalid email or password",
            });
        }
        const accessToken = jwtGeneratorToken(user);
        const refreshToken = jwtGenerateRefreshToken(user);

        res.cookie("refresh_Token", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 3600000,
        });

        const userData = {
            id: user._id,
            username: user.username,
            email: user.email,
            provider: 'Email',
        };

        res.status(200).json({
            message: "Login successful",
            user: userData,
            accessToken,
            

        });
        } catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).json({
            message: "Server error",
        });
    }
});


auth_router.post("/logout", async (req, res) => {
    res.clearCookie("refresh_Token");
    res.status(200).json({
        message: "Logout successful",
    });
});


auth_router.post("/verify-refreshToken", async (req, res) => {
    const refreshToken = req.cookies.refresh_Token;
    if (!refreshToken) {
        return res.status(401).json({
            message: "No refresh token provided",
            valid: false,
        });
    }
    try {
        const decoded = jwtVerifyRefreshToken(refreshToken);
        if (!decoded) {
            return res.status(401).json({
                message: "Invalid refresh token",
                valid: false,

            });
        }
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                valid: false,
            });
        }
        const newAccessToken = jwtGeneratorToken(user);
        const newRefreshToken = jwtGenerateRefreshToken(user);
        res.cookie("refresh_Token", newRefreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 3600000,
        });

        res.status(200).json({
            accessToken: newAccessToken,
            message: "Refresh token is valid",
            accessToken: newAccessToken,
            user: decoded,
            valid: true,


        });
    } catch (error) {
        console.error("Error refreshing token:", error);
        res.status(500).json({
            message: "Server error",
            valid: false,
            accessToken: null,
            user: null,
        });
    }
});


auth_router.post("/verify-token", async (req, res) => {
    const token = req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : req.body?.token;
    if (!token) {
        return res.status(400).json({
            message: "Token is required",
            valid: false,
        });
    }
    try {
        const decoded = jwtVerifyToken(token);
        if (!decoded) {
            return res.status(401).json({
                message: "Invalid token",
                valid: false,
            });
        }
        res.status(200).json({
            message: "Token is valid",
            user: decoded,
            valid: true,
        });
    } catch (error) {
        console.error("Error verifying token:", error);
        res.status(500).json({

            message: "Server error",
            valid: false,
        });
    }
});







auth_router.post("/google", 
    async (req, res) => {

    try {

      const { firebaseToken} = req.body;

      const decoded = await admin.auth().verifyIdToken(firebaseToken);

        const {
            uid,
            email,
            name,
            picture
            } = decoded;


        let user = await User.findOne({
            email: email,
        });
        if (!user) {
            user = new User({
                username: name,
                email: email,
                
                profileImage: picture,
                provider: "google",
                firebaseUid: uid,
            });
            await user.save();
        }

      console.log(decoded);
      console.log("Decoded token:", user);
      const token = jwtGeneratorToken(user);
         const refreshToken = jwtGenerateRefreshToken(user);
        // res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true, maxAge: 3600000 });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });


      res.status(200).json({
            success: true,
            user,
            accessToken: token,
        });

    } catch (error) {

      console.log(error);

      res.status(401).json({
        success: false,
        message:
          "Invalid Firebase Token",
      });
    }
  }
);


export default auth_router;