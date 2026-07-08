import mongoose from 'mongoose';
import { GoogleGenAI } from '@google/genai';
import { DocumentChunk } from '../models/DocumentChunk';

let ai: GoogleGenAI | null = null;
const getAI = () => {
  if (!ai) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is missing");
    }
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return ai;
};

// Cosine similarity between two vectors
function cosineSimilarity(A: number[], B: number[]) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < A.length; i++) {
    dotProduct += A[i] * B[i];
    normA += A[i] * A[i];
    normB += B[i] * B[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Clean and chunk text
export function chunkText(text: string, maxChunkSize: number = 1000): string[] {
  // Remove excessive whitespace
  const cleanedText = text.replace(/\\s+/g, ' ').trim();
  
  // Split by sentences roughly
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
        model: 'gemini-embedding-2',
        contents: text,
      });
      return response.embeddings?.[0]?.values || [];
    } catch (error: any) {
      if (attempt === retries - 1) throw error;
      const errorStr = String(error);
      if (errorStr.includes('429') || errorStr.includes('503') || errorStr.includes('RESOURCE_EXHAUSTED')) {
        console.warn(`Rate limit hit, retrying attempt ${attempt + 1} in 5s...`);
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
  
  console.log(`Processing ${chunks.length} chunks for document ${documentId}`);
  
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
      // Add delay to respect free tier rate limits (100 req/min => ~600ms/req)
      await new Promise(resolve => setTimeout(resolve, 650));
    } catch (error) {
      console.error(`Error generating embedding for chunk ${i}:`, error);
      throw error;
    }
  }
}

// Search for relevant chunks
export async function semanticSearch(query: string, userId: string, documentId?: string, limit: number = 5): Promise<string[]> {
  const queryEmbedding = await generateEmbedding(query);

  const filter: any = { user: userId };
  if (documentId) {
    // Note: To use objectId in vectorSearch filter, we may need to make sure it's the right format
    // But for now we just pass it
    filter.document = documentId;
  }

  // Assuming an Atlas Vector Search index named 'vector_index' is created
  // In a real scenario, you'd configure the index on the collection
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

  // Fallback for local dev without Atlas Vector Search
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

// Answer generation
export async function generateAnswer(query: string, history: any[], contextChunks: string[]): Promise<string> {
  const ai = getAI();
  
  const contextText = contextChunks.length > 0 
    ? `Use the following context to answer the user's question. If the answer is not in the context, say you don't know based on the provided documents.\n\nContext:\n${contextChunks.join('\n\n---\n\n')}`
    : `You are a helpful study assistant.`;
    
  const systemInstruction = contextText;

  const chatSession = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: systemInstruction,
    }
  });
  
  // Send history
  if (history && history.length > 0) {
     // For @google/genai, history is usually passed in initialization or we can send it as messages
     // A simpler approach for the new SDK is to format history into the prompt or use the chat API properly
     // Wait, let's just use generateContent if we want to pass all messages.
  }
  
  // Since we are managing history ourselves, we can just use generateContent for more control
  const contents = [];
  
  // Convert history to contents format
  for (const msg of history) {
    contents.push({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    });
  }
  
  contents.push({
    role: 'user',
    parts: [{ text: query }]
  });

  let retries = 3;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
        }
      });
      return response.text || "I'm sorry, I couldn't generate a response.";
    } catch (error: any) {
      if (attempt === retries - 1) throw error;
      const errorStr = String(error);
      if (errorStr.includes('429') || errorStr.includes('503') || errorStr.includes('RESOURCE_EXHAUSTED') || errorStr.includes('UNAVAILABLE')) {
        console.warn(`generateContent rate limit/503 hit, retrying attempt ${attempt + 1} in 5s...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      } else {
        throw error;
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
      if (attempt === retries - 1) throw error;
      const errorStr = String(error);
      if (errorStr.includes('429') || errorStr.includes('503') || errorStr.includes('RESOURCE_EXHAUSTED') || errorStr.includes('UNAVAILABLE')) {
        console.warn(`generateContent rate limit/503 hit, retrying attempt ${attempt + 1} in 5s...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      } else {
        throw error;
      }
    }
  }
}
