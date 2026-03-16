import { Component, signal, inject } from '@angular/core';

import { ReactiveFormsModule, FormBuilder, FormArray, Validators, FormControl, FormGroup, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Lot, CreateLotRequest, UpdateLotRequest } from '@app/shared/models/lot';
import { LotService } from '../../services/lot-service';
import { ContainerService } from '@app/features/containers/services/container-service';
import { Container } from '@app/shared/models/container';
import { ButtonComponent } from '@app/shared/components/button/button.component';
import { FormInputComponent } from '@app/shared/components/form-input/form-input.component';
import { FormSelectComponent, SelectOption } from '@app/shared/components/form-select/form-select.component';
import { PropertyDefinitionService } from '@app/features/property-definitions/services/property-definition.service';
import { FormComponent } from '@app/shared/components/form/form.component';
import { CustomControl } from '@app/shared/models/customFormControl';
import { FormControlConfiguration, FormControlConfigurationType } from '@app/shared/models/formControlConfiguration.interface';


@Component({
  selector: 'app-lot-form',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    ButtonComponent,
    FormInputComponent,
    FormSelectComponent,
    FormComponent
  ],
  templateUrl: './lot-form.component.html'
})
export class LotFormComponent {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private lotService = inject(LotService);
  private containerService = inject(ContainerService);
  private propertyDefinitionService = inject(PropertyDefinitionService);
  containerOptions = signal<SelectOption[]>([]);

  lot = signal<Lot | null>(null);
  containers = signal<Container[]>([]);
  loading = signal(false);
  isEditing = signal(false);
  propertyDefinitionOptions = signal<SelectOption[]>([]);

  testForm = this.fb.group({
    name: new CustomControl("", { label: 'Lot Name', placeholder: 'Enter lot name', type: 'text', }, Validators.required),
    container: new CustomControl("", { label: 'Container', placeholder: 'Select container', type: 'select', options: this.containerOptions() }),
    quantity: new CustomControl("", { label: 'Quantity', placeholder: 'Enter quantity', type: 'number', min: 0.000001 }),
    submit: new CustomControl("", { label: this.isEditing() ? 'Update Lot' : 'Create Lot', type: 'button' }),
    properties: this.fb.array([])
  }) as FormGroup;

  testForm2 = new FormGroup({});
  testForm2Config = <FormControlConfiguration[]>[
    { name: 'name', label: 'Lot Name', placeholder: 'Enter lot name', type: FormControlConfigurationType.string, validators: [Validators.required] },
    { name: 'container', label: 'Container', placeholder: 'Select container', type: FormControlConfigurationType.select, options: this.containerOptions() },
    { name: 'quantity', label: 'Quantity', placeholder: 'Enter quantity', type: FormControlConfigurationType.number, min: 0.000001 },
    {
      name: 'properties', label: 'Properties', type: FormControlConfigurationType.array, nestedFormControls: [
        { name: 'name', label: 'Property name', placeholder: 'Select property name', type: FormControlConfigurationType.select },
        { name: 'value', label: 'Property value', placeholder: 'Property value', type: FormControlConfigurationType.string },
        { name: 'removeButton', type: FormControlConfigurationType.button },
      ]
    },
    { name: 'submit', label: this.isEditing() ? 'Update Lot' : 'Create Lot', type: FormControlConfigurationType.button }
  ];

  readonly fieldConfig = {
    lotName: {
      label: signal('Lot Name'),
      placeholder: signal('Enter lot name'),
      required: signal(false)
    },
    quantity: {
      label: signal('Quantity'),
      placeholder: signal('Enter quantity'),
      required: signal(false),
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

  onSubmitTest() {
    this.loading.set(true)
    console.log('Form submitted with value:', this.testForm.value);
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