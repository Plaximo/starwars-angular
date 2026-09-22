import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, of, take } from 'rxjs';
import { SwapiPeopleRepository } from '../../../core/api/swapi/swapi-people.repository';
import { IPeopleRepository } from '../../../core/api/repository.interface';
import { PeopleBookmarkService } from './people-bookmark.service';
import { UndoToastService } from '../../../shared/services/undo-toast.service';
import { ErrorToastService } from '../../../shared/services/error-toast.service';
import { TranslationService } from '../../../core/i18n/translation.service';
import { ModalState } from '../../../shared/utils/modal-state';
import { People } from '../../../core/models';
import { SortField, SortDirection } from '../models/people-filter.model';
import { PersonFormPayload } from '../models/person-form.model';
import { filterPeople, sortPeople } from '../utils/people-filter.utils';

@Injectable({ providedIn: 'root' })
export class PeopleListViewModel {
  private readonly destroyRef = inject(DestroyRef);
  private readonly peopleRepository: IPeopleRepository = inject(SwapiPeopleRepository);
  private readonly bookmarkService = inject(PeopleBookmarkService);
  private readonly undoToast = inject(UndoToastService);
  private readonly errorToast = inject(ErrorToastService);
  private readonly i18n = inject(TranslationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // Sub-State Managers
  private readonly modalState = new ModalState<People>();

  // Raw Data State
  readonly people = signal<People[]>([]);
  readonly isInitialLoading = signal<boolean>(true);
  readonly isLoading = computed(() => this.isInitialLoading() && this.people().length === 0);

  // Bookmarks State
  readonly bookmarkedIds = this.bookmarkService.bookmarkedIds;
  readonly onlyBookmarked = signal<boolean>(false);
  readonly bookmarkedCount = this.bookmarkService.count;

  // Filter & Sort UI State
  readonly search = signal<string>('');
  readonly gender = signal<string>('all');
  readonly sortBy = signal<SortField>('name');
  readonly sortDir = signal<SortDirection>('asc');

  // Modal State
  readonly isModalOpen = this.modalState.isOpen;
  readonly selectedPerson = this.modalState.selectedItem;

  // Undo & Error Toast States
  readonly lastDeletedId = this.undoToast.activeUndoId;
  readonly errorMessage = this.errorToast.activeMessage;
  readonly errorDetails = this.errorToast.activeDetails;

  // Derived Filtered & Sorted Character List
  readonly filteredPeople = computed(() => {
    const filtered = filterPeople(
      this.people(),
      this.search(),
      this.gender(),
      this.onlyBookmarked(),
      this.bookmarkedIds()
    );
    return sortPeople(filtered, this.sortBy(), this.sortDir());
  });

  readonly hasActiveFilters = computed(
    () => !!this.search() || this.gender() !== 'all' || this.sortBy() !== 'name' || this.sortDir() !== 'asc' || this.onlyBookmarked()
  );
  readonly totalCount = computed(() => this.people().length);
  readonly filteredCount = computed(() => this.filteredPeople().length);

  constructor() {
    this.initDataStream();
    this.initRouteParamsSync();
  }

  // --- Initializers ---

  private initDataStream(): void {
    this.peopleRepository
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => {
          this.people.set(data);
          this.isInitialLoading.set(false);
        }
      });
  }

  private initRouteParamsSync(): void {
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      if (params['search'] !== undefined) this.search.set(params['search']);
      if (params['gender'] !== undefined) this.gender.set(params['gender']);
      if (params['sortBy'] && ['name', 'height', 'mass', 'birthYear'].includes(params['sortBy'])) {
        this.sortBy.set(params['sortBy'] as SortField);
      }
      if (params['sortDir'] && ['asc', 'desc'].includes(params['sortDir'])) {
        this.sortDir.set(params['sortDir'] as SortDirection);
      }
      if (params['favorites'] !== undefined) {
        this.onlyBookmarked.set(params['favorites'] === 'true');
      }
    });
  }

  // --- Bookmarks & Filters ---

  isBookmarked(id: string): boolean {
    return this.bookmarkService.isBookmarked(id);
  }

  toggleBookmark(id: string): void {
    this.bookmarkService.toggleBookmark(id);
  }

  setOnlyBookmarked(enabled: boolean): void {
    this.onlyBookmarked.set(enabled);
    this.updateUrlParams();
  }

  setSearch(query: string): void {
    this.search.set(query);
    this.updateUrlParams(true);
  }

  setGender(gender: string): void {
    this.gender.set(gender);
    this.updateUrlParams();
  }

  setSortBy(field: SortField): void {
    if (this.sortBy() === field) {
      this.toggleSortDir();
    } else {
      this.sortBy.set(field);
      this.sortDir.set('asc');
      this.updateUrlParams();
    }
  }

  toggleSortDir(): void {
    this.sortDir.update(current => (current === 'asc' ? 'desc' : 'asc'));
    this.updateUrlParams();
  }

  resetFilters(): void {
    this.search.set('');
    this.gender.set('all');
    this.sortBy.set('name');
    this.sortDir.set('asc');
    this.onlyBookmarked.set(false);
    this.updateUrlParams();
  }

  // --- Modal Management ---

  openCreateModal(): void {
    this.modalState.openCreate();
  }

  openEditModal(person: People): void {
    this.modalState.openEdit(person);
  }

  closeModal(): void {
    this.modalState.close();
  }

  // --- CRUD Operations with Optimistic Updates & Snapshot Rollback ---

  savePerson(payload: PersonFormPayload): void {
    const current = this.selectedPerson();
    this.closeModal();

    if (current) {
      this.updatePersonOptimistic(current, payload);
    } else {
      this.createPersonRecord(payload);
    }
  }

  private updatePersonOptimistic(current: People, payload: PersonFormPayload): void {
    const snapshot = this.people();
    const updated: People = { ...current, ...payload, edited: new Date().toISOString() };

    this.people.update(list => list.map(p => (p.id === current.id ? updated : p)));

    this.peopleRepository
      .update(current.id, payload)
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (err: any) => {
          this.people.set(snapshot);
          this.errorToast.trigger(
            this.i18n.t().errorSavingPerson(current.name),
            err?.message || this.i18n.t().rollbackReverted
          );
        }
      });
  }

  private createPersonRecord(payload: PersonFormPayload): void {
    this.peopleRepository
      .create(payload)
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (err: any) => {
          this.errorToast.trigger(this.i18n.t().errorCreatingPerson, err?.message);
        }
      });
  }

  deletePersonWithConfirm(id: string): void {
    const confirmed = window.confirm(this.i18n.t().deleteConfirm);
    if (confirmed) {
      this.deletePersonOptimistic(id);
    }
  }

  private deletePersonOptimistic(id: string): void {
    const snapshot = this.people();
    const target = snapshot.find(p => p.id === id);

    this.people.update(list => list.filter(p => p.id !== id));

    this.peopleRepository
      .delete(id)
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.undoToast.trigger(id),
        error: (err: any) => {
          this.people.set(snapshot);
          this.errorToast.trigger(
            this.i18n.t().errorDeletingPerson(target?.name ?? 'ID #' + id),
            err?.message || this.i18n.t().rollbackRestored
          );
        }
      });
  }

  undoLastDelete(): void {
    const id = this.lastDeletedId();
    if (!id || !this.peopleRepository.undoDelete) return;

    this.peopleRepository
      .undoDelete(id)
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.undoToast.dismiss(),
        error: err => console.error('Failed to undo delete:', err)
      });
  }

  dismissUndo(): void {
    this.undoToast.dismiss();
  }

  dismissError(): void {
    this.errorToast.dismiss();
  }

  private updateUrlParams(replaceUrl = false): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        search: this.search() || null,
        gender: this.gender() !== 'all' ? this.gender() : null,
        sortBy: this.sortBy() !== 'name' ? this.sortBy() : null,
        sortDir: this.sortDir() !== 'asc' ? this.sortDir() : null,
        favorites: this.onlyBookmarked() ? 'true' : null
      },
      queryParamsHandling: 'merge',
      replaceUrl
    });
  }
}
