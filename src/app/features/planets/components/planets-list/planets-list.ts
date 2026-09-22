import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PlanetsViewmodel } from '../../services/planets-viewmodel.service';
import { PlanetCard } from '../planet-card/planet-card';
import { TranslationService } from '../../../../core/i18n/translation.service';

@Component({
  imports: [PlanetCard],
  selector: 'app-planets-list',
  templateUrl: './planets-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanetsList {
  protected readonly vm = inject(PlanetsViewmodel);
  protected readonly i18n = inject(TranslationService);
}

