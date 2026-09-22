import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { Planet } from '../../models';
import { IPlanetRepository } from '../repository.interface';
import { SwapiService } from './swapi.service';
import { mapSwapiPlanetToPlanet, mapSwapiPlanetsToPlanets } from './mapper/planets.mapper';
import { LocalStorageService } from '../../storage/local-storage.service';
import { OnlineStatusService } from '../../services/online-status.service';

const STORAGE_KEY_PLANETS = 'sw_cached_planets';

@Injectable({ providedIn: 'root' })
export class SwapiPlanetsRepository implements IPlanetRepository {
  private readonly swapi = inject(SwapiService);
  private readonly storage = inject(LocalStorageService);
  private readonly onlineStatus = inject(OnlineStatusService);

  getAll(): Observable<Planet[]> {
    const cached = this.storage.getItem<Planet[]>(STORAGE_KEY_PLANETS, []);

    if (this.onlineStatus.isOffline() && cached.length > 0) {
      return of(cached);
    }

    return this.swapi.getAllPlanets().pipe(
      map(dtos => mapSwapiPlanetsToPlanets(dtos)),
      tap(planets => this.storage.setItem(STORAGE_KEY_PLANETS, planets)),
      catchError(err => {
        console.warn('Planets fetch failed, using offline cache:', err);
        return of(this.storage.getItem<Planet[]>(STORAGE_KEY_PLANETS, []));
      })
    );
  }

  getById(id: string): Observable<Planet> {
    return this.getByIdOrUrl(id);
  }

  getByIdOrUrl(idOrUrl: string): Observable<Planet> {
    const cached = this.storage.getItem<Planet[]>(STORAGE_KEY_PLANETS, []);
    const foundInCache = cached.find(p => p.id === idOrUrl || p.url === idOrUrl);

    if (this.onlineStatus.isOffline() && foundInCache) {
      return of(foundInCache);
    }

    return this.swapi.getPlanetByIdOrUrl(idOrUrl).pipe(
      map(dto => mapSwapiPlanetToPlanet(dto)),
      catchError(err => {
        if (foundInCache) {
          return of(foundInCache);
        }
        throw err;
      })
    );
  }
}
