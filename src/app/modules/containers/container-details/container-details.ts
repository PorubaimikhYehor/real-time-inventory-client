import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ContainerService } from '../services/container-service';
import { Container } from '../../../models/container';

@Component({
  selector: 'app-container-details',
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './container-details.html',
  styleUrl: './container-details.css'
})
export class ContainerDetails implements OnInit {
  container = signal<Container | null>(null);
  isLoading = signal(true);
  isEditing = signal(false);
  form: FormGroup;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private containerService = inject(ContainerService);

  constructor() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      properties: this.fb.array([])
    });
  }

  ngOnInit() {
    const name = this.route.snapshot.paramMap.get('name');
    if (name) {
      this.containerService.getContainer(name).subscribe({
        next: (container) => {
          this.container.set(container);
          this.populateForm(container);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error loading container:', err);
          this.isLoading.set(false);
        }
      });
    } else {
      this.isLoading.set(false);
    }
  }

  get properties(): FormArray {
    return this.form.get('properties') as FormArray;
  }

  populateForm(container: Container) {
    this.form.patchValue({ name: container.name });
    const propertiesArray = this.properties;
    propertiesArray.clear();
    container.properties.forEach(prop => {
      propertiesArray.push(this.fb.group({
        name: [prop.name, Validators.required],
        value: [prop.value, Validators.required]
      }));
    });
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

  startEditing() {
    this.isEditing.set(true);
  }

  save() {
    if (this.form.valid && this.container()) {
      const updatedData = this.form.value;
      this.containerService.updateContainer(this.container()!.name, updatedData).subscribe({
        next: (updatedContainer) => {
          this.container.set(updatedContainer);
          this.isEditing.set(false);
        },
        error: (err) => {
          console.error('Error updating container:', err);
        }
      });
    }
  }

  cancel() {
    if (this.container()) {
      this.populateForm(this.container()!);
    }
    this.isEditing.set(false);
  }

  goBack() {
    this.router.navigate(['/containers']);
  }
}
