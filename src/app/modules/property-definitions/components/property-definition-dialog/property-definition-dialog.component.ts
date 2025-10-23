import { Component, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { PropertyDefinition, PropertyType } from '../../property-definition.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { FormInputComponent } from '../../../../shared/components/form-input/form-input.component';
import { FormSelectComponent } from '../../../../shared/components/form-select/form-select.component';

interface DialogData {
  mode: 'create' | 'edit';
  propertyDefinition?: PropertyDefinition;
}

@Component({
  selector: 'app-property-definition-dialog',
  standalone: true,
  imports: [
    CommonModule,
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
  template: `
    <div class="p-6">
      <h2 class="text-xl font-bold mb-4">
        {{ data.mode === 'create' ? 'Create Property Definition' : 'Edit Property Definition' }}
      </h2>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <app-form-input [control]="nameControl" [label]="nameLabel" [required]="nameRequired" class="mb-4"></app-form-input>

        <app-form-input [control]="descriptionControl" [label]="descriptionLabel" [type]="descriptionType" class="mb-4"></app-form-input>

        <app-form-select [control]="typeControl" [label]="typeLabel" [required]="typeRequired" [options]="typeOptions" class="mb-6"></app-form-select>

        <div class="flex justify-end gap-2">
          <app-button [variant]="'secondary'" [text]="'Cancel'" [type]="'button'" (buttonClick)="onCancel()"></app-button>
          <app-button [variant]="'primary'" [text]="data.mode === 'create' ? 'Create' : 'Update'" [type]="'submit'"
                      [disabled]="form.invalid"></app-button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .mat-mdc-form-field {
      width: 100%;
    }
  `]
})
export class PropertyDefinitionDialogComponent {
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

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<PropertyDefinitionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
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