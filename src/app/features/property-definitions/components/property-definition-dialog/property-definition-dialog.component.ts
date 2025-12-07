import { Component, inject, signal } from '@angular/core';

import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { PropertyDefinition, PropertyType } from '../../services/property-definition.service';
import { ButtonComponent } from '@app/shared/components/button/button.component';
import { FormInputComponent } from '@app/shared/components/form-input/form-input.component';
import { FormSelectComponent } from '@app/shared/components/form-select/form-select.component';

interface DialogData {
  mode: 'create' | 'edit';
  propertyDefinition?: PropertyDefinition;
}

@Component({
  selector: 'app-property-definition-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    ButtonComponent,
    FormInputComponent,
    FormSelectComponent
],
  templateUrl: './property-definition-dialog.component.html'
})
export class PropertyDefinitionDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<PropertyDefinitionDialogComponent>);
  public data = inject<DialogData>(MAT_DIALOG_DATA);

  form: FormGroup;

  // Signal properties for form inputs
  nameLabel = signal('Name');
  nameRequired = signal(true);
  descriptionLabel = signal('Description');
  descriptionType = signal<'textarea'>('textarea');
  typeLabel = signal('Type');
  typeRequired = signal(true);
  typeOptions = signal([
    { value: PropertyType.String, label: 'String' },
    { value: PropertyType.Double, label: 'Double' },
    { value: PropertyType.Integer, label: 'Integer' },
    { value: PropertyType.Boolean, label: 'Boolean' },
    { value: PropertyType.DateTime, label: 'DateTime' },
    { value: PropertyType.Array, label: 'Array' }
  ]);

  get nameControl(): FormControl {
    return this.form.get('name') as FormControl;
  }

  get descriptionControl(): FormControl {
    return this.form.get('description') as FormControl;
  }

  get typeControl(): FormControl {
    return this.form.get('type') as FormControl;
  }

  constructor() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''], // Optional field
      type: [PropertyType.String, Validators.required]
    });

    if (this.data.mode === 'edit' && this.data.propertyDefinition) {
      this.form.patchValue(this.data.propertyDefinition);
    }
  }

  onSubmit() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.form.controls).forEach(key => {
        this.form.get(key)?.markAsTouched();
      });
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}