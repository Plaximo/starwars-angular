import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { SwapiPeopleDto } from './models/people.swapi';
import { SwapiPlanetDto } from './models/planets.swapi';
import { SwapiStarshipDto } from './models/starships.swapi';

@Injectable({
  providedIn: 'root'
})
export class SwapiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://swapi.info/api';

  /**
   * Fetches all characters as raw DTOs from SWAPI.
   */
  getAllPeople(): Observable<SwapiPeopleDto[]> {
    return this.http.get<SwapiPeopleDto[]>(`${this.baseUrl}/people`);
  }

  /**
   * Fetches a single character by ID as raw DTO from SWAPI.
   */
  getPersonById(id: string): Observable<SwapiPeopleDto> {
    return this.http.get<SwapiPeopleDto>(`${this.baseUrl}/people/${id}`);
  }

  /**
   * Fetches all planets as raw DTOs from SWAPI.
   */
  getAllPlanets(): Observable<SwapiPlanetDto[]> {
    return this.http.get<SwapiPlanetDto[]>(`${this.baseUrl}/planets`);
  }

  /**
   * Fetches a single planet by full URL or ID as raw DTO from SWAPI.
   */
  getPlanetByIdOrUrl(urlOrId: string): Observable<SwapiPlanetDto> {
    const url = urlOrId.startsWith('http') ? urlOrId : `${this.baseUrl}/planets/${urlOrId}`;
    return this.http.get<SwapiPlanetDto>(url);
  }

  /**
   * Fetches all starships as raw DTOs from SWAPI.
   */
  getAllStarships(): Observable<SwapiStarshipDto[]> {
    return this.http.get<SwapiStarshipDto[]>(`${this.baseUrl}/starships`);
  }

  /**
   * Fetches a single starship by full URL or ID as raw DTO from SWAPI.
   */
  getStarshipByIdOrUrl(urlOrId: string): Observable<SwapiStarshipDto> {
    const url = urlOrId.startsWith('http') ? urlOrId : `${this.baseUrl}/starships/${urlOrId}`;
    return this.http.get<SwapiStarshipDto>(url);
  }
}
