import type { TodoItem } from "../../../types/todo";

const STORAGE_KEY = "home.todo.items";

export function loadFromStorage(): TodoItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as TodoItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (ignoreError) {
    return [];
  }
}

export function saveToStorage(items: TodoItem[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (ignoreError) {
    /* empty */
  }
}

export function generateId() {
  try {
    if (
      typeof window !== "undefined" &&
      window.crypto &&
      typeof window.crypto.randomUUID === "function"
    ) {
      return window.crypto.randomUUID();
    }
  } catch (ignoreError) {
    /* empty */
  }
  return `id_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
