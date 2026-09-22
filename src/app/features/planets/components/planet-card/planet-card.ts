import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Planet } from '../../../../core/models';
import { TranslationService } from '../../../../core/i18n/translation.service';

@Component({
  imports: [DecimalPipe],
  selector: 'app-planet-card',
  templateUrl: './planet-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanetCard {
  protected readonly i18n = inject(TranslationService);
  planet = input.required<Planet>();

  formatPopulation(pop: string): string {
    if (!pop || pop === 'unknown') return this.i18n.t().unknown;
    const num = Number(pop);
    if (!Number.isFinite(num)) return pop;
    if (num >= 1_000_000_000) {
      return (num / 1_000_000_000).toFixed(1) + ' ' + this.i18n.t().billion;
    }
    if (num >= 1_000_000) {
      return (num / 1_000_000).toFixed(1) + ' ' + this.i18n.t().million;
    }
    return pop;
  }
}

