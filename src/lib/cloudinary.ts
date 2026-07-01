import { v2 as cloudinary } from 'cloudinary';

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || '';
const apiKey = process.env.CLOUDINARY_API_KEY || '';
const apiSecret = process.env.CLOUDINARY_API_SECRET || '';

export const isCloudinaryConfigured = Boolean(cloudName && apiKey && apiSecret);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
} else {
  console.warn(
    'Cloudinary credentials are missing. File uploads will return demo URLs.'
  );
}

/**
 * Uploads a file buffer directly to Cloudinary
 */
export async function uploadToCloudinary(fileBuffer: Buffer, fileName: string): Promise<string> {
  if (!isCloudinaryConfigured) {
    console.log('Cloudinary not configured. Returning local demo URL...');
    return `/uploads/demo_${Date.now()}_${fileName}`;
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'resume_shortlister_resumes',
        resource_type: 'raw', // Support raw PDF and DOCX documents
        public_id: `${Date.now()}_${fileName.replace(/\s+/g, '_')}`,
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload stream error:', error);
          reject(new Error(error.message || 'Cloudinary upload failed'));
        } else {
          resolve(result?.secure_url || '');
        }
      }
    );
    
    uploadStream.end(fileBuffer);
  });
}

/**
 * Deletes a file from Cloudinary given its secure URL
 */
export async function deleteFromCloudinary(fileUrl: string): Promise<boolean> {
  if (!isCloudinaryConfigured || !fileUrl.includes('res.cloudinary.com')) {
    return true;
  }

  try {
    // Extract public ID from URL
    // Format: .../raw/upload/v12345/resume_shortlister_resumes/filename.pdf
    const parts = fileUrl.split('/resume_shortlister_resumes/');
    if (parts.length < 2) return false;
    
    const publicId = `resume_shortlister_resumes/${parts[1]}`;

    return new Promise((resolve) => {
      cloudinary.uploader.destroy(
        publicId,
        { resource_type: 'raw' },
        (error, result) => {
          if (error) {
            console.error('Cloudinary destroy error:', error);
            resolve(false);
          } else {
            resolve(result?.result === 'ok');
          }
        }
      );
    });
  } catch (err) {
    console.error('Failed to delete asset from Cloudinary:', err);
    return false;
  }
}
