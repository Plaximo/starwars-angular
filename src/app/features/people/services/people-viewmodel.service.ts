import { Injectable, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { SwapiPeopleRepository } from '../../../core/api/swapi/swapi-people.repository';
import { IPeopleRepository } from '../../../core/api/repository.interface';
import { People } from '../../../core/models';
import { SortField, SortDirection } from '../models/people-filter.model';

@Injectable({ providedIn: 'root' })
export class PeopleViewmodel {
  private readonly peopleRepository: IPeopleRepository = inject(SwapiPeopleRepository);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // Raw Data
  readonly people = toSignal(this.peopleRepository.getAll(), { initialValue: [] });
  readonly isLoading = computed(() => this.people().length === 0);

  // UI State Signals
  readonly search = signal<string>('');
  readonly gender = signal<string>('all');
  readonly sortBy = signal<SortField>('name');
  readonly sortDir = signal<SortDirection>('asc');

  constructor() {
    // Synchronize initial state from URL Query Parameters
    this.route.queryParams.subscribe(params => {
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
    });
  }

  // Derived filtered & sorted list
  readonly filteredPeople = computed(() => {
    const list = this.people();
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
      this.sortDir() !== 'asc'
    );
  });

  readonly totalCount = computed(() => this.people().length);
  readonly filteredCount = computed(() => this.filteredPeople().length);

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
    this.updateUrlParams(false);
  }

  // Synchronize state back into URL query parameters
  private updateUrlParams(replaceUrl = false): void {
    const queryParams: Record<string, string | null> = {
      search: this.search() ? this.search() : null,
      gender: this.gender() !== 'all' ? this.gender() : null,
      sortBy: this.sortBy() !== 'name' ? this.sortBy() : null,
      sortDir: this.sortDir() !== 'asc' ? this.sortDir() : null
    };

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl
    });
  }
}
