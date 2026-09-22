import { Component, effect, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { People } from '../../../../core/models';
import { PersonFormPayload } from '../../models/person-form.model';
import { TranslationService } from '../../../../core/i18n/translation.service';

@Component({
  imports: [FormsModule],
  selector: 'app-person-form-modal',
  templateUrl: './person-form-modal.html',
})
export class PersonFormModal {
  readonly i18n = inject(TranslationService);

  isOpen = input<boolean>(false);
  person = input<People | null>(null);

  save = output<PersonFormPayload>();
  close = output<void>();

  // Form Fields
  name = signal('');
  gender = signal('male');
  birthYear = signal('19BBY');
  heightRaw = signal('175');
  massRaw = signal('75');
  eyeColor = signal('blue');
  hairColor = signal('brown');
  skinColor = signal('fair');

  errorMessage = signal<string | null>(null);

  constructor() {
    effect(() => {
      const p = this.person();
      if (p) {
        this.name.set(p.name);
        this.gender.set(p.gender || 'male');
        this.birthYear.set(p.birthYear || 'unknown');
        this.heightRaw.set(p.heightRaw !== 'unknown' ? p.heightRaw : '');
        this.massRaw.set(p.massRaw !== 'unknown' ? p.massRaw : '');
        this.eyeColor.set(p.eyeColor || 'unknown');
        this.hairColor.set(p.hairColor || 'unknown');
        this.skinColor.set(p.skinColor || 'unknown');
      } else {
        this.resetForm();
      }
      this.errorMessage.set(null);
    });
  }

  onSubmit(): void {
    const trimmedName = this.name().trim();
    if (!trimmedName) {
      this.errorMessage.set(this.i18n.t().formNameRequired);
      return;
    }

    const hRaw = this.heightRaw().trim() || 'unknown';
    const mRaw = this.massRaw().trim() || 'unknown';
    const parsedH = Number(hRaw);
    const parsedM = Number(mRaw);

    const data: PersonFormPayload = {
      name: trimmedName,
      gender: this.gender(),
      birthYear: this.birthYear().trim() || 'unknown',
      height: Number.isFinite(parsedH) ? parsedH : null,
      heightRaw: hRaw,
      mass: Number.isFinite(parsedM) ? parsedM : null,
      massRaw: mRaw,
      eyeColor: this.eyeColor().trim() || 'unknown',
      hairColor: this.hairColor().trim() || 'unknown',
      skinColor: this.skinColor().trim() || 'unknown',
      homeworldUrl: this.person()?.homeworldUrl || '',
      homeworldId: this.person()?.homeworldId || '',
      films: this.person()?.films || [],
      filmIds: this.person()?.filmIds || [],
      species: this.person()?.species || [],
      vehicles: this.person()?.vehicles || [],
      starships: this.person()?.starships || [],
      starshipIds: this.person()?.starshipIds || [],
      created: this.person()?.created || new Date().toISOString(),
      edited: new Date().toISOString(),
      isCustom: true
    };

    this.save.emit(data);
  }

  private resetForm(): void {
    this.name.set('');
    this.gender.set('male');
    this.birthYear.set('unknown');
    this.heightRaw.set('');
    this.massRaw.set('');
    this.eyeColor.set('');
    this.hairColor.set('');
    this.skinColor.set('');
  }
}
