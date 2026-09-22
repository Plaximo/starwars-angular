import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Observable, of, take } from 'rxjs';
import { SwapiPeopleRepository } from '../../../core/api/swapi/swapi-people.repository';
import { IPeopleRepository } from '../../../core/api/repository.interface';
import { PeopleBookmarkService } from './people-bookmark.service';
import { UndoToastService } from '../../../shared/services/undo-toast.service';
import { ModalState } from '../../../shared/utils/modal-state';
import { compareAlphanumeric, compareNullableNumbers, compareStrings } from '../../../shared/utils/sort.utils';
import { People } from '../../../core/models';
import { SortField, SortDirection } from '../models/people-filter.model';
import { PersonFormPayload } from '../models/person-form.model';

@Injectable({ providedIn: 'root' })
export class PeopleViewmodel {
  private readonly destroyRef = inject(DestroyRef);
  private readonly peopleRepository: IPeopleRepository = inject(SwapiPeopleRepository);
  private readonly bookmarkService = inject(PeopleBookmarkService);
  private readonly undoToast = inject(UndoToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // Sub-State Managers (Extracted for clean modularity & reuse)
  private readonly modalState = new ModalState<People>();

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

  // Modal State (delegated)
  readonly isModalOpen = this.modalState.isOpen;
  readonly selectedPerson = this.modalState.selectedItem;

  // Undo Toast State (delegated)
  readonly lastDeletedId = this.undoToast.activeUndoId;

  constructor() {
    // Synchronize initial state from URL Query Parameters
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      if (params['search'] !== undefined) this.search.set(params['search']);
      if (params['gender'] !== undefined) this.gender.set(params['gender']);
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

    // 0. Filter by Bookmarks
    if (this.onlyBookmarked()) {
      const bookmarkedSet = new Set(this.bookmarkedIds());
      list = list.filter(p => bookmarkedSet.has(p.id));
    }

    const query = this.search().toLowerCase().trim();
    const selectedGender = this.gender().toLowerCase();
    const sortField = this.sortBy();
    const dir = this.sortDir();

    // 1. Filter by Search Query & Gender
    const filtered = list.filter(p => {
      const matchesSearch = !query || p.name.toLowerCase().includes(query);
      const genderLower = p.gender.toLowerCase();
      const matchesGender =
        selectedGender === 'all' ||
        (selectedGender === 'other'
          ? !['male', 'female', 'n/a'].includes(genderLower)
          : genderLower === selectedGender);

      return matchesSearch && matchesGender;
    });

    // 2. Sort results using shared sort utilities
    return filtered.slice().sort((a, b) => {
      switch (sortField) {
        case 'name':
          return compareStrings(a.name, b.name, dir);
        case 'height':
          return compareNullableNumbers(a.height, b.height, dir);
        case 'mass':
          return compareNullableNumbers(a.mass, b.mass, dir);
        case 'birthYear':
          return compareAlphanumeric(a.birthYear, b.birthYear, dir);
        default:
          return 0;
      }
    });
  });

  // Helper flags
  readonly hasActiveFilters = computed(
    () => !!this.search() || this.gender() !== 'all' || this.sortBy() !== 'name' || this.sortDir() !== 'asc' || this.onlyBookmarked()
  );

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

  // Filter Actions
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

  // Modal Actions
  openCreateModal(): void {
    this.modalState.openCreate();
  }

  openEditModal(person: People): void {
    this.modalState.openEdit(person);
  }

  closeModal(): void {
    this.modalState.close();
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

  savePerson(payload: PersonFormPayload): void {
    const current = this.selectedPerson();
    const op$ = current
      ? this.updatePerson(current.id, payload)
      : this.createPerson(payload);

    op$.pipe(take(1), takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => this.closeModal(),
      error: err => console.error('Failed to save person:', err)
    });
  }

  deletePersonWithConfirm(id: string): void {
    const confirmed = window.confirm('Are you sure you want to delete this character record from the Holocron?');
    if (!confirmed) return;

    this.deletePerson(id)
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.undoToast.trigger(id),
        error: err => console.error('Failed to delete person:', err)
      });
  }

  undoLastDelete(): void {
    const id = this.lastDeletedId();
    if (id) {
      this.undoDelete(id)
        .pipe(take(1), takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => this.undoToast.dismiss(),
          error: err => console.error('Failed to undo delete:', err)
        });
    }
  }

  dismissUndo(): void {
    this.undoToast.dismiss();
  }

  // URL Query Sync
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
