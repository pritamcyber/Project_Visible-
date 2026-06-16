import mongoose from "mongoose";

 const ProjectsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    images: [
        new mongoose.Schema({
            url: {
                type: String,
            },
            photoId: {
                type: String,
            },
        }, { _id: false }),
    ],  
});
export default mongoose.model("Project", ProjectsSchema);