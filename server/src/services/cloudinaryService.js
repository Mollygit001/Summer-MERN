import cloudinary from 'cloudinary';

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_KEY_SECRET
});

const generateUploadSignature = () =>{
    const timestamp = Math.floor(new Date()/ 1000);
    const signature = cloudinary.utils.api_sign_request(
        {timestamp},
        process.env.CLOUDINARY_API_KEY_SECRET
    );
    return {signature, timestamp}

}

export default generateUploadSignature;

