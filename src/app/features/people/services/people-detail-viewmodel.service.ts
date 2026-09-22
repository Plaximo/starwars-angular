import { Injectable, inject, signal } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { People, Planet, Starship } from '../../../core/models';
import { IPeopleRepository, IPlanetRepository, IStarshipRepository } from '../../../core/api/repository.interface';
import { SwapiPeopleRepository } from '../../../core/api/swapi/swapi-people.repository';
import { SwapiPlanetsRepository } from '../../../core/api/swapi/swapi-planets.repository';
import { SwapiStarshipsRepository } from '../../../core/api/swapi/swapi-starships.repository';

@Injectable({ providedIn: 'root' })
export class PeopleDetailViewmodel {
  // Uses exclusively repositories, NO direct SwapiService in ViewModel or Component!
  private readonly peopleRepo: IPeopleRepository = inject(SwapiPeopleRepository);
  private readonly planetRepo: IPlanetRepository = inject(SwapiPlanetsRepository);
  private readonly starshipRepo: IStarshipRepository = inject(SwapiStarshipsRepository);

  // State Signals
  readonly person = signal<People | null>(null);
  readonly homeworld = signal<Planet | null>(null);
  readonly starships = signal<Starship[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly isLoadingRelations = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  /**
   * Loads a person and resolves all relational entities (Homeworld planet, Piloted starships)
   */
  loadPerson(id: string): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.person.set(null);
    this.homeworld.set(null);
    this.starships.set([]);

    this.peopleRepo.getById(id).subscribe({
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

  private resolveRelations(person: People): void {
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

    forkJoin({
      homeworld: homeworld$,
      starships: starships$
    }).subscribe({
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
