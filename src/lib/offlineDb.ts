// src/lib/offlineDb.ts
import { toast } from "sonner";

const DB_NAME = "study_app_local_db";
const DB_VERSION = 1;
const CACHE_STORE = "caches";
const SYNC_QUEUE_STORE = "syncQueue";

let dbInstance: IDBDatabase | null = null;

// Initialize the IndexedDB
export function initDb(): Promise<IDBDatabase> {
  if (typeof window === "undefined" || !window.indexedDB) {
    return Promise.reject("IndexedDB is not supported in this environment.");
  }
  if (dbInstance) return Promise.resolve(dbInstance);

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(CACHE_STORE)) {
        db.createObjectStore(CACHE_STORE, { keyPath: "url" });
      }
      if (!db.objectStoreNames.contains(SYNC_QUEUE_STORE)) {
        db.createObjectStore(SYNC_QUEUE_STORE, { keyPath: "id", autoIncrement: true });
      }
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

// ----------------------------------------------------
// CACHE HELPERS
// ----------------------------------------------------

export async function getLocalCache(url: string): Promise<any | null> {
  try {
    const db = await initDb();
    return new Promise((resolve) => {
      const transaction = db.transaction(CACHE_STORE, "readonly");
      const store = transaction.objectStore(CACHE_STORE);
      const request = store.get(url);

      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result.payload);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        resolve(null);
      };
    });
  } catch (err) {
    console.error("Failed to read from offline cache:", err);
    return null;
  }
}

export async function setLocalCache(url: string, payload: any): Promise<void> {
  try {
    const db = await initDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(CACHE_STORE, "readwrite");
      const store = transaction.objectStore(CACHE_STORE);
      const request = store.put({
        url,
        payload,
        updatedAt: Date.now(),
      });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error("Failed to save to offline cache:", err);
  }
}

export async function deleteLocalCache(url: string): Promise<void> {
  try {
    const db = await initDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(CACHE_STORE, "readwrite");
      const store = transaction.objectStore(CACHE_STORE);
      const request = store.delete(url);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error("Failed to delete offline cache:", err);
  }
}

// ----------------------------------------------------
// SYNC QUEUE HELPERS
// ----------------------------------------------------

export interface SyncItem {
  id?: number;
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string | null;
  timestamp: number;
}

