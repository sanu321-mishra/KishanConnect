import { Component, effect, inject, Output, EventEmitter } from '@angular/core';
import { TranslateService } from 'src/app/services/translate.service';

/** Language model */
export interface Language {
  code: string;
  name: string;
}

@Component({
  selector: 'app-language-popup',
  templateUrl: './language-popup.component.html',
  styleUrls: ['./language-popup.component.css']
})
export class LanguagePopupComponent {
  @Output() languageSelected = new EventEmitter<string>();
  @Output() popupClosed = new EventEmitter<void>();

  public static readonly languages: Language[] = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi' },
    { code: 'mr', name: 'Marathi' },
    { code: 'gu', name: 'Gujarati' },
    { code: 'ta', name: 'Tamil' },
    { code: 'te', name: 'Telugu' },
    { code: 'kn', name: 'Kannada' },
    { code: 'ml', name: 'Malayalam' },
  ];

  public isVisible = false;
  public selectedLanguage = 'en';
  public languages = LanguagePopupComponent.languages;

  private translationService = inject(TranslateService);

  constructor() {
    // Set up effect to handle language changes
    effect(() => {
      const currentLang = this.translationService.currentLanguageSelector();
      if (currentLang) {
        // Force a change detection cycle to update translations
        setTimeout(() => {
          window.dispatchEvent(new Event('languageChange'));
        });
      }
    });
  }

  // Show the popup
  public showPopup(): void {
    this.isVisible = true;
    this.selectedLanguage = 'en'; // Default to English
  }

  // Hide the popup
  public hidePopup(): void {
    this.isVisible = false;
    this.popupClosed.emit();
  }

  // Handle language selection
  public onLanguageChange(langCode: string): void {
    this.selectedLanguage = langCode;
    this.translationService.setLanguage(langCode);
    this.languageSelected.emit(langCode);
    this.hidePopup();
  }

  // Continue with default language (English)
  public continueWithDefault(): void {
    this.translationService.setLanguage('en');
    this.languageSelected.emit('en');
    this.hidePopup();
  }

  // Handle dropdown change
  public onDropdownChange(event: any): void {
    const selectedLang = event.target.value;
    this.selectedLanguage = selectedLang;
  }

  // Continue with selected language
  public continueWithSelected(): void {
    this.onLanguageChange(this.selectedLanguage);
  }
}
