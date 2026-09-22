import { Observable } from 'rxjs';
import { People } from "../models";

export interface IRepository<T> {
  getAll: () => Observable<T[]>;
  getById: (id: string) => Observable<T>;
  update?: (id: string, data: Partial<T>) => Observable<T>;
  delete?: (id: string) => Observable<void>;
}

export interface IPeopleRepository extends IRepository<People> {}
