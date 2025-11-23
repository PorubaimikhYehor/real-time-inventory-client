import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ContainerService } from '../../services/container-service';
import { Container } from '@app/shared/models/container';
import { FormInputComponent } from '@app/shared/components/form-input/form-input.component';
import { ButtonComponent } from '@app/shared/components/button/button.component';
import { PropertyDefinitionService } from '@app/features/property-definitions/services/property-definition.service';
import { FormSelectComponent, SelectOption } from '@app/shared/components/form-select/form-select.component';

@Component({
  selector: 'app-container-form',
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, FormInputComponent, ButtonComponent, FormSelectComponent],
  templateUrl: './container-form.component.html',
  styleUrl: './container-form.component.css'
})
export class ContainerFormComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private containerService = inject(ContainerService);
  private propertyDefinitionService = inject(PropertyDefinitionService);

  container = signal<Container | null>(null);
  isLoading = signal(true);
  isEditing = signal(false);
  isCreating = signal(false);
  propertyDefinitionOptions = signal<SelectOption[]>([]);
  form: FormGroup;

  // Signals for labels
  nameLabel = signal('Name');
  propertyNameLabel = signal('Property Name');
  valueLabel = signal('Value');
  required = signal(true);
  valueRequired = signal(false);

  constructor() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      properties: this.fb.array([])
    });

    this.loadPropertyDefinitions();
    
    const mode = (this.route.snapshot.data['mode'] ?? 'view') as 'create' | 'edit' | 'view';
    if (mode === 'create') {
      this.isCreating.set(true);
      this.isEditing.set(true);
      this.isLoading.set(false);
      this.form.reset({ name: '' });
      this.properties.clear();
      return;
    }

    const name = this.route.snapshot.paramMap.get('name');
    if (mode === 'edit' && name) {
      this.containerService.getContainer(name).subscribe({
        next: (container) => {
          this.container.set(container);
          this.populateForm(container);
          this.isEditing.set(true); // Always show edit form
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error loading container:', err);
          this.isLoading.set(false);
        }
      });
      return;
    }

    this.isLoading.set(false);
  }

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

  get properties(): FormArray {
    return this.form.get('properties') as FormArray;
  }

  get nameControl(): FormControl {
    return this.form.get('name') as FormControl;
  }

  getPropertyNameControl(index: number): FormControl {
    return this.properties.at(index).get('name') as FormControl;
  }

  getPropertyValueControl(index: number): FormControl {
    return this.properties.at(index).get('value') as FormControl;
  }

  populateForm(container: Container) {
    this.form.patchValue({ name: container.name });
    const propertiesArray = this.properties;
    propertiesArray.clear();
    container.properties.forEach(prop => {
      propertiesArray.push(this.fb.group({
        name: [prop.name, Validators.required],
        value: [prop.value]
      }));
    });
  }

  addProperty() {
    this.properties.push(this.fb.group({
      name: ['', Validators.required],
      value: ['']
    }));
  }

  removeProperty(index: number) {
    this.properties.removeAt(index);
  }

  save() {
    if (this.form.valid) {
      const formData = this.form.value;
      if (this.isCreating()) {
        this.containerService.createContainer(formData).subscribe({
          next: (newContainer) => {
            this.router.navigate(['/containers']);
          },
          error: (err) => {
            console.error('Error creating container:', err);
          }
        });
      } else if (this.container()) {
        this.containerService.updateContainer(this.container()!.name, formData).subscribe({
          next: (updatedContainer) => {
            this.router.navigate(['/containers']);
          },
          error: (err) => {
            console.error('Error updating container:', err);
          }
        });
      }
    }
  }

  cancel() {
    this.router.navigate(['/containers']);
  }

  goBack() {
    this.router.navigate(['/containers']);
  }
}
