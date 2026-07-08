# SecondBrain AI

"The AI Learning Operating System"

SecondBrain AI is a centralized AI learning workspace where students can upload every type of study material and transform it into an intelligent, searchable knowledge base.

---

## 1. Complete Folder Structure

```
secondbrain-ai/
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ components/          # Reusable UI components (Shadcn, custom)
â”‚   â”‚   â””â”€â”€ ui/              # Shadcn UI primitives
â”‚   â”œâ”€â”€ features/            # Feature-based module organization
â”‚   â”‚   â”œâ”€â”€ auth/            # Authentication context, login, signup
â”‚   â”‚   â”œâ”€â”€ dashboard/       # Dashboard components and logic
â”‚   â”‚   â”œâ”€â”€ documents/       # File upload, document management
â”‚   â”‚   â”œâ”€â”€ chat/            # RAG chat interface
â”‚   â”‚   â””â”€â”€ study/           # Flashcards, Quizzes, Planner
â”‚   â”œâ”€â”€ hooks/               # Custom React hooks (e.g., useAuth, useUpload)
â”‚   â”œâ”€â”€ lib/                 # Utilities (Tailwind merge, formatting)
â”‚   â”œâ”€â”€ store/               # Zustand state stores
â”‚   â”œâ”€â”€ types/               # TypeScript definitions
â”‚   â””â”€â”€ App.tsx              # Root React component & Router
â”œâ”€â”€ server/                  # Backend application (if separated)
â”‚   â”œâ”€â”€ controllers/         # Request handlers
â”‚   â”œâ”€â”€ middleware/          # Auth, Rate limiting, Validation
â”‚   â”œâ”€â”€ models/              # Mongoose schemas
â”‚   â”œâ”€â”€ routes/              # Express route definitions
â”‚   â”œâ”€â”€ services/            # Business logic (AI, AWS, Pinecone)
â”‚   â”œâ”€â”€ workers/             # BullMQ background job processors
â”‚   â””â”€â”€ index.ts             # Express entry point
â”œâ”€â”€ server.ts                # Full-stack monolithic entry point
â”œâ”€â”€ .env.example             # Environment variables blueprint
â”œâ”€â”€ package.json
â””â”€â”€ vite.config.ts
```

---

## 2. Frontend Architecture

**Tech Stack**: React 19, TypeScript, Vite, Tailwind CSS, Shadcn UI, Zustand, TanStack Query, React Router, Framer Motion.

- **State Management**: 
  - `TanStack Query` for server state (caching API responses, background updates).
  - `Zustand` for global client state (sidebar toggle, current selected document, active chat session).
- **Routing**: `React Router` with lazy-loaded routes for performance.
- **UI System**: Tailwind CSS with Shadcn UI for accessible, customizable components. CSS variables for theming (Dark/Light mode).
- **Performance**:
  - Route-level code splitting.
  - Virtualization for large document lists.
  - Streaming UI updates for AI responses.

---

## 3. Backend Architecture

**Tech Stack**: Node.js, Express, TypeScript, MongoDB, Redis, BullMQ, Pinecone (Vector DB), AWS S3.

- **Pattern**: Controller-Service-Model (CSM) layer separation.
- **Background Processing**: `BullMQ` + `Redis` for heavy tasks (OCR, chunking, embedding generation).
- **Real-time**: Server-Sent Events (SSE) or WebSockets for streaming AI chat responses.
- **Storage**: AWS S3 for document blobs, MongoDB for metadata, Pinecone for high-dimensional vector embeddings.

---

## 4. MongoDB Schema

```typescript
// Users Collection
{
  _id: ObjectId,
  email: String,
  passwordHash: String,
  googleId: String,
  name: String,
  role: String (Enum: 'student', 'pro', 'admin'),
  subscriptionTier: String,
  studyStreak: Number,
  createdAt: Date,
  updatedAt: Date
}

// Documents Collection
{
  _id: ObjectId,
  userId: ObjectId (Ref: 'Users'),
  folderId: ObjectId (Ref: 'Folders', Nullable),
  title: String,
  type: String (Enum: 'pdf', 'docx', 'audio', 'video', 'image'),
  s3Url: String,
  sizeBytes: Number,
  status: String (Enum: 'processing', 'completed', 'failed'),
  tags: [String],
  createdAt: Date
}

// Chats Collection (Chat Sessions)
{
  _id: ObjectId,
  userId: ObjectId (Ref: 'Users'),
  title: String,
  contextDocumentIds: [ObjectId] (Ref: 'Documents'),
  createdAt: Date,
  updatedAt: Date
}

// Messages Collection
{
  _id: ObjectId,
  chatId: ObjectId (Ref: 'Chats'),
  role: String (Enum: 'user', 'assistant'),
  content: String,
  citations: [{ docId: ObjectId, snippet: String }],
  createdAt: Date
}

// Flashcards Collection
{
  _id: ObjectId,
  userId: ObjectId,
  documentId: ObjectId,
  front: String,
  back: String,
  nextReviewDate: Date,
  easeFactor: Number,
  interval: Number
}
```

---

## 5. API Routes

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Authenticate & get JWT
- `POST /api/auth/google` - OAuth login

### Documents
- `GET /api/documents` - List documents (paginated)
- `POST /api/documents/upload` - Presigned URL generation or direct upload
- `GET /api/documents/:id` - Get metadata
- `DELETE /api/documents/:id` - Delete document and vectors

