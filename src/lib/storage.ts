import { v2 as cloudinary } from "cloudinary";

function configure() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

/**
 * Upload a File to Cloudinary and return the secure URL.
 */
export async function uploadImage(
  file: File,
  topicId: string
): Promise<string> {
  configure();

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64 = buffer.toString("base64");
  const dataUri = `data:${file.type};base64,${base64}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: `rankme/${topicId}`,
    resource_type: "image",
  });

  return result.secure_url;
}

/**
 * Delete an image from Cloudinary by its URL.
 * Cloudinary public_id is the path without extension after the cloud name.
 */
export async function deleteImage(url: string): Promise<void> {
  configure();

  // Extract public_id from URL:
  // https://res.cloudinary.com/<cloud>/image/upload/v123/rankme/<topicId>/<file>.jpg
  const match = url.match(/\/image\/upload\/(?:v\d+\/)?(.+)\.[a-z]+$/i);
  if (!match) return;
  const publicId = match[1];

  await cloudinary.uploader.destroy(publicId);
}
