import { v2 as cloudinary } from "cloudinary";

function getCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME ?? "",
    api_key: process.env.CLOUDINARY_API_KEY ?? "",
    api_secret: process.env.CLOUDINARY_API_SECRET ?? "",
  });
  return cloudinary;
}

export async function uploadVehicleImage(file: File): Promise<string> {
  const cld = getCloudinary();
  const buffer = Buffer.from(await file.arrayBuffer());

  const result = await new Promise<{ secure_url: string }>(
    (resolve, reject) => {
      cld.uploader
        .upload_stream(
          { folder: "vehicles", resource_type: "image" },
          (error, res) => {
            if (error) reject(error);
            else resolve(res as { secure_url: string });
          },
        )
        .end(buffer);
    },
  );

  return result.secure_url;
}
