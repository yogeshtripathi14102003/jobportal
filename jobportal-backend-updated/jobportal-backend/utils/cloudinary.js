import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Buffer → Cloudinary upload (stream-based, no disk write)
 * @param {Buffer} buffer
 * @param {object} options  — folder, public_id, resource_type etc.
 */
export const uploadToCloudinary = (buffer, options = {}) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "hrms", resource_type: "auto", ...options },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    Readable.from(buffer).pipe(uploadStream);
  });

export const deleteFromCloudinary = (publicId) =>
  cloudinary.uploader.destroy(publicId);

export default cloudinary;