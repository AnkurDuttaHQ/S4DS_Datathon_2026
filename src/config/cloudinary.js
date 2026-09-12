import "dotenv/config";

import { v2 as cloudinary } from "cloudinary";

console.log("========== CLOUDINARY DEBUG ==========");
console.log("Cloud name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log(
  "API key:",
  process.env.CLOUDINARY_API_KEY ? "LOADED" : "MISSING"
);
console.log(
  "API secret:",
  process.env.CLOUDINARY_API_SECRET ? "LOADED" : "MISSING"
);
console.log("======================================");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export default cloudinary;