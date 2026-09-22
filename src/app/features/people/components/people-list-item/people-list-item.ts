import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { People } from '../../../../core/models';
import { TranslationService } from '../../../../core/i18n/translation.service';

@Component({
  imports: [RouterLink],
  selector: 'app-people-list-item',
  styleUrl: './people-list-item.css',
  templateUrl: './people-list-item.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeopleListItem {
  readonly i18n = inject(TranslationService);

  people = input<People>();
  isBookmarked = input<boolean>(false);

  edit = output<People>();
  delete = output<string>();
  toggleBookmark = output<string>();
}
