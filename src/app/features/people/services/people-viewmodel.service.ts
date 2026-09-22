import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Observable, of, take } from 'rxjs';
import { SwapiPeopleRepository } from '../../../core/api/swapi/swapi-people.repository';
import { IPeopleRepository } from '../../../core/api/repository.interface';
import { PeopleBookmarkService } from './people-bookmark.service';
import { People } from '../../../core/models';
import { SortField, SortDirection } from '../models/people-filter.model';
import { PersonFormPayload } from '../models/person-form.model';

@Injectable({ providedIn: 'root' })
export class PeopleViewmodel {
  private readonly destroyRef = inject(DestroyRef);
  private readonly peopleRepository: IPeopleRepository = inject(SwapiPeopleRepository);
  private readonly bookmarkService = inject(PeopleBookmarkService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // Raw Data
  readonly people = toSignal(this.peopleRepository.getAll(), { initialValue: [] });
  readonly isLoading = computed(() => this.people().length === 0);

  // Bookmarks / Favorites Delegated State
  readonly bookmarkedIds = this.bookmarkService.bookmarkedIds;
  readonly onlyBookmarked = signal<boolean>(false);
  readonly bookmarkedCount = this.bookmarkService.count;

  // UI State Signals
  readonly search = signal<string>('');
  readonly gender = signal<string>('all');
  readonly sortBy = signal<SortField>('name');
  readonly sortDir = signal<SortDirection>('asc');

  // Modal & CRUD UI State
  readonly isModalOpen = signal<boolean>(false);
  readonly selectedPerson = signal<People | null>(null);
  readonly lastDeletedId = signal<string | null>(null);

  constructor() {
    // Synchronize initial state from URL Query Parameters with lifecycle management
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      if (params['search'] !== undefined) {
        this.search.set(params['search']);
      }
      if (params['gender'] !== undefined) {
        this.gender.set(params['gender']);
      }
      if (params['sortBy'] !== undefined && ['name', 'height', 'mass', 'birthYear'].includes(params['sortBy'])) {
        this.sortBy.set(params['sortBy'] as SortField);
      }
      if (params['sortDir'] !== undefined && ['asc', 'desc'].includes(params['sortDir'])) {
        this.sortDir.set(params['sortDir'] as SortDirection);
      }
      if (params['favorites'] !== undefined) {
        this.onlyBookmarked.set(params['favorites'] === 'true');
      }
    });
  }

  // Derived filtered & sorted list
  readonly filteredPeople = computed(() => {
    let list = this.people();

    // 0. Filter by Bookmarks / Favorites
    if (this.onlyBookmarked()) {
      const bookmarkedSet = new Set(this.bookmarkedIds());
      list = list.filter((p: People) => bookmarkedSet.has(p.id));
    }

    const query = this.search().toLowerCase().trim();
    const selectedGender = this.gender();
    const sortField = this.sortBy();
    const dir = this.sortDir();
    const multiplier = dir === 'asc' ? 1 : -1;

    // 1. Filter by Search Query & Gender
    const filtered = list.filter((p: People) => {
      const matchesSearch = !query || p.name.toLowerCase().includes(query);
      const matchesGender =
        selectedGender === 'all' ||
        (selectedGender === 'other'
          ? !['male', 'female', 'n/a'].includes(p.gender.toLowerCase())
          : p.gender.toLowerCase() === selectedGender.toLowerCase());

      return matchesSearch && matchesGender;
    });

    // 2. Sort results
    return filtered.slice().sort((a, b) => {
      if (sortField === 'name') {
        return multiplier * a.name.localeCompare(b.name);
      }

      if (sortField === 'height') {
        const valA = a.height;
        const valB = b.height;
        if (valA === null && valB === null) return 0;
        if (valA === null) return 1; // nulls always at bottom
        if (valB === null) return -1;
        return multiplier * (valA - valB);
      }

      if (sortField === 'mass') {
        const valA = a.mass;
        const valB = b.mass;
        if (valA === null && valB === null) return 0;
        if (valA === null) return 1; // nulls always at bottom
        if (valB === null) return -1;
        return multiplier * (valA - valB);
      }

      if (sortField === 'birthYear') {
        const valA = a.birthYear;
        const valB = b.birthYear;
        if (valA === 'unknown' && valB === 'unknown') return 0;
        if (valA === 'unknown') return 1;
        if (valB === 'unknown') return -1;
        return multiplier * valA.localeCompare(valB, undefined, { numeric: true });
      }

      return 0;
    });
  });

  // Helper flags
  readonly hasActiveFilters = computed(() => {
    return (
      !!this.search() ||
      this.gender() !== 'all' ||
      this.sortBy() !== 'name' ||
      this.sortDir() !== 'asc' ||
      this.onlyBookmarked()
    );
  });

  readonly totalCount = computed(() => this.people().length);
  readonly filteredCount = computed(() => this.filteredPeople().length);

  // Bookmarks / Favorites Actions
  isBookmarked(id: string): boolean {
    return this.bookmarkService.isBookmarked(id);
  }

  toggleBookmark(id: string): void {
    this.bookmarkService.toggleBookmark(id);
  }

  setOnlyBookmarked(enabled: boolean): void {
    this.onlyBookmarked.set(enabled);
    this.updateUrlParams(false);
  }

  // User Actions
  setSearch(query: string): void {
    this.search.set(query);
    this.updateUrlParams(true);
  }

  setGender(gender: string): void {
    this.gender.set(gender);
    this.updateUrlParams(false);
  }

  setSortBy(field: SortField): void {
    if (this.sortBy() === field) {
      this.toggleSortDir();
    } else {
      this.sortBy.set(field);
      this.sortDir.set('asc');
      this.updateUrlParams(false);
    }
  }

  toggleSortDir(): void {
    this.sortDir.update(current => (current === 'asc' ? 'desc' : 'asc'));
    this.updateUrlParams(false);
  }

  resetFilters(): void {
    this.search.set('');
    this.gender.set('all');
    this.sortBy.set('name');
    this.sortDir.set('asc');
    this.onlyBookmarked.set(false);
    this.updateUrlParams(false);
  }

  // CRUD Operations
  createPerson(data: Omit<People, 'id' | 'url'>): Observable<People> {
    return this.peopleRepository.create(data);
  }

  updatePerson(id: string, changes: Partial<People>): Observable<People> {
    return this.peopleRepository.update(id, changes);
  }

  deletePerson(id: string): Observable<void> {
    return this.peopleRepository.delete(id);
  }

  undoDelete(id: string): Observable<void> {
    if (this.peopleRepository.undoDelete) {
      return this.peopleRepository.undoDelete(id);
    }
    return of(void 0);
  }

  // Modal & CRUD UI Actions
  openCreateModal(): void {
    this.selectedPerson.set(null);
    this.isModalOpen.set(true);
  }

  openEditModal(person: People): void {
    this.selectedPerson.set(person);
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.selectedPerson.set(null);
  }

  savePerson(payload: PersonFormPayload): void {
    const current = this.selectedPerson();
    if (current) {
      this.updatePerson(current.id, payload)
        .pipe(take(1), takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => this.closeModal(),
          error: (err) => console.error('Failed to update person:', err)
        });
    } else {
      this.createPerson(payload)
        .pipe(take(1), takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => this.closeModal(),
          error: (err) => console.error('Failed to create person:', err)
        });
    }
  }

  deletePersonWithConfirm(id: string): void {
    const confirmed = window.confirm('Are you sure you want to delete this character record from the Holocron?');
    if (!confirmed) return;

    this.deletePerson(id)
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.lastDeletedId.set(id);
          setTimeout(() => {
            if (this.lastDeletedId() === id) {
              this.lastDeletedId.set(null);
            }
          }, 6000);
        },
        error: (err) => console.error('Failed to delete person:', err)
      });
  }

  undoLastDelete(): void {
    const id = this.lastDeletedId();
    if (id) {
      this.undoDelete(id)
        .pipe(take(1), takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => this.lastDeletedId.set(null),
          error: (err) => console.error('Failed to undo delete:', err)
        });
    }
  }

  dismissUndo(): void {
    this.lastDeletedId.set(null);
  }

  // Synchronize state back into URL query parameters
  private updateUrlParams(replaceUrl = false): void {
    const queryParams: Record<string, string | null> = {
      search: this.search() ? this.search() : null,
      gender: this.gender() !== 'all' ? this.gender() : null,
      sortBy: this.sortBy() !== 'name' ? this.sortBy() : null,
      sortDir: this.sortDir() !== 'asc' ? this.sortDir() : null,
      favorites: this.onlyBookmarked() ? 'true' : null
    };

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl
    });
  }
}
