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

  private baseSwapiPeople: People[] | null = null;
  private readonly peopleSubject = new BehaviorSubject<People[] | null>(null);

  getAll(): Observable<People[]> {
    if (this.peopleSubject.value !== null) {
      return this.peopleSubject.asObservable().pipe(map(p => p ?? []));
    }

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
        this.storage.setItem(STORAGE_KEYS.CACHED_BASE, base);
        this.emitMergedState();
      }),
      catchError(() => {
        this.baseSwapiPeople = cachedBase;
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
        if (!found) throw new Error(`Person #${id} was not found.`);
        return found;
      })
    );
  }

  // --- CRUD Mutations ---

  create(data: Omit<People, 'id' | 'url'>): Observable<People> {
    return this.simulateNetworkMutation(
      () => this.createCustomPerson(data),
      'Simulierter Netzwerkfehler beim Erstellen (HTTP 500: Server nicht erreichbar).'
    );
  }

  update(id: string, changes: Partial<People>): Observable<People> {
    return this.simulateNetworkMutation(
      () => this.applyPersonChanges(id, changes),
      'Simulierter Netzwerkfehler beim Speichern (HTTP 500: Server nicht erreichbar).'
    );
  }

  delete(id: string): Observable<void> {
    return this.simulateNetworkMutation(
      () => this.removePerson(id),
      'Simulierter Netzwerkfehler beim Löschen (HTTP 500: Server nicht erreichbar).'
    );
  }

  undoDelete(id: string): Observable<void> {
    const deletedIds = this.getDeletedIds().filter(dId => dId !== id);
    this.storage.setItem(STORAGE_KEYS.DELETED, deletedIds);
    this.emitMergedState();
    return of(void 0);
  }

  // --- Mutation Helpers ---

  private simulateNetworkMutation<T>(action: () => T, errorMessage: string): Observable<T> {
    const delayMs = this.simulation.simulateDelayMs();
    if (this.simulation.simulateError()) {
      return timer(delayMs).pipe(
        switchMap(() => throwError(() => new Error(errorMessage)))
      );
    }

    const result = action();
    return timer(delayMs).pipe(
      tap(() => this.emitMergedState()),
      map(() => result)
    );
  }

  private createCustomPerson(data: Omit<People, 'id' | 'url'>): People {
    const id = `custom_${Date.now()}`;
    const newPerson: People = {
      ...data,
      id,
      url: `https://local.app/people/${id}`,
      created: new Date().toISOString(),
      edited: new Date().toISOString(),
      isCustom: true
    };

    const list = this.getCustomList();
    list.unshift(newPerson);
    this.storage.setItem(STORAGE_KEYS.CUSTOM, list);
    return newPerson;
  }

  private applyPersonChanges(id: string, changes: Partial<People>): People {
    const customList = this.getCustomList();
    const customIndex = customList.findIndex(p => p.id === id);

    if (customIndex !== -1) {
      const updated = { ...customList[customIndex], ...changes, edited: new Date().toISOString() };
      customList[customIndex] = updated;
      this.storage.setItem(STORAGE_KEYS.CUSTOM, customList);
      return updated;
    }

    const editedMap = this.getEditedMap();
    const existing = editedMap[id] || {};
    const base = this.baseSwapiPeople?.find(p => p.id === id);
    const updated = { ...(base as People), ...existing, ...changes, edited: new Date().toISOString() };

    editedMap[id] = { ...existing, ...changes, edited: updated.edited };
    this.storage.setItem(STORAGE_KEYS.EDITED, editedMap);
    return updated;
  }

  private removePerson(id: string): void {
    const customList = this.getCustomList();
    const customIndex = customList.findIndex(p => p.id === id);

    if (customIndex !== -1) {
      customList.splice(customIndex, 1);
      this.storage.setItem(STORAGE_KEYS.CUSTOM, customList);
    } else {
      const deletedIds = this.getDeletedIds();
      if (!deletedIds.includes(id)) {
        deletedIds.push(id);
        this.storage.setItem(STORAGE_KEYS.DELETED, deletedIds);
      }
    }
  }

  // --- Storage Accessors & State Merger ---

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

    const mergedSwapi = this.baseSwapiPeople
      .filter(p => !deletedSet.has(p.id))
      .map(p => (editedMap[p.id] ? { ...p, ...editedMap[p.id] } : p));

    const validCustom = customList.filter(p => !deletedSet.has(p.id));
    this.peopleSubject.next([...validCustom, ...mergedSwapi]);
  }
}