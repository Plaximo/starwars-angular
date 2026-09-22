import { Component, input } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-people-skeleton-grid',
  templateUrl: './people-skeleton-grid.html',
})
export class PeopleSkeletonGrid {
  count = input<number>(8);

  protected get placeholders(): number[] {
    return Array.from({ length: this.count() }, (_, i) => i + 1);
  }
}
