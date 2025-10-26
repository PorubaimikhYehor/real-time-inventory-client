import { Component, signal, inject, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ContainerService } from '../../../containers/services/container-service';
import { ActionService, MoveMaterialsRequest } from '../../services/action.service';
import { Container } from '../../../../models/container';
import { NotificationService } from '../../../../shared/services/notification.service';
import { FormInputComponent } from '../../../../shared/components/form-input/form-input.component';
import { FormSelectComponent, SelectOption } from '../../../../shared/components/form-select/form-select.component';

@Component({
  selector: 'app-move-materials',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    FormInputComponent,
    FormSelectComponent
  ],
  templateUrl: './move-materials.component.html',
  styleUrl: './move-materials.component.css'
})
export class MoveMaterialsComponent {
  private fb = inject(FormBuilder);
  private containerService = inject(ContainerService);
  private actionService = inject(ActionService);
  private notificationService = inject(NotificationService);

  containers = signal<Container[]>([]);
  isLoading = signal(false);
  isSubmitting = signal(false);

  form = this.fb.group({
    sourceContainerName: ['', Validators.required],
    destinationContainerName: ['', Validators.required],
    quantity: [1, [Validators.required, Validators.min(1)]],
    startedAt: [null],
    finishedAt: [null]
  });

  get sourceContainerControl(): FormControl {
    return this.form.get('sourceContainerName') as FormControl;
  }

  get destinationContainerControl(): FormControl {
    return this.form.get('destinationContainerName') as FormControl;
  }

  get quantityControl(): FormControl {
    return this.form.get('quantity') as FormControl;
  }

  sourceContainerLabel = signal('Select source container');
  sourceContainerPlaceholder = signal('Choose a container');
  sourceContainerRequired = signal(true);

  destinationContainerLabel = signal('Select destination container');
  destinationContainerPlaceholder = signal('Choose a container');
  destinationContainerRequired = signal(true);

  quantityLabel = signal('Enter quantity');
  quantityType = signal<'text' | 'number' | 'password' | 'email' | 'textarea'>('number');
  quantityPlaceholder = signal('1');
  quantityRequired = signal(true);
  quantityMin = signal<number | null>(1);

  sourceContainerOptions = signal<SelectOption[]>([]);
  destinationContainerOptions = signal<SelectOption[]>([]);

  constructor() {
    this.loadContainers();

    // Update destination options when source container changes
    effect(() => {
      const sourceContainer = this.form.get('sourceContainerName')?.value;
      this.destinationContainerOptions.set(this.getContainerOptions(this.getAvailableDestinationContainers()));
    });
  }

  private loadContainers() {
    this.isLoading.set(true);
    this.containerService.getContainers()
      .subscribe({
        next: (response: any) => {
          this.containers.set(response.getContainers());
          this.sourceContainerOptions.set(this.getContainerOptions(this.containers()));
          this.destinationContainerOptions.set(this.getContainerOptions(this.getAvailableDestinationContainers()));
          this.isLoading.set(false);
        },
        error: (error: any) => {
          console.error('Error loading containers:', error);
          this.notificationService.showError('Failed to load containers');
          this.isLoading.set(false);
        }
      });
  }

  onSubmit() {
    if (this.form.valid) {
      this.isSubmitting.set(true);
      const formValue = this.form.value;
      const request: MoveMaterialsRequest = {
        sourceContainerName: formValue.sourceContainerName!,
        destinationContainerName: formValue.destinationContainerName!,
        quantity: formValue.quantity!,
        startedAt: formValue.startedAt || undefined,
        finishedAt: formValue.finishedAt || undefined
      };

      this.actionService.moveMaterials(request)
        .subscribe({
          next: (response: any) => {
            this.notificationService.showSuccess(
              `Successfully moved ${response.lots.reduce((sum: number, lot: any) => sum + lot.quantity, 0)} items from ${response.sourceContainer.name} to ${response.destinationContainer.name}`
            );
            this.form.reset({ quantity: 1 });
            this.isSubmitting.set(false);
          },
          error: (error: any) => {
            console.error('Error moving materials:', error);
            this.notificationService.showError('Failed to move materials. Please check your inputs and try again.');
            this.isSubmitting.set(false);
          }
        });
    } else {
      this.notificationService.showError('Please fill in all required fields correctly.');
    }
  }

  getAvailableDestinationContainers(): Container[] {
    const sourceContainerName = this.form.get('sourceContainerName')?.value;
    return this.containers().filter(c => c.name !== sourceContainerName);
  }

  getContainerOptions(containers: Container[]): SelectOption[] {
    return containers.map(container => ({
      value: container.name,
      label: container.name
    }));
  }

  getSourceContainerOptions(): SelectOption[] {
    return this.getContainerOptions(this.containers());
  }

  getDestinationContainerOptions(): SelectOption[] {
    return this.getContainerOptions(this.getAvailableDestinationContainers());
  }
}