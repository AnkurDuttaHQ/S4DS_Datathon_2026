import cloudinary from "../config/cloudinary.js";

export const uploadToCloudinary = (
  buffer,
  folder,
  resourceType = "auto"
) => {
  return new Promise((resolve, reject) => {
    const uploadStream =
      cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: resourceType,
        },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }

          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            resourceType: result.resource_type,
            format: result.format,
          });
        }
      );

    uploadStream.end(buffer);
  });
};