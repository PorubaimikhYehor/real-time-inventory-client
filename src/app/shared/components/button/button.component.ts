import { Component, input, output } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatTooltip],
  styleUrl: './button.component.css',
  templateUrl: './button.component.html',
})
export class ButtonComponent {
  variant = input<'primary'|'secondary'|'destructive'>('secondary');
  icon = input<string>();
  iconPosition = input<'left' | 'right'>('left');
  text = input<string>();
  disabled = input(false);
  tooltip = input<string>();

  buttonClick = output<void>();
}