import { Component, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { PeopleDetailViewModel } from '../../services/people-detail-viewmodel.service';
import { PersonFormModal } from '../../components/person-form-modal/person-form-modal';
import { TranslationService } from '../../../../core/i18n/translation.service';

@Component({
  imports: [RouterLink, DatePipe, PersonFormModal],
  providers: [PeopleDetailViewModel],
  selector: 'app-people-detail',
  styleUrl: './people-detail.css',
  templateUrl: './people-detail.html',
})
export class PeopleDetail {
  readonly i18n = inject(TranslationService);
  id = input<string>();

  // Smart Component: Delegates all state, modal management & actions to ViewModel!
  protected readonly vm = inject(PeopleDetailViewModel);

  constructor() {
    effect(() => {
      const currentId = this.id();
      if (currentId) {
        this.vm.loadPerson(currentId);
      }
    });
  }
}
