import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { Planet } from '../../models';
import { IPlanetRepository } from '../repository.interface';
import { SwapiService } from './swapi.service';
import { mapSwapiPlanetToPlanet, mapSwapiPlanetsToPlanets } from './mapper/planets.mapper';
import { LocalStorageService } from '../../storage/local-storage.service';
import { OnlineStatusService } from '../../services/online-status.service';
import { fetchWithOfflineCache, findInCache } from '../repository-cache.utils';

const CACHE_KEY = 'sw_cached_planets';

@Injectable({ providedIn: 'root' })
export class SwapiPlanetsRepository implements IPlanetRepository {
  private readonly swapi = inject(SwapiService);
  private readonly storage = inject(LocalStorageService);
  private readonly onlineStatus = inject(OnlineStatusService);

  getAll(): Observable<Planet[]> {
    return fetchWithOfflineCache(
      this.storage,
      CACHE_KEY,
      this.onlineStatus.isOffline(),
      this.swapi.getAllPlanets().pipe(map(mapSwapiPlanetsToPlanets))
    );
  }

  getById(id: string): Observable<Planet> {
    return this.getByIdOrUrl(id);
  }

  getByIdOrUrl(idOrUrl: string): Observable<Planet> {
    const cached = findInCache<Planet>(this.storage, CACHE_KEY, idOrUrl);
    if (this.onlineStatus.isOffline() && cached) {
      return of(cached);
    }

    return this.swapi.getPlanetByIdOrUrl(idOrUrl).pipe(
      map(mapSwapiPlanetToPlanet),
      catchError(err => (cached ? of(cached) : Promise.reject(err)))
    );
  }
}
