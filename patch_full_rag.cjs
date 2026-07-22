const fs = require('fs');

const code = `import { DocumentChunk } from '../models/DocumentChunk';
import { getAI } from '../ai';
import { cosineSimilarity } from '../utils/math';
import mongoose from 'mongoose';
import path from 'path';
import fsObj from 'fs';

// Chunk text into smaller pieces
export function chunkText(text: string, maxChunkSize = 1000): string[] {
  const cleanedText = text.replace(/\\s+/g, ' ');
  const sentences = cleanedText.match(/[^.!?]+[.!?]+/g) || [cleanedText];
  
  const chunks: string[] = [];
  let currentChunk = "";
  
  for (const sentence of sentences) {
    if ((currentChunk.length + sentence.length) > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += " " + sentence;
    }
  }
  
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

// Generate embedding for a single text
export async function generateEmbedding(text: string, retries = 3): Promise<number[]> {
  const ai = getAI();
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await ai.models.embedContent({
        model: 'text-embedding-004',
        contents: text,
      });
      return response.embeddings?.[0]?.values || [];
    } catch (error: any) {
      if (attempt === retries - 1) throw error;
      const errorStr = String(error);
      if (errorStr.includes('429') || errorStr.includes('503') || errorStr.includes('RESOURCE_EXHAUSTED')) {
        console.warn(\`Rate limit hit, retrying attempt \${attempt + 1} in 5s...\`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      } else {
        throw error;
      }
    }
  }
  return [];
}

// Process document into chunks and store
export async function processDocument(documentId: string, userId: string, text: string) {
  const chunks = chunkText(text);
  
  console.log(\`Processing \${chunks.length} chunks for document \${documentId}\`);
  
  for (let i = 0; i < chunks.length; i++) {
    const chunkText = chunks[i];
    if (chunkText.length < 10) continue; // Skip very small chunks
    
    try {
      const embedding = await generateEmbedding(chunkText);
      await DocumentChunk.create({
        document: documentId,
        user: userId,
        text: chunkText,
        embedding,
        chunkIndex: i,
      });
      // Add delay to respect free tier rate limits
      await new Promise(resolve => setTimeout(resolve, 650));
    } catch (error) {
      console.error(\`Error generating embedding for chunk \${i}:\`, error);
      throw error;
    }
  }
}

// Search for relevant chunks
export async function semanticSearch(query: string, userId: string, documentId?: string, limit: number = 5): Promise<string[]> {
  const queryEmbedding = await generateEmbedding(query);
  const filter: any = { user: userId };
  if (documentId) {
    filter.document = documentId;
  }

  try {
    const results = await DocumentChunk.aggregate([
      {
        $vectorSearch: {
          index: 'vector_index',
          path: 'embedding',
          queryVector: queryEmbedding,
          numCandidates: limit * 10,
          limit: limit,
          filter: documentId ? { 
            user: { $eq: new mongoose.Types.ObjectId(userId) },
            document: { $eq: new mongoose.Types.ObjectId(documentId) } 
          } : {
            user: { $eq: new mongoose.Types.ObjectId(userId) }
          }
        }
      },
      {
        $project: { text: 1, score: { $meta: 'vectorSearchScore' } }
      }
    ]);

    if (results && results.length > 0) {
      return results.map(r => r.text);
    }
  } catch (error) {
    console.warn("Atlas Vector Search failed, falling back to in-memory search:", error);
  }

  const matchQuery: any = { user: userId };
  if (documentId) {
    matchQuery.document = documentId;
  }
  
  const allChunks = await DocumentChunk.find(matchQuery).lean();
  
  if (allChunks.length === 0) return [];
  
  const chunksWithScores = allChunks.map((chunk: any) => ({
    text: chunk.text,
    score: cosineSimilarity(queryEmbedding, chunk.embedding),
  }));
  
  chunksWithScores.sort((a, b) => b.score - a.score);
  
  return chunksWithScores.slice(0, limit).map(c => c.text);
}

export async function generateAnswer(query: string, history: any[], contextChunks: string[], imageUrl?: string): Promise<string> {
  const ai = getAI();
  
  const contextText = contextChunks.length > 0 
    ? \`Use the following context to answer the user's question. If the answer is not in the context, use your own knowledge or search grounding.\\n\\nContext:\\n\${contextChunks.join('\\n\\n---\\n\\n')}\`
    : \`You are a helpful study assistant.\`;
    
  const systemInstruction = contextText;

  let modelToUse = 'gemini-3.5-flash';
  let config: any = { systemInstruction };
  
  if (imageUrl) {
    modelToUse = 'gemini-3.1-pro-preview';
  } else if (query.toLowerCase().includes('search') || query.toLowerCase().includes('latest') || query.toLowerCase().includes('current')) {
    modelToUse = 'gemini-3.5-flash';
    config.tools = [{ googleSearch: {} }];
  } else if (query.length < 50 && contextChunks.length === 0) {
    modelToUse = 'gemini-3.1-flash-lite';
  } else if (query.length > 500) {
    modelToUse = 'gemini-3.1-pro-preview';
  }

  const contents = [];
  
  for (const msg of history) {
    const parts: any[] = [{ text: msg.content }];
    if (msg.image) {
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
      const errorStr = String(error) + (error.message || '') + JSON.stringify(error, Object.getOwnPropertyNames(error));
      if (errorStr.includes('429') || errorStr.includes('quota') || errorStr.includes('RESOURCE_EXHAUSTED') || errorStr.includes('503') || errorStr.includes('UNAVAILABLE')) {
        console.warn(\`\${modelToUse} rate limit or 503, retrying in 3 seconds...\`);
        if (attempt === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 3000));
      } else {
        if (attempt === retries - 1) throw error;
      }
    }
  }
  return "I'm sorry, I couldn't generate a response.";
}

export async function generateContentWithRetry(params: any, retries = 3): Promise<any> {
  const ai = getAI();
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await ai.models.generateContent(params);
      return response;
    } catch (error: any) {
      const errorStr = String(error) + (error.message || '') + JSON.stringify(error, Object.getOwnPropertyNames(error));
      if (errorStr.includes('429') || errorStr.includes('quota') || errorStr.includes('RESOURCE_EXHAUSTED') || errorStr.includes('503') || errorStr.includes('UNAVAILABLE')) {
        console.warn(\`generateContent rate limit or 503, retrying in 3 seconds...\`);
        if (attempt === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 3000));
      } else {
        if (attempt === retries - 1) throw error;
      }
    }
  }
}
`;

fs.writeFileSync('src/server/services/rag.service.ts', code);
