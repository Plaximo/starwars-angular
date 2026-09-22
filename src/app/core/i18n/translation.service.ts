import { Injectable, computed, inject, signal } from '@angular/core';
import { LocalStorageService } from '../storage/local-storage.service';
import { Language, TRANSLATIONS, TranslationDictionary } from './translations.model';

const STORAGE_KEY_LANG = 'sw_app_language';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private readonly storage = inject(LocalStorageService);

  /**
   * Active language signal ('de' | 'en')
   */
  readonly lang = signal<Language>(this.getInitialLanguage());

  /**
   * Active dictionary signal, reactive across all templates
   */
  readonly t = computed<TranslationDictionary>(() => TRANSLATIONS[this.lang()]);

  /**
   * Helper to check if German is active
   */
  readonly isGerman = computed(() => this.lang() === 'de');

  setLanguage(language: Language): void {
    this.lang.set(language);
    this.storage.setItem(STORAGE_KEY_LANG, language);
  }

  toggleLanguage(): void {
    const next = this.lang() === 'de' ? 'en' : 'de';
    this.setLanguage(next);
  }

  private getInitialLanguage(): Language {
    const saved = this.storage.getItem<string | null>(STORAGE_KEY_LANG, null);
    if (saved === 'de' || saved === 'en') {
      return saved;
    }
    // Default to German since challenge is German-based
    return 'de';
  }
}