export async function addToSyncQueue(
  url: string,
  method: string,
  headers: Record<string, string>,
  body: string | null
): Promise<number> {
  try {
    const db = await initDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(SYNC_QUEUE_STORE, "readwrite");
      const store = transaction.objectStore(SYNC_QUEUE_STORE);
      const item: SyncItem = {
        url,
        method,
        headers,
        body,
        timestamp: Date.now(),
      };
      const request = store.add(item);

      request.onsuccess = () => {
        resolve(request.result as number);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error("Failed to write to offline sync queue:", err);
    return -1;
  }
}

export async function getSyncQueue(): Promise<SyncItem[]> {
  try {
    const db = await initDb();
    return new Promise((resolve) => {
      const transaction = db.transaction(SYNC_QUEUE_STORE, "readonly");
      const store = transaction.objectStore(SYNC_QUEUE_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };
      request.onerror = () => {
        resolve([]);
      };
    });
  } catch (err) {
    return [];
  }
}

export async function deleteFromSyncQueue(id: number): Promise<void> {
  try {
    const db = await initDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(SYNC_QUEUE_STORE, "readwrite");
      const store = transaction.objectStore(SYNC_QUEUE_STORE);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error("Failed to delete item from sync queue:", err);
  }
}

// ----------------------------------------------------
// SYNC ENGINE - PLAYBACK QUEUE WHEN ONLINE
// ----------------------------------------------------

let isSyncing = false;

export async function syncOfflineQueue(): Promise<void> {
  if (isSyncing) return;
  if (typeof navigator !== "undefined" && (!navigator.onLine || localStorage.getItem("offline_simulator") === "true")) return;

  const queue = await getSyncQueue();
  if (queue.length === 0) return;

  isSyncing = true;
  toast.info(`Connection restored! Synchronizing ${queue.length} offline action(s)...`, {
    id: "offline-sync-toast",
    duration: 3000,
  });

  const token = localStorage.getItem("token");

  for (const item of queue) {
    try {
      const headers = { ...item.headers };
      if (token && !headers["Authorization"]) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      // Replay the fetch
      const response = await fetch(item.url, {
        method: item.method,
        headers,
        body: item.body,
      });

      if (response.ok) {
        // Success! Remove from queue
        if (item.id !== undefined) {
          await deleteFromSyncQueue(item.id);
        }
      } else {
        // If it's a structural client error (4xx) and not server or connection related,
        // we shouldn't block the rest of the queue, but discard it to prevent infinite blocking.
        if (response.status >= 400 && response.status < 500) {
          console.warn(`Offline request replayed and failed with client error ${response.status}:`, item);
          if (item.id !== undefined) {
            await deleteFromSyncQueue(item.id);
          }
        } else {
          // Server error (5xx) or transient error, keep in queue and pause
          console.error(`Replayed request failed with server error ${response.status}. Keeping in queue.`);
          break;
        }
      }
    } catch (err) {
      console.error("Network sync replay failed. Pausing sync queue:", err);
      // We are likely offline again or DNS failed, pause replay
      break;
    }
  }

  isSyncing = false;
  const remaining = await getSyncQueue();
  if (remaining.length === 0) {
    toast.success("All offline changes have been synchronized successfully!", {
      id: "offline-sync-success-toast",
      duration: 3000,
    });
    // Dispatch a custom event to notify components to reload state
    window.dispatchEvent(new CustomEvent("offline-sync-complete"));
  } else {
    toast.error(`Offline sync partially complete. ${remaining.length} items remaining.`, {
      id: "offline-sync-partial-toast",
    });
  }
}

// ----------------------------------------------------
// OPTIMISTIC OFFLINE DATA WRAPPER (MUTATOR INTERCEPTORS)
// ----------------------------------------------------

export async function performOptimisticUpdates(
  url: string,
  method: string,
  bodyData: any
): Promise<any> {
  const methodUpper = method.toUpperCase();

  // 1. NOTES INTERCEPTIONS
  if (url.includes("/api/notes")) {
    if (methodUpper === "POST" && (url.endsWith("/notes") || url.endsWith("/notes/generate"))) {
      // User creates a note
      const currentNotes = (await getLocalCache("/api/notes")) || [];
      const newNote = {
        _id: "off_note_" + Date.now() + Math.round(Math.random() * 1000),
        title: bodyData.title || bodyData.prompt || "New Offline Note",
        content: bodyData.content || `Offline generated note based on: ${bodyData.prompt || "scratchpad"}. It will sync when online.`,
        summary: bodyData.summary || "Summary of offline generated note.",
        type: bodyData.type || "Summary",
        words: bodyData.content ? bodyData.content.split(/\s+/).length : 50,
        subject: bodyData.subject || "General",
        
        importance: bodyData.importance || "medium",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await setLocalCache("/api/notes", [newNote, ...currentNotes]);
      
      // Update dashboard total notes count
      const dashboard = await getLocalCache("/api/dashboard");
      if (dashboard) {
        dashboard.totalNotes = (dashboard.totalNotes || 0) + 1;
        await setLocalCache("/api/dashboard", dashboard);
      }

      return newNote;
    }

    if (methodUpper === "PUT" || methodUpper === "PATCH" || (methodUpper === "POST" && /\/notes\/[a-zA-Z0-9_]+$/.test(url))) {
      // User updates a note
      const match = url.match(/\/notes\/([a-zA-Z0-9_]+)$/);
      const noteId = match ? match[1] : null;
      if (noteId) {
        const currentNotes = (await getLocalCache("/api/notes")) || [];
        const index = currentNotes.findIndex((n: any) => n._id === noteId);
        let updatedNote = null;
        if (index !== -1) {
          updatedNote = {
            ...currentNotes[index],
            ...bodyData,
            updatedAt: new Date().toISOString(),
          };
          currentNotes[index] = updatedNote;
          await setLocalCache("/api/notes", currentNotes);
          await setLocalCache(`/api/notes/${noteId}`, updatedNote);
        }
        return updatedNote || bodyData;
      }
    }

    if (methodUpper === "DELETE") {
      // User deletes a note
      const match = url.match(/\/notes\/([a-zA-Z0-9_]+)$/);
      const noteId = match ? match[1] : null;
      if (noteId) {
        const currentNotes = (await getLocalCache("/api/notes")) || [];
        const updatedNotes = currentNotes.filter((n: any) => n._id !== noteId);
        await setLocalCache("/api/notes", updatedNotes);
        await deleteLocalCache(`/api/notes/${noteId}`);

        // Update dashboard total notes count
        const dashboard = await getLocalCache("/api/dashboard");
        if (dashboard) {
          dashboard.totalNotes = Math.max(0, (dashboard.totalNotes || 1) - 1);
          await setLocalCache("/api/dashboard", dashboard);
        }
      }
      return { success: true };
    }
  }

  // 2. FLASHCARDS INTERCEPTIONS
  if (url.includes("/api/flashcards")) {
    if (methodUpper === "POST" && url.endsWith("/generate")) {
      // Generating cards/decks
      const currentDecks = (await getLocalCache("/api/flashcards/decks")) || [];
      const deckId = "off_deck_" + Date.now();
      const newDeck = {
        _id: deckId,
        title: bodyData.deckTitle || bodyData.prompt || "Offline Flashcard Deck",
        subject: bodyData.subject || "General",
        createdAt: new Date().toISOString(),
      };
      await setLocalCache("/api/flashcards/decks", [newDeck, ...currentDecks]);

      const mockCards = [
        {
          _id: "off_card_1_" + Date.now(),
          front: "What is stored locally first?",
          back: "Your notes, study planner tasks, quizzes, and flashcards! They remain offline-ready.",
          explanation: "IndexedDB stores everything seamlessly.",
          interval: 1,
          repetition: 0,
          efactor: 2.5,
          nextReviewDate: new Date().toISOString(),
        },
        {
          _id: "off_card_2_" + Date.now(),
          front: "How do sync queues work?",
          back: "Offline actions (POST/PUT/DELETE) are cached in a queue, then automatically executed when reconnected.",
          explanation: "This allows fully seamless user activity.",
          interval: 1,
          repetition: 0,
          efactor: 2.5,
          nextReviewDate: new Date().toISOString(),
        }
      ];
      await setLocalCache(`/api/flashcards/decks/${deckId}/cards`, mockCards);

      // Update dashboard total flashcards
      const dashboard = await getLocalCache("/api/dashboard");
      if (dashboard) {
        dashboard.totalFlashcards = (dashboard.totalFlashcards || 0) + mockCards.length;
        await setLocalCache("/api/dashboard", dashboard);
      }

      return { deck: newDeck, cards: mockCards };
    }

    if (methodUpper === "DELETE") {
      const match = url.match(/\/flashcards\/decks\/([a-zA-Z0-9_]+)$/);
      const deckId = match ? match[1] : null;
      if (deckId) {
        const currentDecks = (await getLocalCache("/api/flashcards/decks")) || [];
        const updatedDecks = currentDecks.filter((d: any) => d._id !== deckId);
        await setLocalCache("/api/flashcards/decks", updatedDecks);
        await deleteLocalCache(`/api/flashcards/decks/${deckId}/cards`);
      }
      return { success: true };
    }

    if (methodUpper === "POST" && url.includes("/review")) {
      // Review card
      const match = url.match(/\/cards\/([a-zA-Z0-9_]+)\/review$/);
      const cardId = match ? match[1] : null;
      if (cardId) {
        // Find deck cache that has this card and update review dates
        // Since we don't map cards directly, we can update overall stats in dashboard
        const dashboard = await getLocalCache("/api/dashboard");
        if (dashboard) {
          dashboard.xp = (dashboard.xp || 0) + 10;
          dashboard.coins = (dashboard.coins || 0) + 2;
          await setLocalCache("/api/dashboard", dashboard);
        }
      }
      return { success: true, xpGained: 10, coinsGained: 2 };
    }
  }

  // 3. QUIZZES INTERCEPTIONS
  if (url.includes("/api/quizzes")) {
    if (methodUpper === "POST" && url.endsWith("/generate")) {
      const currentQuizzes = (await getLocalCache("/api/quizzes")) || [];
      const quizId = "off_quiz_" + Date.now();
      const newQuiz = {
        _id: quizId,
        title: bodyData.title || bodyData.prompt || "Offline Quiz",
        subject: bodyData.subject || "General",
        questions: [
          {
            question: "Is this app accessible offline?",
            options: ["No, only online", "Yes, totally local-first!", "Partially", "Requires premium"],
            correctAnswerIndex: 1,
            explanation: "All study materials, progress, planner, notes, and quiz structures are synced and cached.",
          },
          {
            question: "Which database stores local data?",
            options: ["Mongoose", "IndexedDB / PouchDB", "LocalStorage", "CookieStore"],
            correctAnswerIndex: 1,
            explanation: "IndexedDB provides structured persistent client storage.",
          }
        ],
        createdAt: new Date().toISOString(),
      };
      await setLocalCache("/api/quizzes", [newQuiz, ...currentQuizzes]);
      await setLocalCache(`/api/quizzes/${quizId}`, newQuiz);

      // Update dashboard
      const dashboard = await getLocalCache("/api/dashboard");
      if (dashboard) {
        dashboard.totalQuizzesTaken = (dashboard.totalQuizzesTaken || 0) + 1;
        await setLocalCache("/api/dashboard", dashboard);
      }

      return newQuiz;
    }

    if (methodUpper === "DELETE") {
      const match = url.match(/\/quizzes\/([a-zA-Z0-9_]+)$/);
      const quizId = match ? match[1] : null;
      if (quizId) {
        const currentQuizzes = (await getLocalCache("/api/quizzes")) || [];
        const updatedQuizzes = currentQuizzes.filter((q: any) => q._id !== quizId);
        await setLocalCache("/api/quizzes", updatedQuizzes);
        await deleteLocalCache(`/api/quizzes/${quizId}`);
      }
      return { success: true };
    }

    if (methodUpper === "POST" && url.includes("/attempts")) {
      // Completed quiz attempt
      const match = url.match(/\/quizzes\/([a-zA-Z0-9_]+)\/attempts$/);
      const quizId = match ? match[1] : null;
      const score = bodyData.score || 100;
      
      const dashboard = await getLocalCache("/api/dashboard");
      if (dashboard) {
        dashboard.xp = (dashboard.xp || 0) + 50;
        dashboard.coins = (dashboard.coins || 0) + 15;
        dashboard.todayCompletedTasks = (dashboard.todayCompletedTasks || 0) + 1;
        dashboard.completedTasks = (dashboard.completedTasks || 0) + 1;
        
        // Accumulate quiz totals
        dashboard.totalQuizzesTaken = (dashboard.totalQuizzesTaken || 0) + 1;
        await setLocalCache("/api/dashboard", dashboard);
      }

      return { success: true, score, xpGained: 50, coinsGained: 15 };
    }
  }

  // 4. PLANNER INTERCEPTIONS
  if (url.includes("/api/planner")) {
    if (methodUpper === "POST") {
      // Updates standard planner tasks
      // bodyData is expected to look like { date: "YYYY-MM-DD", tasks: [...] }
      await setLocalCache("/api/planner", bodyData);

      // Reflect in dashboard as well!
      const dashboard = await getLocalCache("/api/dashboard");
      if (dashboard && bodyData.tasks) {
        const completedCount = bodyData.tasks.filter((t: any) => t.status === "completed").length;
        dashboard.todayTasks = bodyData.tasks;
        dashboard.todayCompletedTasks = completedCount;
        await setLocalCache("/api/dashboard", dashboard);
      }

      return { success: true, saved: bodyData };
    }
  }

  // 5. DOCUMENTS INTERCEPTIONS
  if (url.includes("/api/documents")) {
    if (methodUpper === "DELETE") {
      const match = url.match(/\/documents\/([a-zA-Z0-9_]+)$/);
      const docId = match ? match[1] : null;
      if (docId) {
        const docs = (await getLocalCache("/api/documents")) || [];
        const updatedDocs = docs.filter((d: any) => d._id !== docId);
        await setLocalCache("/api/documents", updatedDocs);

        // Update dashboard count
        const dashboard = await getLocalCache("/api/dashboard");
        if (dashboard) {
          dashboard.totalDocuments = Math.max(0, (dashboard.totalDocuments || 1) - 1);
          await setLocalCache("/api/dashboard", dashboard);
        }
      }
      return { success: true };
    }
  }

  // Fallback default response
  return { success: true, offline: true, timestamp: Date.now() };
}

// Check network online/offline status and register callbacks
if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    syncOfflineQueue();
  });
}
