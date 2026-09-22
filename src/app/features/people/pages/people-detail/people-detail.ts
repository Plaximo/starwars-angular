import { Component, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { PeopleDetailViewmodel } from '../../services/people-detail-viewmodel.service';
import { PersonFormModal } from '../../components/person-form-modal/person-form-modal';

@Component({
  imports: [RouterLink, DatePipe, PersonFormModal],
  providers: [PeopleDetailViewmodel],
  selector: 'app-people-detail',
  styleUrl: './people-detail.css',
  templateUrl: './people-detail.html',
})
export class PeopleDetail {
  id = input<string>();

  // Smart Component: Delegates all state, modal management & actions to ViewModel!
  protected readonly vm = inject(PeopleDetailViewmodel);

  constructor() {
    effect(() => {
      const currentId = this.id();
      if (currentId) {
        this.vm.loadPerson(currentId);
      }
    });
  }
}
