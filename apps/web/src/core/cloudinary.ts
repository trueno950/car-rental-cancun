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

/**
 * Extracts the Cloudinary public_id from a secure_url.
 * e.g. https://res.cloudinary.com/demo/image/upload/v123/vehicles/abc.jpg → vehicles/abc
 */
export function extractCloudinaryPublicId(url: string): string | null {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(\.[^./]+)?$/);
  return match?.[1] ?? null;
}

export async function deleteVehicleImage(publicId: string): Promise<void> {
  const cld = getCloudinary();
  await cld.uploader.destroy(publicId);
}
