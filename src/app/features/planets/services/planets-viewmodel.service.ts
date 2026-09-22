import { Injectable, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { SwapiPlanetsRepository } from '../../../core/api/swapi/swapi-planets.repository';
import { IPlanetRepository } from '../../../core/api/repository.interface';
import { compareNullableNumbers, compareStrings, SortDirection } from '../../../shared/utils/sort.utils';
import { Planet } from '../../../core/models';

export type PlanetSortField = 'name' | 'population' | 'diameter';
export type PlanetSortDirection = SortDirection;

@Injectable({ providedIn: 'root' })
export class PlanetsViewmodel {
  private readonly planetsRepo: IPlanetRepository = inject(SwapiPlanetsRepository);

  // Raw Data from repository
  readonly planets = toSignal(this.planetsRepo.getAll(), { initialValue: [] as Planet[] });
  readonly isLoading = computed(() => this.planets().length === 0);

  // UI State Signals
  readonly search = signal<string>('');
  readonly climate = signal<string>('all');
  readonly sortBy = signal<PlanetSortField>('name');
  readonly sortDir = signal<PlanetSortDirection>('asc');

  // Filtered and sorted planets
  readonly filteredPlanets = computed(() => {
    const list = this.planets();
    const query = this.search().toLowerCase().trim();
    const climateFilter = this.climate().toLowerCase().trim();
    const sortField = this.sortBy();
    const dir = this.sortDir();

    // 1. Filter by search & climate
    const filtered = list.filter(planet => {
      const matchesSearch = !query || planet.name.toLowerCase().includes(query) || planet.terrain.toLowerCase().includes(query);
      const matchesClimate =
        climateFilter === 'all' ||
        planet.climate.toLowerCase().includes(climateFilter);

      return matchesSearch && matchesClimate;
    });

    // 2. Sort results using shared sort utilities
    return filtered.slice().sort((a, b) => {
      switch (sortField) {
        case 'name':
          return compareStrings(a.name, b.name, dir);
        case 'population':
          return compareNullableNumbers(
            a.population === 'unknown' ? null : Number(a.population),
            b.population === 'unknown' ? null : Number(b.population),
            dir
          );
        case 'diameter':
          return compareNullableNumbers(
            a.diameter === 'unknown' ? null : Number(a.diameter),
            b.diameter === 'unknown' ? null : Number(b.diameter),
            dir
          );
        default:
          return 0;
      }
    });
  });

  readonly totalCount = computed(() => this.planets().length);
  readonly filteredCount = computed(() => this.filteredPlanets().length);
  readonly hasActiveFilters = computed(
    () => !!this.search() || this.climate() !== 'all' || this.sortBy() !== 'name' || this.sortDir() !== 'asc'
  );

  // Actions
  setSearch(query: string): void {
    this.search.set(query);
  }

  setClimate(climate: string): void {
    this.climate.set(climate);
  }

  setSortBy(field: PlanetSortField): void {
    if (this.sortBy() === field) {
      this.toggleSortDir();
    } else {
      this.sortBy.set(field);
      this.sortDir.set('asc');
    }
  }

  toggleSortDir(): void {
    this.sortDir.update(dir => (dir === 'asc' ? 'desc' : 'asc'));
  }

  resetFilters(): void {
    this.search.set('');
    this.climate.set('all');
    this.sortBy.set('name');
    this.sortDir.set('asc');
  }
}
