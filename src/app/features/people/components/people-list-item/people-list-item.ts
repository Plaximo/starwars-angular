import { Component, input } from '@angular/core';
import { People } from '../../../../core/models';

@Component({
  imports: [],
  selector: 'app-people-list-item',
  styleUrl: './people-list-item.css',
  templateUrl: './people-list-item.html',
})
export class PeopleListItem {
  people = input<People>();
}
