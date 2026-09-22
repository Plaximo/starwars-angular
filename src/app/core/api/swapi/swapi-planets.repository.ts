import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Planet } from '../../models';
import { IPlanetRepository } from '../repository.interface';
import { SwapiService } from './swapi.service';
import { mapSwapiPlanetToPlanet, mapSwapiPlanetsToPlanets } from './mapper/planets.mapper';

@Injectable({ providedIn: 'root' })
export class SwapiPlanetsRepository implements IPlanetRepository {
  private readonly swapi = inject(SwapiService);

  getAll(): Observable<Planet[]> {
    return this.swapi.getAllPlanets().pipe(
      map(dtos => mapSwapiPlanetsToPlanets(dtos))
    );
  }

  getById(id: string): Observable<Planet> {
    return this.getByIdOrUrl(id);
  }

  getByIdOrUrl(idOrUrl: string): Observable<Planet> {
    return this.swapi.getPlanetByIdOrUrl(idOrUrl).pipe(
      map(dto => mapSwapiPlanetToPlanet(dto))
    );
  }
}
