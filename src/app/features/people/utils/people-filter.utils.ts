import { People } from '../../../core/models';
import { SortDirection, SortField } from '../models/people-filter.model';
import { compareAlphanumeric, compareNullableNumbers, compareStrings } from '../../../shared/utils/sort.utils';

/**
 * Pure filter function for character list based on bookmarks, search term, and gender.
 */
export function filterPeople(
  people: readonly People[],
  searchTerm: string,
  genderFilter: string,
  onlyBookmarked: boolean,
  bookmarkedIds: readonly string[]
): People[] {
  let list = [...people];

  // 1. Filter by Bookmarks
  if (onlyBookmarked) {
    const bookmarkedSet = new Set(bookmarkedIds);
    list = list.filter(p => bookmarkedSet.has(p.id));
  }

  const query = searchTerm.toLowerCase().trim();
  const selectedGender = genderFilter.toLowerCase();

  // 2. Filter by Search Query & Gender
  return list.filter(person => {
    const matchesSearch = !query || person.name.toLowerCase().includes(query);
    const genderLower = person.gender.toLowerCase();
    const matchesGender =
      selectedGender === 'all' ||
      (selectedGender === 'other'
        ? !['male', 'female', 'n/a'].includes(genderLower)
        : genderLower === selectedGender);

    return matchesSearch && matchesGender;
  });
}

/**
 * Pure sort function for character list based on field and direction.
 */
export function sortPeople(
  people: readonly People[],
  field: SortField,
  direction: SortDirection
): People[] {
  return [...people].sort((a, b) => {
    switch (field) {
      case 'name':
        return compareStrings(a.name, b.name, direction);
      case 'height':
        return compareNullableNumbers(a.height, b.height, direction);
      case 'mass':
        return compareNullableNumbers(a.mass, b.mass, direction);
      case 'birthYear':
        return compareAlphanumeric(a.birthYear, b.birthYear, direction);
      default:
        return 0;
    }
  });
}
