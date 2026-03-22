export function useOffline() {
  const DB_NAME = "kudytudy_offline";
  const DB_VERSION = 1;
  const isOnline = ref(true);

  function initListeners() {
    if (import.meta.server) return;
    isOnline.value = navigator.onLine;
    window.addEventListener("online", () => (isOnline.value = true));
    window.addEventListener("offline", () => (isOnline.value = false));
  }

  function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains("routes")) {
          db.createObjectStore("routes", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("locations")) {
          db.createObjectStore("locations", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("media")) {
          db.createObjectStore("media", { keyPath: "url" });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function saveRoute(routeId: string, data: Record<string, unknown>) {
    const db = await openDB();
    const tx = db.transaction("routes", "readwrite");
    tx.objectStore("routes").put({ id: routeId, ...data, savedAt: Date.now() });
    return new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async function getRoute(routeId: string): Promise<Record<string, unknown> | null> {
    const db = await openDB();
    const tx = db.transaction("routes", "readonly");
    const req = tx.objectStore("routes").get(routeId);
    return new Promise((resolve) => {
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  }

  async function saveLocation(locationId: string, data: Record<string, unknown>) {
    const db = await openDB();
    const tx = db.transaction("locations", "readwrite");
    tx.objectStore("locations").put({ id: locationId, ...data, savedAt: Date.now() });
    return new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async function getLocation(locationId: string): Promise<Record<string, unknown> | null> {
    const db = await openDB();
    const tx = db.transaction("locations", "readonly");
    const req = tx.objectStore("locations").get(locationId);
    return new Promise((resolve) => {
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  }

  async function downloadRouteBundle(routeId: string): Promise<boolean> {
    try {
      const { request } = useApiClient();
      const response = await request<{ success: boolean; data: Record<string, unknown> }>(
        `/api/v1/route/${routeId}/offline-bundle`,
      );
      if (response.data) {
        await saveRoute(routeId, response.data);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  async function getSavedRouteIds(): Promise<string[]> {
    const db = await openDB();
    const tx = db.transaction("routes", "readonly");
    const req = tx.objectStore("routes").getAllKeys();
    return new Promise((resolve) => {
      req.onsuccess = () => resolve(req.result as string[]);
      req.onerror = () => resolve([]);
    });
  }

  return {
    isOnline,
    initListeners,
    saveRoute,
    getRoute,
    saveLocation,
    getLocation,
    downloadRouteBundle,
    getSavedRouteIds,
  };
}
