import { Component } from '@angular/core';
import { ThemeService } from '../services/theme/theme';

@Component({
  selector: 'app-settings',
  imports: [],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings {
  constructor(private themeService: ThemeService) { }

  toggleTheme() {
    this.themeService.toggleTheme()
  }
}
