import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../svc/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './theme-toggle.component.html',
  styleUrl: './theme-toggle.component.scss',
})
export class ThemeToggleComponent {
  readonly themeService = inject(ThemeService);

  get isDark(): boolean {
    return this.themeService.theme() === 'dark';
  }

  toggle(): void {
    this.themeService.toggle();
  }
}
