import { Component, Input, computed, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { toSignal } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';

@Component({
    selector: 'app-form-input',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule],
    template: `
    <mat-form-field class="w-full" appearance="outline">
      <mat-label>{{ label() }}</mat-label>
      <input matInput [formControl]="control" [required]="required()">
      <mat-error *ngIf="hasError()">
        {{ errorMessage() }}
      </mat-error>
    </mat-form-field>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormInputComponent {
    @Input({ required: true }) control!: FormControl;
    @Input() label = signal('');
    @Input() required = signal(false);

    hasError = computed(() => this.control?.invalid ?? false);

    errorMessage = computed(() => {
        if (!this.hasError()) return '';
        const errors = this.control?.errors;
        if (errors?.['required']) return `${this.label()} is required`;
        if (errors?.['minlength']) return `${this.label()} must be at least ${errors['minlength'].requiredLength} characters`;
        // Add more custom validations as needed
        return 'Invalid input';
    });
}