import { Observable, catchError, of, tap } from 'rxjs';
import { LocalStorageService } from '../storage/local-storage.service';

/**
 * Executes a network fetch with automatic LocalStorage caching and offline fallback.
 */
export function fetchWithOfflineCache<T>(
  storage: LocalStorageService,
  storageKey: string,
  isOffline: boolean,
  networkFetch$: Observable<T>
): Observable<T> {
  const cached = storage.getItem<T | null>(storageKey, null);

  // If currently offline and cache exists, return immediately without network attempt
  if (isOffline && cached !== null) {
    return of(cached);
  }

  return networkFetch$.pipe(
    tap(data => storage.setItem(storageKey, data)),
    catchError(err => {
      if (cached !== null) {
        console.warn(`Fetch for [${storageKey}] failed. Falling back to offline cache.`, err);
        return of(cached);
      }
      throw err;
    })
  );
}

/**
 * Finds an entity by ID or URL from a cached array in LocalStorage.
 */
export function findInCache<T extends { id?: string; url?: string }>(
  storage: LocalStorageService,
  storageKey: string,
  idOrUrl: string
): T | undefined {
  const list = storage.getItem<T[]>(storageKey, []);
  return list.find(item => (item.id && item.id === idOrUrl) || (item.url && item.url === idOrUrl));
}

/**
 * Upserts a single entity into a cached list in LocalStorage.
 */
export function upsertInCache<T extends { id?: string; url?: string }>(
  storage: LocalStorageService,
  storageKey: string,
  item: T
): void {
  const list = storage.getItem<T[]>(storageKey, []);
  const index = list.findIndex(
    existing => (item.id && existing.id === item.id) || (item.url && existing.url === item.url)
  );
  if (index !== -1) {
    list[index] = item;
  } else {
    list.push(item);
  }
  storage.setItem(storageKey, list);
}
