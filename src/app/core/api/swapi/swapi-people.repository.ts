import { inject, Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { People } from "../../models";
import { SwapiService } from "./swapi.service";
import { mapSwapiPeopleToPeople } from "./mapper/people.mapper";
import { IPeopleRepository } from "../repository.interface";

@Injectable({ providedIn: 'root' })
export class SwapiPeopleRepository implements IPeopleRepository {
  private swapi = inject(SwapiService);

  getAll(): Observable<People[]> {
    return this.swapi.getAllPeople().pipe(
      map(dtos => mapSwapiPeopleToPeople(dtos))
    );
  }

  getById(id: string): Observable<People> {
    return this.getAll().pipe(
      map(all => {
        const found = all.find(p => p.id === id);
        if (!found) {
          throw new Error(`Person with id "${id}" was not found.`);
        }
        return found;
      })
    );
  }

  update?(id: string, data: Partial<People>): Observable<People> {
    throw new Error("Method not implemented.");
  }

  delete?(id: string): Observable<void> {
    throw new Error("Method not implemented.");
  }
}