### Chat & RAG
- `POST /api/chat/session` - Create new chat session
- `POST /api/chat/message` - Send message (returns streaming SSE)
- `GET /api/chat/:sessionId/messages` - Get chat history

### Study Tools
- `POST /api/flashcards/generate` - Trigger background job to generate cards
- `GET /api/flashcards/review` - Get due flashcards (Spaced Repetition)

---

## 6. Authentication Flow

1. **Local Auth**: User submits email/password. Backend hashes with bcrypt, compares, and issues a short-lived JWT (Access Token) and HttpOnly Refresh Token.
2. **Google OAuth**: Frontend gets Google token, sends to backend, backend verifies with Google, syncs user record, issues JWT.
3. **Protection**: `authMiddleware` validates JWT signature on protected routes.

---

## 7. RAG Implementation Plan

1. **Upload**: User uploads PDF. File saved to S3.
2. **Extraction**: Background job reads S3, uses `pdf-parse` or OCR to extract raw text.
3. **Chunking**: `RecursiveCharacterTextSplitter` chunks text into ~1000 token blocks with 200 token overlap.
4. **Embedding**: Pass chunks to an embedding model (e.g., `text-embedding-004`).
5. **Vector Storage**: Store vectors in Pinecone with metadata `(userId, documentId, chunkIndex)`.

---

## 8. AI Service Architecture

Abstract the AI provider behind a generic interface:

```typescript
interface AIProvider {
  generateCompletion(prompt: string, context: string[]): Promise<string>;
  generateEmbeddings(text: string): Promise<number[]>;
  streamCompletion(prompt: string, context: string[], onData: (chunk: string) => void): Promise<void>;
}

class GeminiProvider implements AIProvider {
  // Implementation using @google/genai SDK
}
```

---

## 9. Vector Database Integration

- **Pinecone**: Namespace by `userId` to strictly isolate user data and speed up search.
- **Querying**: When user asks "What is mitochondria?", embed the question, query Pinecone for top 5 chunks in the user's namespace, inject chunks into the Gemini prompt context.

---

## 10. OCR Pipeline

- **Images/Handwritten Notes**: If document type is `image/jpeg` or `application/pdf` (scanned), route to Google Cloud Vision API or AWS Textract to extract text.
- Text is then fed into the standard RAG pipeline (Chunking -> Embedding).

---

## 11. YouTube Processing Pipeline

- User pastes YouTube URL.
- Backend validates URL and downloads captions using `youtube-transcript`.
- If no captions exist, audio is downloaded via `ytdl-core` and passed to an STT model (Whisper).
- Transcript is chunked, embedded, and stored like a standard document.

---

## 12. Quiz Generation Flow

- User selects a document and clicks "Generate Quiz".
- Backend triggers Gemini API with prompt: `Generate a 10-question multiple-choice quiz in JSON format based on the following text: {document_summary}`.
- JSON response is parsed and stored in `Quizzes` MongoDB collection.
- Frontend renders interactive Quiz UI.

---

## 13. Flashcard Generation Flow

- Similar to Quiz, but prompt requests key-value pairs (Term -> Definition).
- Stored in `Flashcards` collection with Spaced Repetition (SM-2 algorithm) default fields (`easeFactor = 2.5`, `interval = 0`).

---

## 14. Study Planner Logic

- User inputs exam date.
- System calculates days remaining.
- Backend allocates topics evenly across available days, storing them in `StudyPlans` collection.
- Cron job runs nightly to check for missed goals and readjust the schedule.

---

## 15. Learning Analytics Logic

- Track "Study Sessions" with start/end timestamps.
- Aggregate quiz scores per topic.
- Return analytical data via `/api/analytics` endpoint using MongoDB aggregation pipelines (`$group`, `$match`).

---

## 16. Admin System

- Superuser role.
- React Router restricted `/admin` routes.
- Dashboards showing system health (Redis queue lengths, active users, storage usage).

---

## 17. Deployment Architecture

- **Frontend**: Vercel (Auto-deploys from GitHub `main` branch).
- **Backend**: Render or Railway (Dockerized Node.js app).
- **Databases**: MongoDB Atlas (Cloud database), Redis Labs, Pinecone.

---

## 18. CI/CD Workflow

- **GitHub Actions**: 
  1. Trigger on PR to `main`.
  2. Run `npm run lint`.
  3. Run unit tests (`vitest`).
  4. Build Vite app (`npm run build`).
  5. Deploy on merge.

---

## 19. Security Checklist

- [x] Helmet.js for HTTP headers.
- [x] Rate limiting on auth and AI endpoints to prevent abuse.
- [x] JWT secrets loaded from `.env`.
- [x] Document authorization (User can only read/delete their own `userId` documents).
- [x] File upload sanitization (Check MIME types, limit size to 50MB).
- [x] No sensitive API keys shipped to frontend.

---

## 20. Future Roadmap

- **Q3 2026**: Mobile App (React Native) with offline sync.
- **Q4 2026**: Multi-modal chat (Voice in, Voice out) using Live API.
- **Q1 2027**: Collaborative Study Groups (WebSockets for shared cursor notes).
- **Q2 2027**: Adaptive AI Tutor that dynamically alters teaching style based on user emotion/struggle detected from quiz accuracy.

