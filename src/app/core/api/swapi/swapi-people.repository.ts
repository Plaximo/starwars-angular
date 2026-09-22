import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, map, of, switchMap, tap, timer, throwError } from 'rxjs';
import { People } from '../../models';
import { SwapiService } from './swapi.service';
import { mapSwapiPeopleToPeople } from './mapper/people.mapper';
import { IPeopleRepository } from '../repository.interface';
import { LocalStorageService } from '../../storage/local-storage.service';
import { NetworkSimulationService } from '../network-simulation.service';
import { OnlineStatusService } from '../../services/online-status.service';

const STORAGE_KEYS = {
  CUSTOM: 'sw_custom_people',
  EDITED: 'sw_edited_people',
  DELETED: 'sw_deleted_people',
  CACHED_BASE: 'sw_cached_base_people'
} as const;

@Injectable({ providedIn: 'root' })
export class SwapiPeopleRepository implements IPeopleRepository {
  private readonly swapi = inject(SwapiService);
  private readonly storage = inject(LocalStorageService);
  private readonly onlineStatus = inject(OnlineStatusService);
  readonly simulation = inject(NetworkSimulationService);

  // Cached base SWAPI items
  private baseSwapiPeople: People[] | null = null;

  // Emits the merged list (SWAPI + LocalStorage CRUD)
  private readonly peopleSubject = new BehaviorSubject<People[] | null>(null);

  getAll(): Observable<People[]> {
    if (this.peopleSubject.value !== null) {
      return this.peopleSubject.asObservable().pipe(
        map(people => people ?? [])
      );
    }

    // Fast-path: Check if offline and have cached data
    const cachedBase = this.storage.getItem<People[]>(STORAGE_KEYS.CACHED_BASE, []);
    if (this.onlineStatus.isOffline() && cachedBase.length > 0) {
      this.baseSwapiPeople = cachedBase;
      this.emitMergedState();
      return this.peopleSubject.asObservable().pipe(map(p => p ?? []));
    }

    return this.swapi.getAllPeople().pipe(
      map(dtos => mapSwapiPeopleToPeople(dtos)),
      tap(base => {
        this.baseSwapiPeople = base;
        // Persist to local offline cache
        this.storage.setItem(STORAGE_KEYS.CACHED_BASE, base);
        this.emitMergedState();
      }),
      catchError(err => {
        console.warn('Network request failed, falling back to offline cache:', err);
        const fallback = this.storage.getItem<People[]>(STORAGE_KEYS.CACHED_BASE, []);
        this.baseSwapiPeople = fallback;
        this.emitMergedState();
        return of([]);
      }),
      switchMap(() => this.peopleSubject.asObservable().pipe(map(p => p ?? [])))
    );
  }

  getById(id: string): Observable<People> {
    return this.getAll().pipe(
      map(all => {
        const found = all.find(p => p.id === id);
        if (!found) {
          throw new Error(`Person #${id} was not found.`);
        }
        return found;
      })
    );
  }

  create(data: Omit<People, 'id' | 'url'>): Observable<People> {
    const delayMs = this.simulation.simulateDelayMs();

    if (this.simulation.simulateError()) {
      return timer(delayMs).pipe(
        switchMap(() => throwError(() => new Error('Simulierter Netzwerkfehler beim Erstellen (HTTP 500: Server nicht erreichbar).')))
      );
    }

    const id = `custom_${Date.now()}`;
    const newPerson: People = {
      ...data,
      id,
      url: `https://local.app/people/${id}`,
      created: new Date().toISOString(),
      edited: new Date().toISOString(),
      isCustom: true
    };

    const customList = this.getCustomList();
    customList.unshift(newPerson);
    this.storage.setItem(STORAGE_KEYS.CUSTOM, customList);

    return timer(delayMs).pipe(
      tap(() => this.emitMergedState()),
      map(() => newPerson)
    );
  }

