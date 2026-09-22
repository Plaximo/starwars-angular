import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { People } from '../../../../core/models';

@Component({
  imports: [RouterLink],
  selector: 'app-people-list-item',
  styleUrl: './people-list-item.css',
  templateUrl: './people-list-item.html',
})
export class PeopleListItem {
  people = input<People>();
}
