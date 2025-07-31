import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type ThemeMode = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeSubject = new BehaviorSubject<ThemeMode>('light');
  public theme$ = this.themeSubject.asObservable();
  
  private isDarkModeSubject = new BehaviorSubject<boolean>(false);
  public isDarkMode$ = this.isDarkModeSubject.asObservable();

  constructor() {
    this.initializeTheme();
  }

  private initializeTheme(): void {
    // Load saved theme from localStorage, default to light
    const savedTheme = localStorage.getItem('theme') as ThemeMode;
    const theme = savedTheme || 'light';
    
    this.setTheme(theme);
  }

  setTheme(theme: ThemeMode): void {
    this.themeSubject.next(theme);
    localStorage.setItem('theme', theme);
    
    // Apply the theme
    this.applyTheme(theme);
  }

  private applyTheme(theme: ThemeMode): void {
    const isDark = theme === 'dark';
    this.isDarkModeSubject.next(isDark);
    this.updateBodyClass(isDark);
  }

  private updateBodyClass(isDark: boolean): void {
    const body = document.body;
    
    if (isDark) {
      body.classList.add('dark-mode');
      body.classList.remove('light-mode');
    } else {
      body.classList.add('light-mode');
      body.classList.remove('dark-mode');
    }
  }

  getCurrentTheme(): ThemeMode {
    return this.themeSubject.value;
  }

  isDarkMode(): boolean {
    return this.isDarkModeSubject.value;
  }

  toggleTheme(): void {
    const currentTheme = this.getCurrentTheme();
    const newTheme: ThemeMode = currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }
} 