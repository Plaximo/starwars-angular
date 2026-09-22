import { Injectable, computed, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OnlineStatusService {
  private readonly browserOnline = signal<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  /**
   * Mock offline mode toggle for quick demonstration in presentations
   */
  private readonly mockOffline = signal<boolean>(false);

  /**
   * True if device is online AND mock offline is NOT forced
   */
  readonly isOnline = computed(() => this.browserOnline() && !this.mockOffline());

  /**
   * True if device is offline OR mock offline is forced
   */
  readonly isOffline = computed(() => !this.isOnline());

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.browserOnline.set(true));
      window.addEventListener('offline', () => this.browserOnline.set(false));
    }
  }

  toggleMockOffline(): void {
    this.mockOffline.update(v => !v);
  }
}
