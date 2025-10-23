import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormArray, Validators, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Lot, CreateLotRequest, UpdateLotRequest } from '../../../../models/lot';
import { LotService } from '../../services/lot-service';
import { ContainerService } from '../../../containers/services/container-service';
import { Container } from '../../../../models/container';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { FormInputComponent } from '../../../../shared/components/form-input/form-input.component';
import { FormSelectComponent, SelectOption } from '../../../../shared/components/form-select/form-select.component';
import { PropertyDefinitionService } from '../../../property-definitions/property-definition.service';

@Component({
  selector: 'app-lot-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    ButtonComponent,
    FormInputComponent,
    FormSelectComponent
  ],
  templateUrl: './lot-form.html'
})
export class LotForm {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private lotService = inject(LotService);
  private containerService = inject(ContainerService);
  private propertyDefinitionService = inject(PropertyDefinitionService);

  lot = signal<Lot | null>(null);
  containers = signal<Container[]>([]);
  loading = signal(false);
  isEditing = signal(false);
  propertyDefinitionOptions = signal<SelectOption[]>([]);

  readonly fieldConfig = {
    lotName: {
      label: signal('Lot Name'),
      placeholder: signal('Enter lot name'),
      required: signal(true)
    },
    quantity: {
      label: signal('Quantity'),
      placeholder: signal('Enter quantity'),
      required: signal(true),
      type: signal<'number'>('number'),
      min: signal(0.000001)
    },
    propertyName: {
      label: signal('Property Name'),
      placeholder: signal('Property name'),
      required: signal(true)
    },
    propertyValue: {
      label: signal('Property Value'),
      placeholder: signal('Property value'),
      required: signal(false)
    }
  } as const;

  form = this.fb.group({
    name: ['', [Validators.required]],
    containerName: [''],
    quantity: [null],
    properties: this.fb.array([])
  });

  constructor() {
    const name = this.route.snapshot.paramMap.get('name');
    this.isEditing.set(!!name);

    this.loadPropertyDefinitions();

    if (!this.isEditing()) {
      this.applyCreateValidators();
      this.loadContainers();
    } else {
      this.clearCreateValidators();
    }

    if (name) {
      this.loadLot(name);
    }
  }

  loadContainers() {
    this.containerService.getContainers().subscribe({
      next: (response) => {
        this.containers.set(response.getContainers());
        this.containerOptions.set(
          response.getContainers().map(container => ({
            value: container.name,
            label: container.name
          }))
        );
      }
    });
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

  loadLot(name: string) {
    this.loading.set(true);
    this.lotService.getLot(name).subscribe({
      next: (lot) => {
        this.lot.set(lot);
        this.form.patchValue({
          name: lot.name
        });

        // Clear existing properties and add loaded ones
        this.properties.clear();
        lot.properties.forEach(prop => this.addProperty(prop.name, prop.value));
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.router.navigate(['/lots']);
      }
    });
  }

  get properties() {
    return this.form.get('properties') as FormArray;
  }

  get nameControl(): FormControl {
    return this.form.get('name') as FormControl;
  }

  get quantityControl(): FormControl {
    return this.form.get('quantity') as FormControl;
  }

  get containerControl(): FormControl {
    return this.form.get('containerName') as FormControl;
  }

  // Container select signals
  containerLabel = signal('Container');
  containerRequired = signal(true);
  containerOptions = signal<SelectOption[]>([]);

  getPropertyNameControl(index: number): FormControl {
    return this.properties.at(index).get('name') as FormControl;
  }

  getPropertyValueControl(index: number): FormControl {
    return this.properties.at(index).get('value') as FormControl;
  }

  addProperty(name = '', value = '') {
    this.properties.push(this.createPropertyGroup(name, value));
  }

  removeProperty(index: number) {
    this.properties.removeAt(index);
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.value;
    const properties = (formValue.properties || []) as { name: string; value: string }[];

    this.loading.set(true);

    if (this.isEditing()) {
      const request = new UpdateLotRequest({
        name: formValue.name!,
        properties
      });

      this.lotService.updateLot(this.lot()!.name, request).subscribe({
        next: () => {
          this.loading.set(false);
          this.router.navigate(['/lots']);
        },
        error: () => {
          this.loading.set(false);
        }
      });
    } else {
      const request = new CreateLotRequest({
        name: formValue.name!,
        containerName: formValue.containerName!,
        quantity: Number(formValue.quantity),
        properties
      });

      this.lotService.createLot(request).subscribe({
        next: () => {
          this.loading.set(false);
          this.router.navigate(['/lots']);
        },
        error: () => {
          this.loading.set(false);
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/lots']);
  }

  private applyCreateValidators() {
    const containerControl = this.form.get('containerName');
    const quantityControl = this.form.get('quantity');

    containerControl?.setValidators([Validators.required]);
    containerControl?.updateValueAndValidity({ emitEvent: false });

    quantityControl?.setValidators([Validators.required, Validators.min(0.000001)]);
    quantityControl?.updateValueAndValidity({ emitEvent: false });
  }

  private clearCreateValidators() {
    const containerControl = this.form.get('containerName');
    const quantityControl = this.form.get('quantity');

    containerControl?.clearValidators();
    containerControl?.setValue('');
    containerControl?.updateValueAndValidity({ emitEvent: false });

    quantityControl?.clearValidators();
    quantityControl?.setValue(null);
    quantityControl?.updateValueAndValidity({ emitEvent: false });
  }

  private createPropertyGroup(name = '', value = ''): FormGroup {
    return this.fb.group({
      name: [name, Validators.required],
      value: [value]
    });
  }
}