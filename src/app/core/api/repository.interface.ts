import { Observable } from 'rxjs';
import { People, Planet, Starship } from '../models';

export interface IRepository<T> {
  getAll: () => Observable<T[]>;
  getById: (id: string) => Observable<T>;
  update?: (id: string, data: Partial<T>) => Observable<T>;
  delete?: (id: string) => Observable<void>;
}

export interface IPeopleRepository extends IRepository<People> {}

export interface IPlanetRepository extends IRepository<Planet> {
  getByIdOrUrl: (idOrUrl: string) => Observable<Planet>;
}

export interface IStarshipRepository extends IRepository<Starship> {
  getByIdOrUrl: (idOrUrl: string) => Observable<Starship>;
}
