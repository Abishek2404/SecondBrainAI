import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URI);
const DocumentChunk = mongoose.model('DocumentChunk', new mongoose.Schema({}, { strict: false }));
const Document = mongoose.model('Document', new mongoose.Schema({}, { strict: false }));

async function run() {
  const chunks = await DocumentChunk.find();
  const docs = await Document.find();
  console.log("Docs:", docs);
  console.log("Chunks count:", chunks.length);
  if (chunks.length > 0) {
    console.log("First chunk:", chunks[0]);
  }
  process.exit(0);
}
run();
