const PREFIX = "wellstreet-cache:";

export function readCache(key, maxAgeMs = 0) {
  try {
    const raw = sessionStorage.getItem(`${PREFIX}${key}`);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;

    if (maxAgeMs > 0 && Date.now() - parsed.timestamp > maxAgeMs) {
      sessionStorage.removeItem(`${PREFIX}${key}`);
      return null;
    }

    return parsed.value;
  } catch {
    return null;
  }
}

export function writeCache(key, value) {
  try {
    sessionStorage.setItem(
      `${PREFIX}${key}`,
      JSON.stringify({
        timestamp: Date.now(),
        value,
      })
    );
  } catch {
    // Ignore cache write failures.
  }
}

export function clearCache(key) {
  try {
    sessionStorage.removeItem(`${PREFIX}${key}`);
  } catch {
    // Ignore cache removal failures.
  }
}
