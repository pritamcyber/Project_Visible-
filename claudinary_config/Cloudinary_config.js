

// import { v2 as cloudinaryy } from 'cloudinary';

import dotenv from "dotenv";
dotenv.config();




// (async function() {

    // Configuration
//   const cloudinary =   cloudinaryy.config({ 
//         cloud_name: process.env.CLOUD_NAME, 
//         api_key: process.env.CLOUD_API_KEY, 
//         api_secret: process.env.CLOUD_API_SECRET // Click 'View API Keys' above to copy your API secret
//     });
    
// export default cloudinary;







import { v2 as cloudinary } from "cloudinary";

cloudinary.config({

   cloud_name: process.env.CLOUD_NAME,

   api_key: process.env.CLOUD_API_KEY,

   api_secret: process.env.CLOUD_API_SECRET,
});



export default cloudinary;




    // // Upload an image
    //  const uploadResult = await cloudinary.uploader
    //    .upload(
    //        'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', {
    //            public_id: 'sharma/projects',
    //        }
    //    )
    //    .catch((error) => {
    //        console.log(error);
    //    });
    
    // console.log(uploadResult);
    
    // // Optimize delivery by resizing and applying auto-format and auto-quality
    // const optimizeUrl = cloudinary.url('sharma/projects', {
    //     fetch_format: 'auto',
    //     quality: 'auto'
    // });
    
    // console.log(optimizeUrl);
    
    // // Transform the image: auto-crop to square aspect_ratio
    // const autoCropUrl = cloudinary.url('sharma/projects', {
    //     crop: 'auto',
    //     gravity: 'auto',
    //     width: 500,
    //     height: 500,
    // });
    
    // console.log(autoCropUrl);    
// })();

