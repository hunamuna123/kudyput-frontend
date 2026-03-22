export function useTelemetry() {
  const config = useRuntimeConfig();
  const baseUrl = config.public.apiBase as string;
  let watchId: number | null = null;

  const STORAGE_KEY = "dk_telemetry_consent";
  const INTERVAL_MS = 30_000; // 30 seconds

  function hasConsent(): boolean {
    if (import.meta.server) return false;
    return localStorage.getItem(STORAGE_KEY) === "true";
  }

  function grantConsent() {
    if (import.meta.server) return;
    localStorage.setItem(STORAGE_KEY, "true");
  }

  function revokeConsent() {
    if (import.meta.server) return;
    localStorage.removeItem(STORAGE_KEY);
    stopTracking();
  }

  async function sendPosition(lat: number, lon: number) {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;
      await $fetch(`${baseUrl}/api/v1/telemetry/position`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: { latitude: lat, longitude: lon, timestamp: Date.now() },
      });
    } catch {
      // Silently fail — telemetry is best-effort
    }
  }

  function startTracking() {
    if (import.meta.server) return;
    if (!hasConsent()) return;
    if (!navigator.geolocation) return;
    if (watchId !== null) return;

    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        sendPosition(pos.coords.latitude, pos.coords.longitude);
      },
      () => { /* Geolocation error — silently ignore */ },
      {
        enableHighAccuracy: false,
        maximumAge: INTERVAL_MS,
        timeout: 10_000,
      },
    );
  }

  function stopTracking() {
    if (watchId !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
    }
  }

  return {
    hasConsent,
    grantConsent,
    revokeConsent,
    sendPosition,
    startTracking,
    stopTracking,
  };
}
