import fs from 'fs';
import cloudinary from '../config/cloudinary';
import { env } from '../config/env';

export interface UploadedFileResult {
  url: string;
  publicId?: string;
}

/**
 * Takes a locally-saved multer file and returns a public URL.
 * If Cloudinary credentials are configured, the file is pushed there and removed locally.
 * Otherwise, it is served directly from /uploads via the static file route.
 */
export const processUploadedFile = async (
  file: Express.Multer.File,
  baseUrl: string
): Promise<UploadedFileResult> => {
  if (env.useCloudinary) {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'ecommerce',
      resource_type: 'auto',
    });
    fs.unlink(file.path, () => undefined);
    return { url: result.secure_url, publicId: result.public_id };
  }

  return { url: `${baseUrl}/uploads/${file.filename}` };
};

export const deleteUploadedFile = async (publicId?: string, localFilename?: string): Promise<void> => {
  if (env.useCloudinary && publicId) {
    await cloudinary.uploader.destroy(publicId);
  } else if (localFilename) {
    const filePath = `${__dirname}/../../uploads/${localFilename}`;
    fs.unlink(filePath, () => undefined);
  }
};
