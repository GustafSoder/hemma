import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'app-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly theme = signal<Theme>(this.getInitialTheme());

  constructor() {
    // Apply class to <body> whenever theme signal changes
    effect(() => {
      const t = this.theme();
      document.body.classList.toggle('dark', t === 'dark');
      localStorage.setItem(STORAGE_KEY, t);
    });
  }

  toggle(): void {
    this.theme.update((t) => (t === 'dark' ? 'light' : 'dark'));
  }

  setTheme(theme: Theme): void {
    this.theme.set(theme);
  }

  private getInitialTheme(): Theme {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }
}
