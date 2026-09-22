import { Component, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { PeopleDetailViewmodel } from '../../services/people-detail-viewmodel.service';

@Component({
  imports: [RouterLink, DatePipe],
  selector: 'app-people-detail',
  styleUrl: './people-detail.css',
  templateUrl: './people-detail.html',
})
export class PeopleDetail {
  id = input<string>();

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
