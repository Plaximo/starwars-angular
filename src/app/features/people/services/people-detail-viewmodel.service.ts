import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription, forkJoin, of, Observable } from 'rxjs';
import { catchError, map, take } from 'rxjs/operators';
import { People, Planet, Starship } from '../../../core/models';
import { IPeopleRepository, IPlanetRepository, IStarshipRepository } from '../../../core/api/repository.interface';
import { SwapiPeopleRepository } from '../../../core/api/swapi/swapi-people.repository';
import { SwapiPlanetsRepository } from '../../../core/api/swapi/swapi-planets.repository';
import { SwapiStarshipsRepository } from '../../../core/api/swapi/swapi-starships.repository';
import { PeopleBookmarkService } from './people-bookmark.service';
import { PersonFormPayload } from '../models/person-form.model';
import { ErrorToastService } from '../../../shared/services/error-toast.service';

@Injectable({ providedIn: 'root' })
export class PeopleDetailViewModel {
  private readonly destroyRef = inject(DestroyRef);
  private readonly peopleRepo: IPeopleRepository = inject(SwapiPeopleRepository);
  private readonly planetRepo: IPlanetRepository = inject(SwapiPlanetsRepository);
  private readonly starshipRepo: IStarshipRepository = inject(SwapiStarshipsRepository);
  private readonly bookmarkService = inject(PeopleBookmarkService);
  private readonly errorToast = inject(ErrorToastService);
  private readonly router = inject(Router);

  // Subscriptions
  private loadSub?: Subscription;
  private relationsSub?: Subscription;

  // State Signals
  readonly person = signal<People | null>(null);
  readonly homeworld = signal<Planet | null>(null);
  readonly starships = signal<Starship[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly isLoadingRelations = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly isEditModalOpen = signal<boolean>(false);

  // Error / Rollback Toast State
  readonly errorMessage = this.errorToast.activeMessage;
  readonly errorDetails = this.errorToast.activeDetails;

  loadPerson(id: string): void {
    this.resetState();

    this.loadSub = this.peopleRepo
      .getById(id)
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: person => {
          this.person.set(person);
          this.isLoading.set(false);
          this.resolveRelations(person);
        },
        error: () => {
          this.error.set(`Character #${id} could not be retrieved from the archives.`);
          this.isLoading.set(false);
        }
      });
  }

  private resetState(): void {
    this.loadSub?.unsubscribe();
    this.relationsSub?.unsubscribe();
    this.isLoading.set(true);
    this.error.set(null);
    this.person.set(null);
    this.homeworld.set(null);
    this.starships.set([]);
  }

  // --- Modal & Error Controls ---

  openEditModal(): void {
    this.isEditModalOpen.set(true);
  }

  closeEditModal(): void {
    this.isEditModalOpen.set(false);
  }

  dismissError(): void {
    this.errorToast.dismiss();
  }

  // --- Mutations with Optimistic Updates & Rollback ---

  saveEdit(payload: PersonFormPayload): void {
    const current = this.person();
    if (!current) return;
    this.closeEditModal();
    this.applyOptimisticEdit(current, payload);
  }

  private applyOptimisticEdit(current: People, payload: PersonFormPayload): void {
    const updated: People = { ...current, ...payload, edited: new Date().toISOString() };

    this.person.set(updated);
    this.resolveRelations(updated);

    this.peopleRepo
      .update(current.id, payload)
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: saved => this.person.set(saved),
        error: (err: any) => {
          this.person.set(current);
          this.resolveRelations(current);
          this.errorToast.trigger(
            `Fehler beim Speichern von "${current.name}"`,
            err?.message || 'Änderungen wurden per Rollback zurückgesetzt.'
          );
        }
      });
  }

  deleteWithConfirm(): void {
    const current = this.person();
    if (!current) return;

    const confirmed = window.confirm('Are you sure you want to delete this character record from the Holocron?');
    if (!confirmed) return;

    this.peopleRepo
      .delete(current.id)
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.router.navigate(['/'], { queryParamsHandling: 'preserve' }),
        error: (err: any) => {
          this.errorToast.trigger(`Löschen von "${current.name}" fehlgeschlagen!`, err?.message);
        }
      });
  }

  // --- Bookmarks ---

  isBookmarked(id: string): boolean {
    return this.bookmarkService.isBookmarked(id);
  }

  toggleBookmark(id: string): void {
    this.bookmarkService.toggleBookmark(id);
  }

  // --- Relational Entities Resolution ---

  private resolveRelations(person: People): void {
    this.relationsSub?.unsubscribe();
    this.isLoadingRelations.set(true);

    this.relationsSub = forkJoin({
      homeworld: this.resolveHomeworld(person.homeworldUrl),
      starships: this.resolveStarships(person.starships)
    })
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ homeworld, starships }) => {
          this.homeworld.set(homeworld);
          this.starships.set(starships);
          this.isLoadingRelations.set(false);
        },
        error: () => this.isLoadingRelations.set(false)
      });
  }

  private resolveHomeworld(url?: string): Observable<Planet | null> {
    if (!url) return of(null);
    return this.planetRepo.getByIdOrUrl(url).pipe(catchError(() => of(null)));
  }

  private resolveStarships(urls?: string[]): Observable<Starship[]> {
    if (!urls || urls.length === 0) return of([]);
    const requests$ = urls.map(url =>
      this.starshipRepo.getByIdOrUrl(url).pipe(catchError(() => of(null)))
    );
    return forkJoin(requests$).pipe(
      map(ships => (ships || []).filter((s): s is Starship => s !== null)),
      catchError(() => of([]))
    );
  }
}
