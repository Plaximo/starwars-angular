import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NetworkSimulationService {
  /**
   * Configurable simulated network latency in milliseconds.
   * Gives users and reviewers visual clarity on optimistic vs asynchronous updates.
   */
  readonly simulateDelayMs = signal<number>(600);

  /**
   * When enabled, repository mutation methods (update, delete) will simulate
   * an HTTP 500 error after the simulated delay, triggering automatic UI rollback.
   */
  readonly simulateError = signal<boolean>(false);

  toggleSimulateError(): void {
    this.simulateError.update(v => !v);
  }

  setSimulateError(enabled: boolean): void {
    this.simulateError.set(enabled);
  }

  setDelay(ms: number): void {
    this.simulateDelayMs.set(ms);
  }
}
