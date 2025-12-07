import { Component, input, output } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'icon-primary' | 'icon-destructive' | 'table-action' | 'table-action-destructive';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  template: `
    @switch (variant()) {
      @case ('primary') {
        <button mat-raised-button color="primary" (click)="buttonClick.emit()" [disabled]="disabled()" [type]="type()">
          @if (icon()) {
            <mat-icon class="mr-2">{{ icon() }}</mat-icon>
          }
          {{ text() }}
        </button>
      }
      @case ('secondary') {
        <button mat-button (click)="buttonClick.emit()" [disabled]="disabled()" [type]="type()">
          @if (icon()) {
            <mat-icon class="mr-2">{{ icon() }}</mat-icon>
          }
          {{ text() }}
        </button>
      }
      @case ('destructive') {
        <button mat-raised-button [style.background-color]="'var(--mat-sys-error)'" [style.color]="'var(--mat-sys-on-error)'" (click)="buttonClick.emit()" [disabled]="disabled()" [type]="type()">
          @if (icon()) {
            <mat-icon class="mr-2">{{ icon() }}</mat-icon>
          }
          {{ text() }}
        </button>
      }
      @case ('icon-primary') {
        <button mat-icon-button [style.color]="'var(--mat-sys-primary)'" (click)="buttonClick.emit()" [disabled]="disabled()" [type]="type()">
          @if (icon()) {
            <mat-icon>{{ icon() }}</mat-icon>
          }
        </button>
      }
      @case ('icon-destructive') {
        <button mat-icon-button [style.color]="'var(--mat-sys-error)'" (click)="buttonClick.emit()" [disabled]="disabled()" [type]="type()">
          @if (icon()) {
            <mat-icon>{{ icon() }}</mat-icon>
          }
        </button>
      }
      @case ('table-action') {
        <button mat-button class="table-action-button" (click)="buttonClick.emit()" [disabled]="disabled()" [type]="type()">
          @if (icon()) {
            <mat-icon class="mr-1 text-sm">{{ icon() }}</mat-icon>
          }
          <span class="text-xs">{{ text() }}</span>
        </button>
      }
      @case ('table-action-destructive') {
        <button mat-button class="table-action-button" [style.color]="'var(--mat-sys-error)'" (click)="buttonClick.emit()" [disabled]="disabled()" [type]="type()">
          @if (icon()) {
            <mat-icon class="mr-1 text-sm">{{ icon() }}</mat-icon>
          }
          <span class="text-xs">{{ text() }}</span>
        </button>
      }
    }
    `,
})
export class ButtonComponent {
  variant = input<ButtonVariant>('secondary');
  icon = input<string>();
  text = input<string>();
  disabled = input(false);
  type = input<'button' | 'submit'>('button');

  buttonClick = output<void>();
}