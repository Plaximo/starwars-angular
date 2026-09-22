import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription, forkJoin, of, Observable } from 'rxjs';
import { catchError, take } from 'rxjs/operators';
import { People, Planet, Starship } from '../../../core/models';
import { IPeopleRepository, IPlanetRepository, IStarshipRepository } from '../../../core/api/repository.interface';
import { SwapiPeopleRepository } from '../../../core/api/swapi/swapi-people.repository';
import { SwapiPlanetsRepository } from '../../../core/api/swapi/swapi-planets.repository';
import { SwapiStarshipsRepository } from '../../../core/api/swapi/swapi-starships.repository';
import { PeopleBookmarkService } from './people-bookmark.service';
import { PersonFormPayload } from '../models/person-form.model';

@Injectable({ providedIn: 'root' })
export class PeopleDetailViewModel {
  // Uses exclusively repositories, NO direct SwapiService in ViewModel or Component!
  private readonly destroyRef = inject(DestroyRef);
  private readonly peopleRepo: IPeopleRepository = inject(SwapiPeopleRepository);
  private readonly planetRepo: IPlanetRepository = inject(SwapiPlanetsRepository);
  private readonly starshipRepo: IStarshipRepository = inject(SwapiStarshipsRepository);
  private readonly bookmarkService = inject(PeopleBookmarkService);
  private readonly router = inject(Router);

  // Subscription management
  private loadSub?: Subscription;
  private relationsSub?: Subscription;

  // State Signals
  readonly person = signal<People | null>(null);
  readonly homeworld = signal<Planet | null>(null);
  readonly starships = signal<Starship[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly isLoadingRelations = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  // Edit Modal State
  readonly isEditModalOpen = signal<boolean>(false);

  /**
   * Loads a person and resolves all relational entities (Homeworld planet, Piloted starships)
   */
  loadPerson(id: string): void {
    // Cancel any in-flight requests for prior character
    this.loadSub?.unsubscribe();
    this.relationsSub?.unsubscribe();

    this.isLoading.set(true);
    this.error.set(null);
    this.person.set(null);
    this.homeworld.set(null);
    this.starships.set([]);

    this.loadSub = this.peopleRepo
      .getById(id)
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (person) => {
          this.person.set(person);
          this.isLoading.set(false);
          this.resolveRelations(person);
        },
        error: (err) => {
          console.error('Failed to load person:', err);
          this.error.set(`Character #${id} could not be retrieved from the archives.`);
          this.isLoading.set(false);
        }
      });
  }

  openEditModal(): void {
    this.isEditModalOpen.set(true);
  }

  closeEditModal(): void {
    this.isEditModalOpen.set(false);
  }

  saveEdit(payload: PersonFormPayload): void {
    const p = this.person();
    if (!p) return;

    this.peopleRepo
      .update(p.id, payload)
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.person.set(updated);
          this.closeEditModal();
          this.resolveRelations(updated);
        },
        error: (err) => console.error('Failed to update character:', err)
      });
  }

  deleteWithConfirm(): void {
    const p = this.person();
    if (!p) return;

    const confirmed = window.confirm('Are you sure you want to delete this character record from the Holocron?');
    if (!confirmed) return;

    this.peopleRepo
      .delete(p.id)
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.router.navigate(['/'], { queryParamsHandling: 'preserve' });
        },
        error: (err) => console.error('Failed to delete character:', err)
      });
  }

  // Bookmark Actions
  isBookmarked(id: string): boolean {
    return this.bookmarkService.isBookmarked(id);
  }

  toggleBookmark(id: string): void {
    this.bookmarkService.toggleBookmark(id);
  }

  private resolveRelations(person: People): void {
    this.relationsSub?.unsubscribe();
    this.isLoadingRelations.set(true);

    // 1. Resolve Homeworld via Planet Repository
    const homeworld$ = person.homeworldUrl
      ? this.planetRepo.getByIdOrUrl(person.homeworldUrl).pipe(
          catchError((err) => {
            console.warn('Homeworld load failed:', err);
            return of(null);
          })
        )
      : of(null);

    // 2. Resolve Starships via Starship Repository
    const starships$ = person.starships && person.starships.length > 0
      ? forkJoin(
          person.starships.map(url =>
            this.starshipRepo.getByIdOrUrl(url).pipe(
              catchError((err) => {
                console.warn('Starship load failed:', err);
                return of(null);
              })
            )
          )
        )
      : of([]);

    this.relationsSub = forkJoin({
      homeworld: homeworld$,
      starships: starships$
    })
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ homeworld, starships }) => {
          this.homeworld.set(homeworld);
          const validShips = (starships || []).filter((s): s is Starship => s !== null);
          this.starships.set(validShips);
          this.isLoadingRelations.set(false);
        },
        error: () => {
          this.isLoadingRelations.set(false);
        }
      });
  }
}
