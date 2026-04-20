import { Component, signal, inject, computed } from '@angular/core';

import { ReactiveFormsModule, FormBuilder, FormArray, Validators, FormControl, FormGroup, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { Lot, CreateLotRequest } from '@app/shared/models/lot';
import { LotService } from '../../services/lot-service';
import { ContainerService } from '@app/features/containers/services/container-service';
import { Container } from '@app/shared/models/container';
import { ButtonComponent } from '@app/shared/components/button/button.component';
import { SelectOption } from '@app/shared/components/form-select/form-select.component';
import { PropertyDefinitionService } from '@app/features/property-definitions/services/property-definition.service';
import { FormComponent } from '@app/shared/components/form/form.component';
import { Configuration, GroupControl } from '@app/shared/models/form-control-configuration';


@Component({
  selector: 'app-lot-form',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    ButtonComponent,
    FormComponent
  ],
  templateUrl: './lot-form.component.html'
})
export class LotFormComponent {
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

  lotForm = signal(new FormGroup({}));
  isLotFormInvalid = signal(this.lotForm().invalid);
  lotName = signal<string | null>(null);

  onSubmit = (options: any) => {
    const formGroup = options.form as FormGroup;
    console.log('Form submitted with values:', formGroup.value);
    debugger;
    if (formGroup.invalid) {
      formGroup.markAllAsTouched();
      return;
    }
    this.loading.set(true);

    const request = new CreateLotRequest({
      name: formGroup.get('name')?.value,
      containerName: formGroup.get('containerInfo')?.get('container')?.value,
      quantity: Number(formGroup.get('containerInfo')?.get('quantity')?.value),
      properties: (formGroup.get('properties') as FormArray).controls.map(control => ({
        name: control.get('name')?.value,
        value: control.get('value')?.value
      }))
    });

    if (this.isEditing()) {
      const lotName = this.lot()?.name;
      if (lotName) {
        this.lotService.updateLot(lotName, request).subscribe({
          next: () => {
            this.loading.set(false);
            this.router.navigate(['/lots']);
          },
          error: () => {
            this.loading.set(false);
          }
        });
      }
    } else {
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

  lotFormConfiguration = computed(() => <GroupControl>{
    name: 'createLot', label: 'Container information', placeholder: 'Select container', type: 'group', nestedFormControls: [
      { name: 'name', label: 'Lot Name', placeholder: 'Enter lot name', type: 'text', validators: [Validators.required] },
      {
        name: 'containerInfo',
        cssClass: 'flex gap-4',
        label: 'Container information',
        labelCssClass: 'label-form-array',
        placeholder: 'Select container',
        type: 'group',
        configuration: this.isEditing() ? Configuration.Hidden : Configuration.Visible,
        nestedFormControls: [
          { name: 'container', cssClass: 'flex-1', label: 'Container', placeholder: 'Select container', type: 'select', options: this.containerOptions },
          { name: 'quantity', cssClass: 'flex-1', label: 'Quantity', placeholder: 'Enter quantity', type: 'number', min: 0.000001 },
        ],
      },
      {
        name: 'properties', labelCssClass: 'label-form-array', cssClass: 'flex gap-4', label: 'Properties', type: 'array', nestedFormControls: [
          { name: 'name', cssClass: 'flex-1', label: 'Property name', placeholder: 'Select property name', type: 'select', options: this.propertyDefinitionOptions },
          { name: 'value', cssClass: 'flex-1', label: 'Property value', placeholder: 'Property value', type: 'text' },
        ]
      },
    ]
  });

  submitButtons = computed(() => <GroupControl>{
    name: 'submitButtons', placeholder: 'Select container', type: 'group', cssClass: 'flex gap-4', nestedFormControls: [
      { name: 'submitForm', label: this.isEditing() ? 'Update Lot' : 'Create Lot', type: 'button', variant: "primary", callback: this.onSubmit, disabled: this.isLotFormInvalid },
    ]
  });

  constructor() {
    this.lotName.set(this.route.snapshot.paramMap.get('name'));
    this.isEditing.set(!!this.lotName());

    this.loadPropertyDefinitions();

    if (!this.isEditing()) {
      // this.applyCreateValidators();
      this.loadContainers();
    } else {
      // this.clearCreateValidators();
    }

    if (this.lotName()) {
      this.loadLot(this.lotName()!);
    }
  }

  loadLot(name: string) {
    this.lotService.getLot(name).subscribe(lot => {
      this.lot.set(lot);
    });
  }

  ngOnInit() {
    this.lotForm().statusChanges.subscribe(_ => this.isLotFormInvalid.set(this.lotForm().invalid));
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

  goBack() {
    this.router.navigate(['/lots']);
  }
}