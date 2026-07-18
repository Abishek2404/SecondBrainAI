import fs from 'fs';
import mammoth from 'mammoth';
import { PDFParse } from 'pdf-parse';
import { GoogleGenAI } from '@google/genai';

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
      console.log('Parser selected: Gemini Vision OCR');
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is missing for image analysis");
      }
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const imageBuffer = fs.readFileSync(filePath);
      
      let textResponse = "";
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-pro',
          contents: [
            {
              role: 'user',
              parts: [
                { text: "Extract all text and describe the contents of this image in detail. Make sure to capture any data or important information. Structure it nicely." },
                { inlineData: { data: imageBuffer.toString("base64"), mimeType } }
              ]
            }
          ]
        });
        textResponse = response.text || "";
      } catch (err: any) {
        console.warn("gemini-2.5-pro failed, falling back to gemini-2.5-flash", err.message);
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [
            {
              role: 'user',
              parts: [
                { text: "Extract all text and describe the contents of this image in detail. Make sure to capture any data or important information. Structure it nicely." },
                { inlineData: { data: imageBuffer.toString("base64"), mimeType } }
              ]
            }
          ]
        });
        textResponse = response.text || "";
      }
      
      text = textResponse;
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
