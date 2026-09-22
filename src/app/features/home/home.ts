import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PeopleList } from '../people/pages/people-list/people-list';
import { PlanetsList } from '../planets/components/planets-list/planets-list';
import { PeopleListViewModel } from '../people/services/people-list-viewmodel.service';
import { PlanetsViewmodel } from '../planets/services/planets-viewmodel.service';
import { NetworkSimulationService } from '../../core/api/network-simulation.service';
import { OnlineStatusService } from '../../core/services/online-status.service';

export type HomeTab = 'characters' | 'planets';

@Component({
  imports: [PeopleList, PlanetsList],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly peopleVm = inject(PeopleListViewModel);
  protected readonly planetsVm = inject(PlanetsViewmodel);
  readonly simulation = inject(NetworkSimulationService);
  readonly onlineStatus = inject(OnlineStatusService);

  readonly activeTab = signal<HomeTab>('characters');

  constructor() {
    // Synchronize active tab from URL query param (?tab=characters | ?tab=planets)
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      const tab = params['tab'];
      if (tab === 'planets' || tab === 'characters') {
        this.activeTab.set(tab);
      }
    });
  }

  setTab(tab: HomeTab): void {
    this.activeTab.set(tab);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
      queryParamsHandling: 'merge'
    });
  }
}
