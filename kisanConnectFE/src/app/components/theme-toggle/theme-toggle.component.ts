import { Component } from '@angular/core';
import { ThemeService, ThemeMode } from '../../services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  template: `
    <button 
      class="theme-toggle-btn" 
      (click)="toggleTheme()"
      [title]="'Switch to ' + (currentTheme === 'light' ? 'dark' : 'light') + ' mode'">
      <span class="theme-icon">{{ getCurrentIcon() }}</span>
    </button>
  `,
  styles: [`
    .theme-toggle-btn {
      background: var(--primary-color);
      color: white;
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px var(--shadow-color);
    }

    .theme-toggle-btn:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 12px var(--shadow-color);
    }

    .theme-icon {
      font-size: 18px;
      transition: transform 0.3s ease;
    }

    .theme-toggle-btn:hover .theme-icon {
      transform: rotate(180deg);
    }
  `]
})
export class ThemeToggleComponent {
  currentTheme: ThemeMode = 'light';

  constructor(private themeService: ThemeService) {
    this.themeService.theme$.subscribe(theme => {
      this.currentTheme = theme;
    });
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  getCurrentIcon(): string {
    return this.currentTheme === 'dark' ? '🌙' : '☀️';
  }
} 