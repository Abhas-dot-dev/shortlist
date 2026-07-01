import { ResumeStorageProvider } from './types';
import { LocalStorageProvider } from './local';
import { CloudinaryProvider } from './cloudinary';

const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

export const storageProvider: ResumeStorageProvider = isCloudinaryConfigured
  ? new CloudinaryProvider()
  : new LocalStorageProvider();

console.log(
  `[StorageProvider] Active Provider: ${
    isCloudinaryConfigured ? 'CloudinaryProvider' : 'LocalStorageProvider'
  }`
);
export * from './types';
