import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ErrorToastService {
  private timerId: ReturnType<typeof setTimeout> | null = null;

  readonly activeMessage = signal<string | null>(null);
  readonly activeDetails = signal<string | null>(null);

  /**
   * Triggers an error / rollback toast with an auto-dismiss timer.
   */
  trigger(message: string, details: string | null = null, durationMs = 4000): void {
    if (this.timerId) {
      clearTimeout(this.timerId);
    }

    this.activeMessage.set(message);
    this.activeDetails.set(details);

    this.timerId = setTimeout(() => {
      this.dismiss();
    }, durationMs);
  }

  dismiss(): void {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.activeMessage.set(null);
    this.activeDetails.set(null);
  }
}
