import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { ThemeToggleComponent } from '../../misc/themes/theme-toggle/theme-toggle.component';
import { ThemeService } from '../../misc/themes/svc/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [ThemeToggleComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  private themeService = inject(ThemeService);

  // Read current theme (signal — reactive)
  currentTheme = this.themeService.theme; // 'light' | 'dark'

  // Set explicitly
  goLight() {
    this.themeService.setTheme('light');
  }
  goDark() {
    this.themeService.setTheme('dark');
  }
  flip() {
    this.themeService.toggle();
  }
}
