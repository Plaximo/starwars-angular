import { Component, inject } from '@angular/core';
import { PlanetsViewmodel } from '../../services/planets-viewmodel.service';
import { PlanetCard } from '../planet-card/planet-card';

@Component({
  imports: [PlanetCard],
  selector: 'app-planets-list',
  templateUrl: './planets-list.html',
})
export class PlanetsList {
  protected readonly vm = inject(PlanetsViewmodel);
}
