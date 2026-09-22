import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Starship } from '../../models';
import { IStarshipRepository } from '../repository.interface';
import { SwapiService } from './swapi.service';
import { mapSwapiStarshipToStarship, mapSwapiStarshipsToStarships } from './mapper/starships.mapper';

@Injectable({ providedIn: 'root' })
export class SwapiStarshipsRepository implements IStarshipRepository {
  private readonly swapi = inject(SwapiService);

  getAll(): Observable<Starship[]> {
    return this.swapi.getAllStarships().pipe(
      map(dtos => mapSwapiStarshipsToStarships(dtos))
    );
  }

  getById(id: string): Observable<Starship> {
    return this.getByIdOrUrl(id);
  }

  getByIdOrUrl(idOrUrl: string): Observable<Starship> {
    return this.swapi.getStarshipByIdOrUrl(idOrUrl).pipe(
      map(dto => mapSwapiStarshipToStarship(dto))
    );
  }
}
