import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { TranslateService } from '../../services/translate.service';
import { LanguagePopupComponent, Language } from '../language-popup/language-popup.component';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
  currentUser: User | null = null;
  isLoading = false;
  showLanguageDropdown = false;
  selectedLanguage = 'en';
  languages = LanguagePopupComponent.languages;

  constructor(
    private authService: AuthService,
    private router: Router,
    private translateService: TranslateService
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    
    // Get current language from translation service
    this.selectedLanguage = this.translateService.currentLanguageSelector() || 'en';
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const dropdownContainer = target.closest('.language-dropdown-container');
    
    if (!dropdownContainer) {
      this.showLanguageDropdown = false;
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    const loggedIn = this.authService.isLoggedIn();
    return loggedIn;
  }

  getUserDisplayName(): string {
    if (this.currentUser?.name) {
      return this.currentUser.name;
    }
    if (this.isLoading) {
      return 'Loading...';
    }
    return 'User';
  }

  toggleLanguageDropdown(event: Event): void {
    event.stopPropagation();
    this.showLanguageDropdown = !this.showLanguageDropdown;
  }

  onLanguageChange(languageCode: string, event: Event): void {
    event.stopPropagation();
    this.selectedLanguage = languageCode;
    this.translateService.setLanguage(languageCode);
    this.showLanguageDropdown = false;
    
    // Force a change detection cycle to update translations
    setTimeout(() => {
      window.dispatchEvent(new Event('languageChange'));
    }, 100);
  }

  getCurrentLanguageName(): string {
    const language = this.languages.find(lang => lang.code === this.selectedLanguage);
    return language ? language.name : 'English';
  }

  closeLanguageDropdown(): void {
    this.showLanguageDropdown = false;
  }
} 