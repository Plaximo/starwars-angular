import { Component, effect, inject, input } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { PeopleListViewModel } from '../../services/people-list-viewmodel.service';
import { PeopleDetailViewModel } from '../../services/people-detail-viewmodel.service';
import { PersonFormModal } from '../../components/person-form-modal/person-form-modal';
import { People } from '../../../../core/models';
import { TranslationService } from '../../../../core/i18n/translation.service';

@Component({
  imports: [RouterLink, PersonFormModal, ScrollingModule],
  providers: [PeopleDetailViewModel],
  selector: 'app-people-side-by-side',
  styleUrl: './people-side-by-side.css',
  templateUrl: './people-side-by-side.html',
})
export class PeopleSideBySide {
  readonly i18n = inject(TranslationService);

  // Bound from route parameter ':id' via withComponentInputBinding()
  id = input<string>();

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // Reusable ViewModels:
  // 1. List ViewModel powers the Master list pane
  protected readonly listVm = inject(PeopleListViewModel);

  // 2. Detail ViewModel powers the Detail dossier pane
  protected readonly detailVm = inject(PeopleDetailViewModel);

  constructor() {
    // Whenever the route ID changes, orchestrate loading the detail dossier
    effect(() => {
      const currentId = this.id();
      if (currentId) {
        this.detailVm.loadPerson(currentId);
      }
    });
  }

  /**
   * Selects a character and synchronizes route: /people-side-by-side/:id
   * Preserves active query parameters (search, gender, sortBy, sortDir, favorites).
   */
  selectPerson(person: People): void {
    this.router.navigate(['/people-side-by-side', person.id], {
      queryParamsHandling: 'preserve',
    });
  }

  /**
   * Clears selection and navigates back to /people-side-by-side.
   */
  clearSelection(): void {
    this.router.navigate(['/people-side-by-side'], {
      queryParamsHandling: 'preserve',
    });
  }

  /**
   * TrackBy function for CDK Virtual Scroll recycling
   */
  trackById(_index: number, item: People): string {
    return item.id;
  }
}
