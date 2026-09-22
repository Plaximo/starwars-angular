import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { Starship } from '../../models';
import { IStarshipRepository } from '../repository.interface';
import { SwapiService } from './swapi.service';
import { mapSwapiStarshipToStarship, mapSwapiStarshipsToStarships } from './mapper/starships.mapper';
import { LocalStorageService } from '../../storage/local-storage.service';
import { OnlineStatusService } from '../../services/online-status.service';
import { fetchWithOfflineCache, findInCache, upsertInCache } from '../repository-cache.utils';

const CACHE_KEY = 'sw_cached_starships';

@Injectable({ providedIn: 'root' })
export class SwapiStarshipsRepository implements IStarshipRepository {
  private readonly swapi = inject(SwapiService);
  private readonly storage = inject(LocalStorageService);
  private readonly onlineStatus = inject(OnlineStatusService);

  getAll(): Observable<Starship[]> {
    return fetchWithOfflineCache(
      this.storage,
      CACHE_KEY,
      this.onlineStatus.isOffline(),
      this.swapi.getAllStarships().pipe(map(mapSwapiStarshipsToStarships))
    );
  }

  getById(id: string): Observable<Starship> {
    return this.getByIdOrUrl(id);
  }

  getByIdOrUrl(idOrUrl: string): Observable<Starship> {
    const cached = findInCache<Starship>(this.storage, CACHE_KEY, idOrUrl);
    if (this.onlineStatus.isOffline() && cached) {
      return of(cached);
    }

    return this.swapi.getStarshipByIdOrUrl(idOrUrl).pipe(
      map(mapSwapiStarshipToStarship),
      tap(ship => upsertInCache(this.storage, CACHE_KEY, ship)),
      catchError(err => (cached ? of(cached) : Promise.reject(err)))
    );
  }
}
