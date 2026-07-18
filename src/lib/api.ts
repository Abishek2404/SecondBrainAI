import { getLocalCache, setLocalCache, addToSyncQueue, performOptimisticUpdates } from "./offlineDb";

export const apiFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const token = localStorage.getItem('token');
  const headers = new Headers(init?.headers);
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Determine URL, Method, and offline status
  const url = typeof input === "string" ? input : (input as Request).url || input.toString();
  const method = (init?.method || "GET").toUpperCase();
  const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

  // Convert headers to a standard record object for storage
  const headersObj: Record<string, string> = {};
  headers.forEach((value, key) => {
    headersObj[key] = value;
  });

  // Handle GET Requests
  if (method === "GET") {
    if (isOnline) {
      try {
        const response = await fetch(input, { ...init, headers });
        if (response.ok) {
          // Clone and cache the JSON payload if applicable
          const contentType = response.headers.get("Content-Type") || "";
          if (contentType.includes("application/json")) {
            const clone = response.clone();
            clone.json().then((data) => {
              setLocalCache(url, data);
            }).catch(() => {});
          }
        }
        return response;
      } catch (err) {
        console.warn(`Network fetch failed for ${url}, attempting offline cache retrieval:`, err);
        // Network failed or server offline - attempt local cache retrieval
        const cachedData = await getLocalCache(url);
        if (cachedData !== null) {
          return new Response(JSON.stringify(cachedData), {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "X-Offline-Cache": "true",
            },
          });
        }
        throw err;
      }
    } else {
      // Browser is offline
      const cachedData = await getLocalCache(url);
      if (cachedData !== null) {
        return new Response(JSON.stringify(cachedData), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "X-Offline-Cache": "true",
          },
        });
      }
      return new Response(JSON.stringify({ error: "Offline: Resource not cached locally." }), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  // Handle Mutating Requests (POST, PUT, DELETE, PATCH, etc.)
  if (isOnline) {
    try {
      const response = await fetch(input, { ...init, headers });
      // Invalidate GET cache for this URL on success to keep it fresh
      if (response.ok) {
        // Also clear general list caches so they fetch fresh on next navigation
        if (url.includes("/api/notes")) {
          setLocalCache("/api/notes", null);
        } else if (url.includes("/api/flashcards")) {
          setLocalCache("/api/flashcards/decks", null);
        } else if (url.includes("/api/quizzes")) {
          setLocalCache("/api/quizzes", null);
        } else if (url.includes("/api/planner")) {
          setLocalCache("/api/planner", null);
        } else if (url.includes("/api/documents")) {
          setLocalCache("/api/documents", null);
        }
      }
      return response;
    } catch (err) {
      console.warn(`Mutating network fetch failed for ${url}, fallback to offline sync queue:`, err);
      // Let it fall through to offline handler below
    }
  }

  // Handle Offline Mutation (Optimistic Update & Sync Queue)
  let bodyText: string | null = null;
  let bodyData: any = {};

  if (init?.body) {
    if (typeof init.body === "string") {
      bodyText = init.body;
      try {
        bodyData = JSON.parse(bodyText);
      } catch (e) {}
    } else if (init.body instanceof FormData) {
      bodyText = "[FormData]";
      // Extract form fields if possible for optimistic updates
      const tempObj: Record<string, any> = {};
      init.body.forEach((val, key) => {
        if (typeof val === "string") {
          tempObj[key] = val;
        }
      });
      bodyData = tempObj;
    }
  }

  // 1. Perform optimistic updates locally so UI reflects change instantly
  const optimisticResult = await performOptimisticUpdates(url, method, bodyData);

  // 2. Queue the mutation for server sync when online
  if (bodyText !== "[FormData]") {
    await addToSyncQueue(url, method, headersObj, bodyText);
  }

  // 3. Return mock successful Response with the optimistic result
  return new Response(JSON.stringify(optimisticResult), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "X-Offline-Cache": "true",
      "X-Offline-Queued": "true",
    },
  });
};

