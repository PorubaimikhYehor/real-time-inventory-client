import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormInputComponent } from '@app/shared/components/form-input/form-input.component';
import { FormSelectComponent, SelectOption } from '@app/shared/components/form-select/form-select.component';
import { ButtonComponent } from '@app/shared/components/button/button.component';

@Component({
  selector: 'app-create-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    FormInputComponent,
    FormSelectComponent,
    ButtonComponent
  ],
  templateUrl: './create-user-dialog.component.html'
})
export class CreateUserDialogComponent {
  userForm: FormGroup;
  roleOptions: SelectOption[] = [
    { value: 'Admin', label: 'Admin' },
    { value: 'Manager', label: 'Manager' },
    { value: 'Operator', label: 'Operator' },
    { value: 'Viewer', label: 'Viewer' }
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CreateUserDialogComponent>
  ) {
    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), this.passwordStrengthValidator]],
      confirmPassword: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      role: ['Viewer', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  // Password must contain uppercase, lowercase, number, and special character
  passwordStrengthValidator(control: FormControl) {
    const value = control.value || '';
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumeric = /[0-9]/.test(value);
    const hasSpecialChar = /[\W_]/.test(value);
    
    const passwordValid = hasUpperCase && hasLowerCase && hasNumeric && hasSpecialChar;
    
    if (!passwordValid) {
      return { passwordStrength: true };
    }
    return null;
  }

  getControl(name: string): FormControl {
    return this.userForm.get(name) as FormControl;
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  submit(): void {
    if (this.userForm.valid) {
      // ASP.NET Core automatically converts camelCase to PascalCase
      this.dialogRef.close(this.userForm.value);
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
