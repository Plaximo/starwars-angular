import { Component, input, output } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-people-empty-state',
  templateUrl: './people-empty-state.html',
})
export class PeopleEmptyState {
  hasActiveFilters = input<boolean>(false);
  resetFilters = output<void>();
}
