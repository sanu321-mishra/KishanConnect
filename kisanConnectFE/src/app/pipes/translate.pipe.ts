import { Pipe, PipeTransform, inject, effect } from '@angular/core';
import { TranslateService } from '../services/translate.service';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false // Make it impure to react to language changes
})
export class TranslatePipe implements PipeTransform {
  private translationService = inject(TranslateService);
  private translationCache = new Map<string, string>();
  private pendingTranslations = new Set<string>();
  private currentLang = '';

  constructor() {
    // Create an effect to watch language changes
    effect(() => {
      const newLang = this.translationService.currentLanguageSelector();
      if (this.currentLang !== newLang) {
        this.currentLang = newLang;
        // Clear cache and pending translations when language changes
        this.translationCache.clear();
        this.pendingTranslations.clear();
      }
    });
  }

  transform(value: string): string {
    if (!value) return value;

    // If language is English, use original text without translation
    if (this.translationService.currentLanguageSelector() === 'en') {
      return value;
    }

    // Check cache first
    if (this.translationCache.has(value)) {
      return this.translationCache.get(value)!;
    }

    // If this text is already pending translation, return original
    if (this.pendingTranslations.has(value)) {
      return value;
    }

    // Add to pending translations
    this.pendingTranslations.add(value);

    // Add text to the batch translation queue
    this.translationService.addTextToBatch(value, (translatedText: string) => {
      this.translationCache.set(value, translatedText);
      this.pendingTranslations.delete(value);
    });

    // Return original text while waiting for translation
    return value;
  }
} 