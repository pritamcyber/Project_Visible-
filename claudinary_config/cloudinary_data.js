
import cloudinary from "./Cloudinary_config.js";
import streamifier from "streamifier";



// export const uploadToCloudinary = async (filePath, publicId) => {
//     try {
//         const result = await cloudinary.uploader.upload(filePath, {
//             public_id: publicId,
//             resource_type: 'auto',
//             overwrite: true,
//   transformation: [
//     { width: 600, height: 600, crop: 'fill', gravity: 'auto' },
//     { quality: 'auto' },
//     { fetch_format: 'auto' }
//   ]
//         });
//         return result;
//     } catch (error) {
//         console.error("Error uploading to Cloudinary:", error);
//         throw error;
//     }
// };

// export const deleteFromCloudinary = async (publicId) => {
//     try {
//         const result = await cloudinary.uploader.destroy(publicId);
//         return result;
//     } catch (error) {
//         console.error("Error deleting from Cloudinary:", error);
//         throw error;
//     }
// };



export const uploadToCloudinary2 = (buffer) => {

   return new Promise((resolve, reject) => {

      const stream =
         cloudinary.uploader.upload_stream(

            {
               folder: "projects",
            },

            (error, result) => {

               if (result) {

                  resolve(result);

               } else {

                  reject(error);
               }
            }
         );

      streamifier
         .createReadStream(buffer)
         .pipe(stream);
   });
};