import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-create-container-dialog',
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './create-container-dialog.html',
  styleUrl: './create-container-dialog.css'
})
export class CreateContainerDialog {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CreateContainerDialog>
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      properties: this.fb.array([])
    });
  }

  get properties(): FormArray {
    return this.form.get('properties') as FormArray;
  }

  addProperty() {
    this.properties.push(this.fb.group({
      name: ['', Validators.required],
      value: ['', Validators.required]
    }));
  }

  removeProperty(index: number) {
    this.properties.removeAt(index);
  }

  onSubmit() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
