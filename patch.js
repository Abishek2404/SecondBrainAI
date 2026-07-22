const fs = require('fs');
let code = fs.readFileSync('src/server/services/rag.service.ts', 'utf8');
code = code.replace(
  /export async function generateAnswer[\s\S]*?export async function generateContentWithRetry/m,
`import path from 'path';
import fsObj from 'fs';

export async function generateAnswer(query: string, history: any[], contextChunks: string[], imageUrl?: string): Promise<string> {
  const ai = getAI();
  
  const contextText = contextChunks.length > 0 
    ? \`Use the following context to answer the user's question. If the answer is not in the context, use your own knowledge or search grounding.\n\nContext:\n\${contextChunks.join('\\n\\n---\\n\\n')}\`
    : \`You are a helpful study assistant.\`;
    
  const systemInstruction = contextText;

  // Determine model based on inputs
  let modelToUse = 'gemini-3.5-flash';
  let config: any = { systemInstruction };
  
  if (imageUrl) {
    modelToUse = 'gemini-3.1-pro-preview'; // Image analysis is a complex task
  } else if (query.toLowerCase().includes('search') || query.toLowerCase().includes('latest') || query.toLowerCase().includes('current')) {
    modelToUse = 'gemini-3.5-flash';
    config.tools = [{ googleSearch: {} }];
  } else if (query.length < 50 && contextChunks.length === 0) {
    modelToUse = 'gemini-3.1-flash-lite'; // Fast simple task
  } else if (query.length > 500) {
    modelToUse = 'gemini-3.1-pro-preview'; // Complex
  }

  const contents = [];
  
  for (const msg of history) {
    const parts: any[] = [{ text: msg.content }];
    if (msg.image) {
       // Convert local file to inlineData
       try {
         const imagePath = path.join(process.cwd(), msg.image);
         if (fsObj.existsSync(imagePath)) {
            const data = fsObj.readFileSync(imagePath).toString('base64');
            const mimeType = msg.image.endsWith('.png') ? 'image/png' : (msg.image.endsWith('.webp') ? 'image/webp' : 'image/jpeg');
            parts.push({ inlineData: { data, mimeType } });
         }
       } catch(e) {}
    }
    contents.push({
      role: msg.role === 'model' ? 'model' : 'user',
      parts
    });
  }
  
  const userParts: any[] = [{ text: query }];
  if (imageUrl) {
    try {
      const imagePath = path.join(process.cwd(), imageUrl);
      if (fsObj.existsSync(imagePath)) {
        const data = fsObj.readFileSync(imagePath).toString('base64');
        const mimeType = imageUrl.endsWith('.png') ? 'image/png' : (imageUrl.endsWith('.webp') ? 'image/webp' : 'image/jpeg');
        userParts.push({ inlineData: { data, mimeType } });
      }
    } catch(e) {}
  }
  
  contents.push({
    role: 'user',
    parts: userParts
  });

  let retries = 3;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: modelToUse,
        contents: contents,
        config
      });
      return response.text || "I'm sorry, I couldn't generate a response.";
    } catch (error: any) {
      const errorStr = String(error);
      if (errorStr.includes('429') || errorStr.includes('quota') || errorStr.includes('RESOURCE_EXHAUSTED')) {
        console.warn(\`\${modelToUse} quota error, falling back...\`);
        try {
          const fallbackResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: { systemInstruction }
          });
          return fallbackResponse.text || "I'm sorry, I couldn't generate a response.";
        } catch (fallbackError) {
          if (attempt === retries - 1) throw fallbackError;
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      } else if (errorStr.includes('503') || errorStr.includes('UNAVAILABLE')) {
        if (attempt === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 5000));
      } else {
        if (attempt === retries - 1) throw error;
      }
    }
  }
  return "I'm sorry, I couldn't generate a response.";
}

export async function generateContentWithRetry`
);
fs.writeFileSync('src/server/services/rag.service.ts', code);
