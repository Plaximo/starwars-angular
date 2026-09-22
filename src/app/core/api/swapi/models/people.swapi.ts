import { People } from '../../../models/people.model';

/**
 * Raw data contract received directly from SWAPI (https://swapi.info/api/people)
 */
export interface SwapiPeopleDto {
  name: string;
  height: string;
  mass: string;
  hair_color: string;
  skin_color: string;
  eye_color: string;
  birth_year: string;
  gender: string;
  homeworld: string;
  films: string[];
  species: string[];
  vehicles: string[];
  starships: string[];
  created: string;
  edited: string;
  url: string;
}
