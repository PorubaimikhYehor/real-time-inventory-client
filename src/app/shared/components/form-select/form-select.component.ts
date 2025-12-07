import { Component, input, computed, signal, ChangeDetectionStrategy } from '@angular/core';

import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

export interface SelectOption {
  value: any;
  label: string;
}

@Component({
  selector: 'app-form-select',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatSelectModule],
  template: `
    <mat-form-field class="w-full" appearance="outline">
      <mat-label>{{ label() }}</mat-label>
      <mat-select [formControl]="control()" [required]="required()" [placeholder]="placeholder()">
        @for (option of options(); track option) {
          <mat-option [value]="option.value">
            {{ option.label }}
          </mat-option>
        }
      </mat-select>
      @if (hasError()) {
        <mat-error>
          {{ errorMessage() }}
        </mat-error>
      }
    </mat-form-field>
    `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormSelectComponent {
  control = input.required<FormControl>();
  label = input('');
  required = input(false);
  placeholder = input('');
  options = input<SelectOption[]>([]);

  hasError = computed(() => this.control()?.invalid ?? false);

  errorMessage = computed(() => {
    if (!this.hasError()) return '';
    const errors = this.control()?.errors;
    if (errors?.['required']) return `${this.label()} is required`;
    return 'Invalid selection';
  });
}