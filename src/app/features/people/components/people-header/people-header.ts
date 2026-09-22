import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslationService } from '../../../../core/i18n/translation.service';

@Component({
  imports: [RouterLink],
  selector: 'app-people-header',
  templateUrl: './people-header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeopleHeader {
  readonly i18n = inject(TranslationService);

  totalCount = input.required<number>();
  filteredCount = input.required<number>();
  hasActiveFilters = input<boolean>(false);

  resetFilters = output<void>();
  createClick = output<void>();
}
