export interface SCIRepository<T extends { id: string }> {
  list(): T[];
  getById(id: string): T | null;
  upsert(entity: T): T;
  remove(id: string): void;
  clear(): void;
}

export function createLocalStorageRepository<T extends { id: string }>(
  storageKey: string
): SCIRepository<T> {
  function read(): T[] {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];

    try {
      return JSON.parse(raw) as T[];
    } catch {
      return [];
    }
  }

  function write(items: T[]) {
    localStorage.setItem(storageKey, JSON.stringify(items));
  }

  return {
    list() {
      return read();
    },

    getById(id: string) {
      return read().find((item) => item.id === id) ?? null;
    },

    upsert(entity: T) {
      const current = read();
      const exists = current.some((item) => item.id === entity.id);
      const next = exists
        ? current.map((item) => (item.id === entity.id ? entity : item))
        : [entity, ...current];

      write(next);
      return entity;
    },

    remove(id: string) {
      write(read().filter((item) => item.id !== id));
    },

    clear() {
      localStorage.removeItem(storageKey);
    },
  };
}
