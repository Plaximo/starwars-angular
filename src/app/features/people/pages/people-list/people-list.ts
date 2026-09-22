import { Component, inject } from '@angular/core';
import { PeopleViewmodel } from '../../services/people-viewmodel.service';
import { PeopleHeader } from '../../components/people-header/people-header';
import { PeopleFilterBar } from '../../components/people-filter-bar/people-filter-bar';
import { PeopleListItem } from '../../components/people-list-item/people-list-item';
import { PeopleSkeletonGrid } from '../../components/people-skeleton-grid/people-skeleton-grid';
import { PeopleEmptyState } from '../../components/people-empty-state/people-empty-state';
import { PersonFormModal } from '../../components/person-form-modal/person-form-modal';

@Component({
  imports: [
    PeopleHeader,
    PeopleFilterBar,
    PeopleListItem,
    PeopleSkeletonGrid,
    PeopleEmptyState,
    PersonFormModal
  ],
  selector: 'app-people-list',
  styleUrl: './people-list.css',
  templateUrl: './people-list.html',
})
export class PeopleList {
  // Pure Smart Component: Delegates all state, modal management & actions to ViewModel!
  protected readonly vm = inject(PeopleViewmodel);
}
