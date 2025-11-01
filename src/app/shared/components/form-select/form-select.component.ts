import { Component, input, computed, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatSelectModule],
  template: `
    <mat-form-field class="w-full" appearance="outline">
      <mat-label>{{ label() }}</mat-label>
      <mat-select [formControl]="control()" [required]="required()" [placeholder]="placeholder()">
        <mat-option *ngFor="let option of options()" [value]="option.value">
          {{ option.label }}
        </mat-option>
      </mat-select>
      <mat-error *ngIf="hasError()">
        {{ errorMessage() }}
      </mat-error>
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