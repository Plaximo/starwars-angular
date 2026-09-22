import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { SortDirection, SortField } from '../../models/people-filter.model';
import { TranslationService } from '../../../../core/i18n/translation.service';

@Component({
  imports: [],
  selector: 'app-people-filter-bar',
  templateUrl: './people-filter-bar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeopleFilterBar {
  readonly i18n = inject(TranslationService);

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
