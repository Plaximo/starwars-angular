import { Planet } from '../../../models';
import { SwapiPlanetDto } from '../models/planets.swapi';
import { extractIdFromUrl } from './people.mapper';

/**
 * Maps raw SWAPI Planet DTO to internal domain Planet model
 */
export function mapSwapiPlanetToPlanet(dto: SwapiPlanetDto): Planet {
  return {
    id: extractIdFromUrl(dto.url),
    name: dto.name,
    diameter: dto.diameter,
    rotation_period: dto.rotation_period,
    orbital_period: dto.orbital_period,
    gravity: dto.gravity,
    population: dto.population,
    climate: dto.climate,
    terrain: dto.terrain,
    surface_water: dto.surface_water,
    residents: dto.residents || [],
    films: dto.films || [],
    url: dto.url
  };
}

/**
 * Batch maps an array of raw SWAPI Planet DTOs to internal Planet models
 */
export function mapSwapiPlanetsToPlanets(dtos: SwapiPlanetDto[]): Planet[] {
  return dtos.map(mapSwapiPlanetToPlanet);
}
