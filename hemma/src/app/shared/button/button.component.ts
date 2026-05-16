import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
})
export class ButtonComponent {
  /** Visual style of the button */
  @Input() variant: ButtonVariant = 'primary';

  /** Size of the button */
  @Input() size: ButtonSize = 'md';

  /** Disables the button */
  @Input() disabled = false;

  /** Shows a loading spinner and disables interaction */
  @Input() loading = false;

  /** Renders as full-width block */
  @Input() block = false;

  /** Optional icon (any string, e.g. an SVG or icon class) — placed before label */
  @Input() icon?: string;

  /** Forwards click events (won't fire when disabled or loading) */
  @Output() clicked = new EventEmitter<MouseEvent>();

  onClick(event: MouseEvent): void {
    if (!this.disabled && !this.loading) {
      this.clicked.emit(event);
    }
  }
}
