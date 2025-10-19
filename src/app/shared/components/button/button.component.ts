import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'icon-primary' | 'icon-destructive';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    @switch (variant) {
      @case ('primary') {
        <button mat-raised-button color="primary" (click)="buttonClick.emit()" [disabled]="disabled" [type]="type">
          {{ text }}
        </button>
      }
      @case ('secondary') {
        <button mat-button (click)="buttonClick.emit()" [disabled]="disabled" [type]="type">
          {{ text }}
        </button>
      }
      @case ('destructive') {
        <button mat-raised-button color="warn" (click)="buttonClick.emit()" [disabled]="disabled" [type]="type">
          {{ text }}
        </button>
      }
      @case ('icon-primary') {
        <button mat-icon-button [style.color]="'var(--mat-sys-primary)'" (click)="buttonClick.emit()" [disabled]="disabled" [type]="type">
          <mat-icon *ngIf="icon">{{ icon }}</mat-icon>
        </button>
      }
      @case ('icon-destructive') {
        <button mat-icon-button [style.color]="'var(--mat-sys-error)'" (click)="buttonClick.emit()" [disabled]="disabled" [type]="type">
          <mat-icon *ngIf="icon">{{ icon }}</mat-icon>
        </button>
      }
    }
  `,
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'secondary';
  @Input() icon?: string;
  @Input() text?: string;
  @Input() disabled = false;
  @Input() type: 'button' | 'submit' = 'button';

  @Output() buttonClick = new EventEmitter<void>();
}