import { People } from "../../../models";
import { SwapiPeopleDto } from "../models/people.swapi";

/**
 * Extracts numeric ID from a SWAPI entity URL (e.g., "https://swapi.info/api/people/1" -> "1")
 */
export function extractIdFromUrl(url: string | null | undefined): string {
  if (!url) return '';
  const match = url.match(/\/(\d+)\/?$/);
  if (match) return match[1];
  const parts = url.replace(/\/$/, '').split('/');
  return parts[parts.length - 1] || '';
}

/**
 * Parses numeric values safely (handles "unknown", "n/a", and formatted numbers like "1,358")
 */
function parseNumericValue(value: string | null | undefined): number | null {
  if (!value) return null;
  const cleaned = value.replace(/,/g, '').trim();
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Maps raw SWAPI DTO to internal domain Person model
 */
export function mapSwapiPersonToPerson(dto: SwapiPeopleDto): People {
  const id = extractIdFromUrl(dto.url);
  const homeworldId = extractIdFromUrl(dto.homeworld);
  const filmIds = (dto.films || []).map(extractIdFromUrl);
  const starshipIds = (dto.starships || []).map(extractIdFromUrl);

  return {
    id,
    name: dto.name,
    height: parseNumericValue(dto.height),
    heightRaw: dto.height,
    mass: parseNumericValue(dto.mass),
    massRaw: dto.mass,
    hairColor: dto.hair_color,
    skinColor: dto.skin_color,
    eyeColor: dto.eye_color,
    birthYear: dto.birth_year,
    gender: dto.gender,
    homeworldUrl: dto.homeworld,
    homeworldId,
    films: dto.films || [],
    filmIds,
    species: dto.species || [],
    vehicles: dto.vehicles || [],
    starships: dto.starships || [],
    starshipIds,
    url: dto.url,
    created: dto.created,
    edited: dto.edited,
    isCustom: false
  };
}

/**
 * Batch maps an array of raw SWAPI DTOs to internal Person models
 */
export function mapSwapiPeopleToPeople(dtos: SwapiPeopleDto[]): People[] {
  return dtos.map(mapSwapiPersonToPerson);
}
