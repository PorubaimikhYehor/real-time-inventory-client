import { Component, input, computed, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-form-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  template: `
    <mat-form-field class="w-full" appearance="outline">
      <mat-label>{{ label() }}</mat-label>
      @if (type() === 'textarea') {
        <textarea
          matInput
          [formControl]="control()"
          [required]="required()"
          [placeholder]="placeholder()"
          [rows]="rows()"
        ></textarea>
      } @else {
        <input
          matInput
          [formControl]="control()"
          [required]="required()"
          [type]="type()"
          [placeholder]="placeholder()"
          [attr.min]="min() ?? null"
        >
      }
      <mat-error *ngIf="hasError()">
        {{ errorMessage() }}
      </mat-error>
    </mat-form-field>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormInputComponent {
  control = input.required<FormControl>();
  label = input('');
  required = input(false);
  type = input<'text' | 'number' | 'password' | 'email' | 'textarea'>('text');
  placeholder = input('');
  rows = input(3);
  min = input<number | null>(null);

  hasError = computed(() => this.control()?.invalid ?? false);

  errorMessage = computed(() => {
    if (!this.hasError()) return '';
    const errors = this.control()?.errors;
    if (errors?.['required']) return `${this.label()} is required`;
    if (errors?.['minlength']) return `${this.label()} must be at least ${errors['minlength'].requiredLength} characters`;
    if (errors?.['min']) {
      const minValue = errors['min'].min ?? errors['min'].requiredMin;
      return `${this.label()} must be at least ${minValue}`;
    }
    // Add more custom validations as needed
    return 'Invalid input';
  });
}