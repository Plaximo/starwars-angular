import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-people-header',
  templateUrl: './people-header.html',
})
export class PeopleHeader {

  totalCount = input.required<number>();
  filteredCount = input.required<number>();
  hasActiveFilters = input<boolean>(false);

  resetFilters = output<void>();
  createClick = output<void>();
}
