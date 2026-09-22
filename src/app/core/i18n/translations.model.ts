import { ENGLISH } from "./english";
import { GERMAN } from "./german";

export type Language = 'de' | 'en';

export interface TranslationDictionary {
  // Navigation & Branding
  brandHolocron: string;
  brandTitle: string;
  tabCharacters: string;
  tabPlanets: string;
  splitView: string;
  gridView: string;
  modeOnline: string;
  modeOffline: string;
  modeOfflineBanner: string;
  reconnect: string;

  // Header & Stats
  headerTitle: string;
  headerSubtitle: string;
  newCharacter: string;
  showingCount: (filtered: number, total: number) => string;
  resetFilters: string;

  // Search & Filter Bar
  searchPlaceholder: string;
  filterAll: string;
  genderAll: string;
  genderMale: string;
  genderFemale: string;
  genderDroid: string;
  genderHermaphrodite: string;
  genderOther: string;
  labelGender: string;
  labelSortBy: string;
  savedFilter: (count: number) => string;
  sortByName: string;
  sortByHeight: string;
  sortByMass: string;
  sortByBirthYear: string;
  sortAsc: string;
  sortDesc: string;

  // Cards & Empty States
  customBadge: string;
  savedBadge: string;
  bookmarkAction: string;
  removeBookmark: string;
  details: string;
  unknown: string;
  noCharactersFound: string;
  noBookmarksFoundTitle: string;
  noBookmarksFoundDesc: string;
  viewAllCharacters: string;
  clearAllFilters: string;

  // Side-by-Side & Dossier
  backToArchive: string;
  splitViewTitle: string;
  splitViewDesc: string;
  dossierEmptyTitle: string;
  dossierEmptyDesc: string;
  dossierId: string;
  editBtn: string;
  deleteBtn: string;
  clearSelection: string;
  homeworldTitle: string;
  resolvedEntity: string;
  starshipsTitle: string;
  starshipsRegistered: (count: number) => string;
  noStarships: string;
  filmAppearances: (count: number) => string;
  recordUpdated: string;
  climate: string;
  terrain: string;
  population: string;
  gravity: string;
  diameter: string;
  orbitalPeriod: string;
  model: string;
  starshipClass: string;
  crew: string;
  passengers: string;
  hyperdrive: string;
  manufacturer: string;
  maxSpeed: string;
  eyeColor: string;
  hairColor: string;
  skinColor: string;
  physicalAttributes: string;
  recordNotFound: string;

  // Modal & Form
  createModalTitle: string;
  editModalTitle: string;
  createModalDesc: string;
  editModalDesc: (id: string) => string;
  formName: string;
  formHeight: string;
  formMass: string;
  formGender: string;
  formBirthYear: string;
  formEyeColor: string;
  formHairColor: string;
  formSkinColor: string;
  formCancel: string;
  formSave: string;
  formCreate: string;
  formNameRequired: string;

  // Toasts
  undoRecordRemoved: string;
  undoBtn: string;
  rollbackTitle: string;
  deleteConfirm: string;

  // Planet & Star Systems View
  planetsTitle: string;
  planetsSubtitle: string;
  planetsShowingCount: (filtered: number, total: number) => string;
  searchPlanetsPlaceholder: string;
  climateAll: string;
  climateArid: string;
  climateTemperate: string;
  climateTropical: string;
  climateFrozen: string;
  climateMurky: string;
  climateHot: string;
  climateWindy: string;
  sortByPlanetName: string;
  sortByPopulation: string;
  sortByDiameter: string;
  sortDirectionLabel: string;
  sortDirectionAsc: string;
  sortDirectionDesc: string;
  noPlanetsFoundTitle: string;
  noPlanetsFoundDesc: string;

  // Planet Card
  planetCardType: string;
  residentsCount: (count: number) => string;
  surfaceWater: string;
  orbital: string;
  rotation: string;
  days: string;
  hours: string;
  standardGravity: string;
  billion: string;
  million: string;

  // Dev Simulation & Mode Bar
  simErrorLabel: string;
  simErrorTooltip: string;
  modeLabel: string;
  offlineModeActiveLabel: string;
  offlineModeTooltip: string;
  switchLanguageTooltip: string;

  // Error Messages & Toasts
  errorSavingPerson: (name: string) => string;
  errorCreatingPerson: string;
  errorDeletingPerson: (name: string) => string;
  rollbackReverted: string;
  rollbackRestored: string;
  simulatedNetworkErrorCreate: string;
  simulatedNetworkErrorUpdate: string;
  simulatedNetworkErrorDelete: string;

  // Split View & Other Actions
  closeDossier: string;
  splitViewBtnTitle: string;
  toggleSortDirTitle: string;
}

export const TRANSLATIONS: Record<Language, TranslationDictionary> = {
  en: ENGLISH,
  de: GERMAN
};
