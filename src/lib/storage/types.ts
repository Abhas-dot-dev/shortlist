export interface ResumeStorageProvider {
  uploadResume(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string>;
  deleteResume(fileUrl: string): Promise<boolean>;
}
