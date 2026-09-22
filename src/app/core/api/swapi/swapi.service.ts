import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { SwapiPeopleDto } from './models/people.swapi';

@Injectable({
  providedIn: 'root'
})
export class SwapiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://swapi.info/api';

  /**
   * Fetches all characters from SWAPI and maps them to the internal Person domain model.
   */
  getAllPeople(): Observable<SwapiPeopleDto[]> {
    return this.http
      .get<SwapiPeopleDto[]>(`${this.baseUrl}/people`);
  }
}
