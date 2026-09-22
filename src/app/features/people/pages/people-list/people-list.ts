import { Component, inject } from '@angular/core';
import { PeopleViewmodel } from '../../services/people-viewmodel.service';
import { PeopleHeader } from '../../components/people-header/people-header';
import { PeopleFilterBar } from '../../components/people-filter-bar/people-filter-bar';
import { PeopleListItem } from '../../components/people-list-item/people-list-item';
import { PeopleSkeletonGrid } from '../../components/people-skeleton-grid/people-skeleton-grid';
import { PeopleEmptyState } from '../../components/people-empty-state/people-empty-state';

@Component({
  imports: [
    PeopleHeader,
    PeopleFilterBar,
    PeopleListItem,
    PeopleSkeletonGrid,
    PeopleEmptyState
  ],
  selector: 'app-people-list',
  styleUrl: './people-list.css',
  templateUrl: './people-list.html',
})
export class PeopleList {
  // Smart Component: Injects the ViewModel and wires data/events to dumb components
  protected readonly vm = inject(PeopleViewmodel);
}
