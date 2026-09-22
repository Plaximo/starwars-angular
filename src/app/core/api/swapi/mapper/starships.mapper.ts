import { Starship } from '../../../models';
import { SwapiStarshipDto } from '../models/starships.swapi';
import { extractIdFromUrl } from './people.mapper';

/**
 * Maps raw SWAPI Starship DTO to internal domain Starship model
 */
export function mapSwapiStarshipToStarship(dto: SwapiStarshipDto): Starship {
  return {
    id: extractIdFromUrl(dto.url),
    name: dto.name,
    model: dto.model,
    starship_class: dto.starship_class,
    manufacturer: dto.manufacturer,
    cost_in_credits: dto.cost_in_credits,
    length: dto.length,
    crew: dto.crew,
    passengers: dto.passengers,
    max_atmosphering_speed: dto.max_atmosphering_speed,
    hyperdrive_rating: dto.hyperdrive_rating,
    MGLT: dto.MGLT,
    cargo_capacity: dto.cargo_capacity,
    consumables: dto.consumables,
    url: dto.url
  };
}

/**
 * Batch maps an array of raw SWAPI Starship DTOs to internal Starship models
 */
export function mapSwapiStarshipsToStarships(dtos: SwapiStarshipDto[]): Starship[] {
  return dtos.map(mapSwapiStarshipToStarship);
}
