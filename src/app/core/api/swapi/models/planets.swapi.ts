/**
 * Raw data contract received directly from SWAPI for planets (https://swapi.info/api/planets)
 */
export interface SwapiPlanetDto {
  name: string;
  rotation_period: string;
  orbital_period: string;
  diameter: string;
  climate: string;
  gravity: string;
  terrain: string;
  surface_water: string;
  population: string;
  residents: string[];
  films: string[];
  created: string;
  edited: string;
  url: string;
}
