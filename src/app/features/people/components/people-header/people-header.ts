import { Component, input, output } from '@angular/core';

@Component({
  imports: [],
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
