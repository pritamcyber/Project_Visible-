

import express from "express";
import ProjectsSchema from "../schema/project_schema.js";



const project_router = express.Router();

project_router.post("/get", async (req, res) => {
    const { user } = req.body;
    if (!user ) {
        return res.status(400).json({
            message: "User ID is required",
        });
    }
    const { _id } = user;

    try {
       const projects = await ProjectsSchema.find({ userId: _id });
       console.log("Retrieved projects:");
         res.status(200).json({
             message: "Projects retrieved successfully",
             projects,
         });
        } catch (error) {

            console.error("Error retrieving projects:", error);
            res.status(500).json({
                message: "Server error",
            });
        }

});

export default project_router;
    