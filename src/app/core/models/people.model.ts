export interface People {
  id: string;
  name: string;
  height: number | null; // Parsed for numeric sorting (e.g. 172 or null if 'unknown')
  heightRaw: string;     // Original value (e.g. "172", "unknown")
  mass: number | null;   // Parsed for numeric sorting (e.g. 77 or null if 'unknown')
  massRaw: string;       // Original value (e.g. "77", "unknown")
  hairColor: string;
  skinColor: string;
  eyeColor: string;
  birthYear: string;
  gender: string;
  homeworldUrl: string;
  homeworldId: string;
  films: string[];
  filmIds: string[];
  species: string[];
  vehicles: string[];
  starships: string[];
  starshipIds: string[];
  url?: string;
  created: string;
  edited: string;
  isCustom?: boolean;    // true for user-created entries stored in localStorage
}
