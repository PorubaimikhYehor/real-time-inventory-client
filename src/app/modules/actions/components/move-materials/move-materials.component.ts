import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
    MatProgressSpinnerModule
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

  form: FormGroup = this.fb.group({
    sourceContainerName: ['', Validators.required],
    destinationContainerName: ['', Validators.required],
    quantity: [1, [Validators.required, Validators.min(1)]],
    startDateTime: [null],
    endDateTime: [null]
  });

  constructor() {
    this.loadContainers();
  }

  private loadContainers() {
    this.isLoading.set(true);
    this.containerService.getContainers()
      .subscribe({
        next: (response: any) => {
          this.containers.set(response.getContainers());
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
      const request: MoveMaterialsRequest = this.form.value;

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
}