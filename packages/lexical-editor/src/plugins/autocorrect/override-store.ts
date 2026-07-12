const DEFAULT_OVERRIDE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

interface PersistedOverrideStore {
  expiresAt: number;
  ignoredTokens: string[];
  version: 1;
}

export interface AutoCorrectOverrideStore {
  add(token: string): void;
  clear(): void;
  has(token: string): boolean;
}

function normalizeTokenForStorage(token: string): string {
  return token.trim().toLocaleLowerCase("pt-BR");
}

function readPersistedStore(persist: boolean, storageKey: string): PersistedOverrideStore | null {
  if (!persist || typeof window === "undefined") {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(storageKey);
    if (!rawValue) {
      return null;
    }

    const parsed = JSON.parse(rawValue) as Partial<PersistedOverrideStore>;
    if (
      parsed.version !== 1 ||
      typeof parsed.expiresAt !== "number" ||
      !Array.isArray(parsed.ignoredTokens)
    ) {
      window.localStorage.removeItem(storageKey);
      return null;
    }

    if (parsed.expiresAt <= Date.now()) {
      window.localStorage.removeItem(storageKey);
      return null;
    }

    return {
      expiresAt: parsed.expiresAt,
      ignoredTokens: parsed.ignoredTokens.filter(
        (token): token is string => typeof token === "string",
      ),
      version: 1,
    };
  } catch {
    window.localStorage.removeItem(storageKey);
    return null;
  }
}

function persistStore(
  persist: boolean,
  storageKey: string,
  ignoredTokens: Set<string>,
  ttlMs: number,
) {
  if (!persist || typeof window === "undefined") {
    return;
  }

  const payload: PersistedOverrideStore = {
    expiresAt: Date.now() + ttlMs,
    ignoredTokens: Array.from(ignoredTokens).toSorted(),
    version: 1,
  };

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(payload));
  } catch {
    // Best-effort local persistence only.
  }
}

export function createAutoCorrectOverrideStore({
  persist = true,
  storageKey,
  ttlMs = DEFAULT_OVERRIDE_TTL_MS,
}: {
  persist?: boolean;
  storageKey: string;
  ttlMs?: number;
}): AutoCorrectOverrideStore {
  const persisted = readPersistedStore(persist, storageKey);
  const ignoredTokens = new Set(
    persisted?.ignoredTokens.map((token) => normalizeTokenForStorage(token)) ?? [],
  );

  return {
    add(token: string) {
      const normalized = normalizeTokenForStorage(token);
      if (!normalized) {
        return;
      }

      ignoredTokens.add(normalized);
      persistStore(persist, storageKey, ignoredTokens, ttlMs);
    },
    clear() {
      ignoredTokens.clear();
      if (persist && typeof window !== "undefined") {
        window.localStorage.removeItem(storageKey);
      }
    },
    has(token: string) {
      return ignoredTokens.has(normalizeTokenForStorage(token));
    },
  };
}
