

import express from "express";
import { jwtVerifyRefreshToken, jwtVerifyToken } from "./jwt.js";
import { User } from "../schema/user_models_schema.js";
import multer from "multer";
import  Project from "../schema/project_schema.js";
import {uploadToCloudinary2} from "../claudinary_config/cloudinary_data.js"

// const storage = multer.diskStorage({

//   destination: (req, file, cb) => {

//     cb(null, "uploads/");

//   },

//   filename: (req, file, cb) => {

//     const uniqueName =
//       Date.now() + "-" + file.originalname;

//     cb(null, uniqueName);

//   },
// });

const storage = multer.memoryStorage(); // Store files in memory for processing before uploading to Cloudinary

const upload = multer({
   storage
});

const files_router = express.Router();

files_router.get("/protected", (req, res) => {
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
            return res.status(200).json({ message: "Access granted to protected route", user: decoded });
        } else {
            return res.status(401).json({ message: "Invalid token" });
        }
    } catch (error) {
        console.error("Error verifying token:", error);
        return res.status(500).json({ message: "Server error" });
    }
});


// files_router.post("/upload", upload.array("images"), 
// files_router.post("/upload", upload.fields([
//   {
//     name: "mainImage",
//     maxCount: 1,
//   },
//   {
//     name: "images",
//     maxCount: 20,
//   },
// ]), 

// // console.log("Received files:", req.body.userId),
//     async (req, res) => {

//     try {

//       const {
//         projectName,
//         description,
//         userId,
//         mainImage
        
//       } = req.body;

      

//       console.log("Received project data:", req.body);

      

//       const uploadedImages = await Promise.all(
//          req.files.map(async (file) => {
//          const result = await uploadToCloudinary2(file.buffer);
//          console.log("Cloudinary upload result:", result);

//          return {
//           url: result.secure_url,
//           photoId: result.public_id,
//          };
//         })
//       );

//       const mainImageUrl = mainImage || uploadedImages[0]?.url || null;
//       const otherImages = uploadedImages.filter((image) => image.url !== mainImageUrl);

//       // Convert uploaded files into schema format
//     //   const imageUrls = req.files.map((file) => {

//     //     return {

//     //       url:
//     //         `http://localhost:8080/uploads/${file.filename}`,

//     //       photoId: file.filename,
//     //     };
//     //   });

//       // Save Project
//       const newProject = await Project.create({

//         userId: userId, // or manually add userId

//         title: projectName,

//         description,

//         mainImage: mainImageUrl,

//         images: otherImages,
//       });

//       res.status(201).json({

//         success: true,

//         project: newProject,
//       });

//     } catch (error) {

//       console.log(error);

//       res.status(500).json({
//         message: "Upload failed",
//       });
//     }}
// );


files_router.post(
  "/upload",
  upload.fields([
    {
      name: "mainImage",
      maxCount: 1,
    },
    {
      name: "images",
      maxCount: 20,
    },
  ]),
  async (req, res) => {
    try {

      const {
        projectName,
        description,
        userId,
      } = req.body;

      console.log(req.files);

      // Cover Image
      const mainImageFile =
        req.files.mainImage?.[0];

      // Gallery Images
      const galleryFiles =
        req.files.images || [];

      let mainImageData = null;

      if (mainImageFile) {

        const uploadedMain =
          await uploadToCloudinary2(
            mainImageFile.buffer
          );

        mainImageData = {
          url: uploadedMain.secure_url,
          photoId:
            uploadedMain.public_id,
        };
      }

      const uploadedImages =
        await Promise.all(

          galleryFiles.map(
            async (file) => {

              const result =
                await uploadToCloudinary2(
                  file.buffer
                );

              return {
                url:
                  result.secure_url,
                photoId:
                  result.public_id,
              };
            }
          )
        );

      const newProject =
        await Project.create({

          userId,

          title: projectName,

          description,

          mainImage:
            mainImageData,

          images:
            uploadedImages,
        });

      res.status(201).json({
        success: true,
        project: newProject,
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        message:
          "Upload failed",
      });
    }
  }
);


export default files_router;