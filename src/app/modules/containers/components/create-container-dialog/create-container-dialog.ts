import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormInputComponent } from '../../../../shared/components/form-input/form-input.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { PropertyDefinitionService } from '../../../property-definitions/property-definition.service';
import { FormSelectComponent, SelectOption } from '../../../../shared/components/form-select/form-select.component';

@Component({
  selector: 'app-create-container-dialog',
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, FormInputComponent, ButtonComponent, FormSelectComponent],
  templateUrl: './create-container-dialog.html',
  styleUrl: './create-container-dialog.css'
})
export class CreateContainerDialog {
  form: FormGroup;

  // Signals for labels
  nameLabel = signal('Name');
  propertyNameLabel = signal('Property Name');
  valueLabel = signal('Value');
  required = signal(true);

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CreateContainerDialog>,
    private propertyDefinitionService = inject(PropertyDefinitionService)
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      properties: this.fb.array([])
    });

    this.loadPropertyDefinitions();
  }

  propertyDefinitionOptions = signal<SelectOption[]>([]);

  loadPropertyDefinitions() {
    this.propertyDefinitionService.getAll().subscribe({
      next: (propertyDefinitions) => {
        this.propertyDefinitionOptions.set(
          propertyDefinitions.map(pd => ({
            value: pd.name,
            label: pd.name
          }))
        );
      }
    });
  }

  get nameControl(): FormControl {
    return this.form.get('name') as FormControl;
  }

  get properties(): FormArray {
    return this.form.get('properties') as FormArray;
  }

  getPropertyNameControl(index: number): FormControl {
    return this.properties.at(index).get('name') as FormControl;
  }

  getPropertyValueControl(index: number): FormControl {
    return this.properties.at(index).get('value') as FormControl;
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
