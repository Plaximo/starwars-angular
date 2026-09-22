import { Component, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Planet } from '../../../../core/models';

@Component({
  imports: [DecimalPipe],
  selector: 'app-planet-card',
  templateUrl: './planet-card.html',
})
export class PlanetCard {
  planet = input.required<Planet>();

  formatPopulation(pop: string): string {
    if (!pop || pop === 'unknown') return 'Unknown';
    const num = Number(pop);
    if (!Number.isFinite(num)) return pop;
    if (num >= 1_000_000_000) {
      return (num / 1_000_000_000).toFixed(1) + ' Billion';
    }
    if (num >= 1_000_000) {
      return (num / 1_000_000).toFixed(1) + ' Million';
    }
    return pop;
  }
}
