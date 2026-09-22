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
}

export const TRANSLATIONS: Record<Language, TranslationDictionary> = {
  en: ENGLISH,
  de: GERMAN
};