  update(id: string, changes: Partial<People>): Observable<People> {
    const delayMs = this.simulation.simulateDelayMs();

    if (this.simulation.simulateError()) {
      return timer(delayMs).pipe(
        switchMap(() => throwError(() => new Error('Simulierter Netzwerkfehler beim Speichern (HTTP 500: Server nicht erreichbar).')))
      );
    }

    const customList = this.getCustomList();
    const customIndex = customList.findIndex(p => p.id === id);

    let updated: People;

    if (customIndex !== -1) {
      // It's a custom-created person
      updated = {
        ...customList[customIndex],
        ...changes,
        edited: new Date().toISOString()
      };
      customList[customIndex] = updated;
      this.storage.setItem(STORAGE_KEYS.CUSTOM, customList);
    } else {
      // It's a SWAPI-based person: store override in edited map
      const editedMap = this.getEditedMap();
      const existing = editedMap[id] || {};
      const base = this.baseSwapiPeople?.find(p => p.id === id);

      updated = {
        ...(base as People),
        ...existing,
        ...changes,
        edited: new Date().toISOString()
      };

      editedMap[id] = {
        ...existing,
        ...changes,
        edited: updated.edited
      };
      this.storage.setItem(STORAGE_KEYS.EDITED, editedMap);
    }

    return timer(delayMs).pipe(
      tap(() => this.emitMergedState()),
      map(() => updated)
    );
  }

  delete(id: string): Observable<void> {
    const delayMs = this.simulation.simulateDelayMs();

    if (this.simulation.simulateError()) {
      return timer(delayMs).pipe(
        switchMap(() => throwError(() => new Error('Simulierter Netzwerkfehler beim Löschen (HTTP 500: Server nicht erreichbar).')))
      );
    }

    const customList = this.getCustomList();
    const customIndex = customList.findIndex(p => p.id === id);

    if (customIndex !== -1) {
      // Remove from custom entries
      customList.splice(customIndex, 1);
      this.storage.setItem(STORAGE_KEYS.CUSTOM, customList);
    } else {
      // SWAPI item: add to deleted blacklist
      const deletedIds = this.getDeletedIds();
      if (!deletedIds.includes(id)) {
        deletedIds.push(id);
        this.storage.setItem(STORAGE_KEYS.DELETED, deletedIds);
      }
    }

    return timer(delayMs).pipe(
      tap(() => this.emitMergedState()),
      map(() => void 0)
    );
  }

  undoDelete(id: string): Observable<void> {
    const deletedIds = this.getDeletedIds().filter(dId => dId !== id);
    this.storage.setItem(STORAGE_KEYS.DELETED, deletedIds);
    this.emitMergedState();
    return of(void 0);
  }

  // --- Helpers ---

  private getCustomList(): People[] {
    return this.storage.getItem<People[]>(STORAGE_KEYS.CUSTOM, []);
  }

  private getEditedMap(): Record<string, Partial<People>> {
    return this.storage.getItem<Record<string, Partial<People>>>(STORAGE_KEYS.EDITED, {});
  }

  private getDeletedIds(): string[] {
    return this.storage.getItem<string[]>(STORAGE_KEYS.DELETED, []);
  }

  private emitMergedState(): void {
    if (!this.baseSwapiPeople) return;

    const customList = this.getCustomList();
    const editedMap = this.getEditedMap();
    const deletedSet = new Set(this.getDeletedIds());

    // Filter SWAPI people against deleted list & apply any edited overrides
    const mergedSwapi = this.baseSwapiPeople
      .filter(p => !deletedSet.has(p.id))
      .map(p => {
        const overrides = editedMap[p.id];
        return overrides ? { ...p, ...overrides } : p;
      });

    // Valid custom entries (also checked against deletedSet just in case)
    const validCustom = customList.filter(p => !deletedSet.has(p.id));

    // Custom entries appear at the top, followed by SWAPI entries
    this.peopleSubject.next([...validCustom, ...mergedSwapi]);
  }
}