import fs from 'fs';
import mammoth from 'mammoth';
import { PDFParse } from 'pdf-parse';

export const extractTextFromFile = async (filePath: string, mimeType: string, originalName?: string): Promise<string> => {
  console.log(`Starting extraction for: ${originalName || filePath} (MIME: ${mimeType})`);
  try {
    const stats = fs.statSync(filePath);
    console.log(`File size: ${stats.size} bytes, Storage path: ${filePath}`);

    let text = "";
    if (mimeType === 'application/pdf') {
      console.log('Parser selected: pdf-parse');
      const dataBuffer = fs.readFileSync(filePath);
      const parser = new PDFParse({ data: dataBuffer });
      const data = await parser.getText();
      text = data.text;
      await parser.destroy();
    } 
    else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || mimeType === 'application/msword') {
      console.log('Parser selected: mammoth');
      const result = await mammoth.extractRawText({ path: filePath });
      text = result.value;
    } 
    else if (mimeType === 'text/plain') {
      console.log('Parser selected: fs.readFile (txt)');
      text = fs.readFileSync(filePath, 'utf8');
    }
    else if (mimeType.startsWith('image/')) {
      console.log('Parser selected: OCR placeholder');
      return "OCR not implemented";
    }
    else {
      throw new Error(`Unsupported file type for extraction: ${mimeType}`);
    }

    if (!text || text.trim().length === 0) {
      console.log('Extracted text is empty. Will not process further chunking.');
      return "";
    }
    
    console.log('Extraction successful, text length:', text.length);
    return text;
  } catch (error: any) {
    console.error(`Error extracting text for ${mimeType}:`, error);
    throw new Error(`Extraction failed: ${error.message}`);
  }
};
