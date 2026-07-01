import { v2 as cloudinary } from 'cloudinary';
import { ResumeStorageProvider } from './types';

export class CloudinaryProvider implements ResumeStorageProvider {
  constructor() {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || '';
    const apiKey = process.env.CLOUDINARY_API_KEY || '';
    const apiSecret = process.env.CLOUDINARY_API_SECRET || '';

    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });
    }
  }

  async uploadResume(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string> {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    if (!cloudName) {
      throw new Error('Cloudinary is not configured. Please set Cloudinary environment variables.');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'resume_shortlister_resumes',
          resource_type: 'raw',
          public_id: `${Date.now()}_${fileName.replace(/\s+/g, '_')}`,
        },
        (error, result) => {
          if (error) {
            console.error('[CloudinaryProvider] Upload Stream Error:', error);
            reject(new Error(error.message || `Cloudinary upload failed: ${JSON.stringify(error)}`));
          } else {
            resolve(result?.secure_url || '');
          }
        }
      );
      
      uploadStream.end(fileBuffer);
    });
  }

  async deleteResume(fileUrl: string): Promise<boolean> {
    if (!fileUrl.includes('res.cloudinary.com')) return true;

    try {
      const parts = fileUrl.split('/resume_shortlister_resumes/');
      if (parts.length < 2) return false;
      
      const publicId = `resume_shortlister_resumes/${parts[1]}`;

      return new Promise((resolve) => {
        cloudinary.uploader.destroy(
          publicId,
          { resource_type: 'raw' },
          (error, result) => {
            if (error) {
              resolve(false);
            } else {
              resolve(result?.result === 'ok');
            }
          }
        );
      });
    } catch (err) {
      return false;
    }
  }
}
