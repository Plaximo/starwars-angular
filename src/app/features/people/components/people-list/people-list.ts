import { Component, inject } from '@angular/core';
import { PeopleViewmodel } from '../../services/people-viewmodel.service';
import { PeopleListItem } from '../people-list-item/people-list-item';

@Component({
  imports: [PeopleListItem],
  selector: 'app-people-list',
  styleUrl: './people-list.css',
  templateUrl: './people-list.html',
})
export class PeopleList {
  protected peopleViewmodel = inject(PeopleViewmodel);
}
