import { DestroyRef, Injectable, inject, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UndoToastService {
  private readonly destroyRef = inject(DestroyRef);
  private timer: ReturnType<typeof setTimeout> | null = null;

  // Currently active item ID eligible for undo
  readonly activeUndoId = signal<string | null>(null);

  constructor() {
    this.destroyRef.onDestroy(() => this.clearTimer());
  }

  /**
   * Activates undo state for an entity ID for the given duration in ms.
   */
  trigger(id: string, durationMs = 6000): void {
    this.clearTimer();
    this.activeUndoId.set(id);

    this.timer = setTimeout(() => {
      if (this.activeUndoId() === id) {
        this.activeUndoId.set(null);
      }
    }, durationMs);
  }

  /**
   * Immediately dismisses the current undo opportunity.
   */
  dismiss(): void {
    this.clearTimer();
    this.activeUndoId.set(null);
  }

  private clearTimer(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}
