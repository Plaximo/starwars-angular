import { Injectable, computed, inject, signal } from '@angular/core';
import { LocalStorageService } from '../../../core/storage/local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class PeopleBookmarkService {
  private static readonly STORAGE_KEY = 'sw_bookmarked_people_ids';
  private readonly storage = inject(LocalStorageService);

  // State Signal holding bookmarked character IDs
  readonly bookmarkedIds = signal<string[]>(
    this.storage.getItem<string[]>(PeopleBookmarkService.STORAGE_KEY, [])
  );

  // Derived count of saved character bookmarks
  readonly count = computed(() => this.bookmarkedIds().length);

  isBookmarked(id: string): boolean {
    return this.bookmarkedIds().includes(id);
  }

  toggleBookmark(id: string): void {
    const current = this.bookmarkedIds();
    const next = current.includes(id)
      ? current.filter(item => item !== id)
      : [...current, id];

    this.bookmarkedIds.set(next);
    this.storage.setItem(PeopleBookmarkService.STORAGE_KEY, next);
  }

  clearAll(): void {
    this.bookmarkedIds.set([]);
    this.storage.removeItem(PeopleBookmarkService.STORAGE_KEY);
  }
}
