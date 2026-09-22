import { Component, input, output } from '@angular/core';
import { SortDirection, SortField } from '../../models/people-filter.model';

@Component({
  imports: [],
  selector: 'app-people-filter-bar',
  templateUrl: './people-filter-bar.html',
})
export class PeopleFilterBar {
  search = input<string>('');
  gender = input<string>('all');
  sortBy = input<SortField>('name');
  sortDir = input<SortDirection>('asc');
  onlyBookmarked = input<boolean>(false);
  bookmarkedCount = input<number>(0);

  searchChange = output<string>();
  genderChange = output<string>();
  sortByChange = output<SortField>();
  sortDirToggle = output<void>();
  onlyBookmarkedChange = output<boolean>();
}
