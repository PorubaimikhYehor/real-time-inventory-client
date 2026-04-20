import { Component, signal, inject, computed, effect } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ContainerService } from '@app/features/containers';
import { FormComponent } from '@app/shared/components/form/form.component';
import { SelectOption } from '@app/shared/index';
import { GroupControl } from '@app/shared/models/form-control-configuration';

@Component({
  selector: 'app-move-lots',
  imports: [FormComponent],
  templateUrl: './move-lots.component.html',
  styleUrl: './move-lots.component.scss'
})
export class MoveLotsComponent {
  private containerService = inject(ContainerService);

  containerOptions = signal<SelectOption[]>([]);
  isFormInvalid = signal(true);
  form = signal(new FormGroup({}));

  selectContainers = computed(() => <GroupControl>{
    name: 'selectContainers', label: 'Select Containers', labelCssClass: 'label-form-array', placeholder: 'Select container', type: 'group', cssClass: 'flex gap-4', nestedFormControls: [
      { name: 'sourceContainer', label: "Source Container", type: 'select', options: this.containerOptions(), cssClass: 'flex-1' },
      { name: 'sourceContainer', type: 'button', label: 'Swap', variant: 'secondary', callback: this.swapContainers },
      { name: 'destinationContainer', label: "Destination Container", type: 'select', options: this.containerOptions(), cssClass: 'flex-1' }
    ]
  });

  submitButtons = computed(() => <GroupControl>{
    name: 'submitButtons', placeholder: 'Select container', type: 'group', nestedFormControls: [
      { name: 'submitForm', label: "Move Lots", type: 'button', variant: "primary", callback: this.onSubmit, disabled: this.isFormInvalid() }
    ]
  });

  swapContainers = () => {
    const source = this.form().get('sourceContainer')?.value;
    const destination = this.form().get('destinationContainer')?.value;
    console.log('Swapping containers', { form: this.form(), source, destination });
    // this.form().get('sourceContainer')?.setValue(destination);
    // this.form().get('destinationContainer')?.setValue(source);
  }

  onSubmit = (options: any) => {
    const formGroup = options.form as FormGroup;
    if (formGroup.invalid) {
      formGroup.markAllAsTouched();
      return;
    }
  };

  constructor() {
    this.loadContainers();
  }

  loadContainers() {
    this.containerService.getContainers().subscribe({
      next: (response) => {
        this.containerOptions.set(
          response.getContainers().map(container => ({
            value: container.name,
            label: container.name
          }))
        );
      }
    });
  }
}