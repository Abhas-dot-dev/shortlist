import { ResumeStorageProvider } from './types';
import { LocalStorageProvider } from './local';
import { CloudinaryProvider } from './cloudinary';

let activeProvider: ResumeStorageProvider | null = null;

function getStorageProvider(): ResumeStorageProvider {
  if (!activeProvider) {
    const isCloudinaryConfigured = Boolean(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    );
    activeProvider = isCloudinaryConfigured
      ? new CloudinaryProvider()
      : new LocalStorageProvider();
    console.log(
      `[StorageProvider] Active Provider: ${
        isCloudinaryConfigured ? 'CloudinaryProvider' : 'LocalStorageProvider'
      }`
    );
  }
  return activeProvider;
}

export const storageProvider: ResumeStorageProvider = {
  uploadResume: (fileBuffer, fileName, mimeType) => getStorageProvider().uploadResume(fileBuffer, fileName, mimeType),
  deleteResume: (fileUrl) => getStorageProvider().deleteResume(fileUrl),
};

export * from './types';
