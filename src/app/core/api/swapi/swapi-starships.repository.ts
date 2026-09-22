import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { Starship } from '../../models';
import { IStarshipRepository } from '../repository.interface';
import { SwapiService } from './swapi.service';
import { mapSwapiStarshipToStarship, mapSwapiStarshipsToStarships } from './mapper/starships.mapper';
import { LocalStorageService } from '../../storage/local-storage.service';
import { OnlineStatusService } from '../../services/online-status.service';

const STORAGE_KEY_STARSHIPS = 'sw_cached_starships';

@Injectable({ providedIn: 'root' })
export class SwapiStarshipsRepository implements IStarshipRepository {
  private readonly swapi = inject(SwapiService);
  private readonly storage = inject(LocalStorageService);
  private readonly onlineStatus = inject(OnlineStatusService);

  getAll(): Observable<Starship[]> {
    const cached = this.storage.getItem<Starship[]>(STORAGE_KEY_STARSHIPS, []);

    if (this.onlineStatus.isOffline() && cached.length > 0) {
      return of(cached);
    }

    return this.swapi.getAllStarships().pipe(
      map(dtos => mapSwapiStarshipsToStarships(dtos)),
      tap(starships => this.storage.setItem(STORAGE_KEY_STARSHIPS, starships)),
      catchError(err => {
        console.warn('Starships fetch failed, using offline cache:', err);
        return of(this.storage.getItem<Starship[]>(STORAGE_KEY_STARSHIPS, []));
      })
    );
  }

  getById(id: string): Observable<Starship> {
    return this.getByIdOrUrl(id);
  }

  getByIdOrUrl(idOrUrl: string): Observable<Starship> {
    const cached = this.storage.getItem<Starship[]>(STORAGE_KEY_STARSHIPS, []);
    const foundInCache = cached.find(s => s.id === idOrUrl || s.url === idOrUrl);

    if (this.onlineStatus.isOffline() && foundInCache) {
      return of(foundInCache);
    }

    return this.swapi.getStarshipByIdOrUrl(idOrUrl).pipe(
      map(dto => mapSwapiStarshipToStarship(dto)),
      tap(starship => {
        // Update item in cached list if not already present
        const currentCached = this.storage.getItem<Starship[]>(STORAGE_KEY_STARSHIPS, []);
        const idx = currentCached.findIndex(s => s.id === starship.id);
        if (idx === -1) {
          currentCached.push(starship);
          this.storage.setItem(STORAGE_KEY_STARSHIPS, currentCached);
        }
      }),
      catchError(err => {
        if (foundInCache) {
          return of(foundInCache);
        }
        throw err;
      })
    );
  }
}
