import { signal } from '@angular/core';

/**
 * Reusable modal state manager for Create / Edit entity flows.
 */
export class ModalState<T> {
  readonly isOpen = signal<boolean>(false);
  readonly selectedItem = signal<T | null>(null);

  openCreate(): void {
    this.selectedItem.set(null);
    this.isOpen.set(true);
  }

  openEdit(item: T): void {
    this.selectedItem.set(item);
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
    this.selectedItem.set(null);
  }
}
