import { Injectable } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })

export class ThemeService {
  private readonly storageKey = 'theme';

  constructor() { this.loadTheme(); }

  setTheme(theme: Theme): void {
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
    localStorage.setItem(this.storageKey, theme);
  }

  toggleTheme(): void { this.setTheme(this.isDark() ? 'light' : 'dark'); }

  isDark(): boolean { return document.documentElement.classList.contains('dark'); }

  private loadTheme(): void {
    const saved = localStorage.getItem(this.storageKey) as Theme | null;
    if (saved) { this.setTheme(saved); return; }
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.setTheme(prefersDark ? 'dark' : 'light');
  }
}