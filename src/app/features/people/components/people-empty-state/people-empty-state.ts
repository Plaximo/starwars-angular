import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { TranslationService } from '../../../../core/i18n/translation.service';

@Component({
  imports: [],
  selector: 'app-people-empty-state',
  templateUrl: './people-empty-state.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeopleEmptyState {
  readonly i18n = inject(TranslationService);

  hasActiveFilters = input<boolean>(false);
  resetFilters = output<void>();
}

