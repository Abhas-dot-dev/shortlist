import mammoth from 'mammoth';

// Clean unnecessary whitespace and remove duplicate lines
function cleanText(text: string): string {
  const lines = text.split('\n');
  const seen = new Set<string>();
  const cleanedLines: string[] = [];

  for (const line of lines) {
    const cleanedLine = line.trim().replace(/\s+/g, ' ');
    if (!cleanedLine) continue;

    if (!seen.has(cleanedLine)) {
      seen.add(cleanedLine);
      cleanedLines.push(cleanedLine);
    }
  }

  return cleanedLines.join('\n');
}

async function parsePdf(fileBuffer: Buffer): Promise<string> {
  try {
    if (typeof global !== 'undefined' && !(global as any).DOMMatrix) {
      (global as any).DOMMatrix = class DOMMatrix {};
    }
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdf = require('pdf-parse');
    
    if (pdf && pdf.PDFParse) {
      const parser = new pdf.PDFParse({ data: fileBuffer });
      const data = await parser.getText();
      return cleanText(data.text || '');
    } else {
      const parseFn = typeof pdf === 'function' ? pdf : (pdf.default || pdf);
      const data = await parseFn(fileBuffer);
      return cleanText(data.text || '');
    }
  } catch (error: any) {
    console.error('pdf-parse error:', error);
    throw new Error('Failed to parse PDF document: ' + error.message);
  }
}

async function parseDocx(fileBuffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    return cleanText(result.value || '');
  } catch (error: any) {
    console.error('mammoth parsing error:', error);
    throw new Error('Failed to parse DOCX document: ' + error.message);
  }
}

/**
 * Extracts cleaned plain text from PDF or DOCX file buffers
 */
export async function parseResume(fileBuffer: Buffer, mimeType: string): Promise<string> {
  if (mimeType === 'application/pdf') {
    return await parsePdf(fileBuffer);
  }
  
  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
    mimeType === 'application/msword'
  ) {
    return await parseDocx(fileBuffer);
  }

  throw new Error('Unsupported mime type: ' + mimeType + '. Only PDF and DOCX files are supported.');
}
