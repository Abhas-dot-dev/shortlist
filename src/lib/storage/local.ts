import { ResumeStorageProvider } from './types';

export class LocalStorageProvider implements ResumeStorageProvider {
  async uploadResume(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string> {
    console.log(`[LocalStorageProvider] Temporarily uploading ${fileName} (${fileBuffer.length} bytes)`);
    
    // Generate an inline Data URI so the file can be accessed/previewed in browser
    const base64Data = fileBuffer.toString('base64');
    return `data:${mimeType};base64,${base64Data}`;
  }

  async deleteResume(fileUrl: string): Promise<boolean> {
    console.log(`[LocalStorageProvider] Deleting mock file link: ${fileUrl.substring(0, 50)}...`);
    return true;
  }
}
