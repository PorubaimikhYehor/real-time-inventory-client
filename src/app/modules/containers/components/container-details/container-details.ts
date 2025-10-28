import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ContainerService } from '../../services/container-service';
import { ActionService } from '../../../actions/services/action.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

interface ContainerDetailsData {
  name: string;
  properties: { name: string; value: string }[];
  lots: { name: string; quantity: number }[];
}

@Component({
  selector: 'app-container-details',
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatTableModule, MatChipsModule, MatInputModule, MatFormFieldModule, FormsModule, ButtonComponent],
  templateUrl: './container-details.html'
})
export class ContainerDetails implements OnInit {
  container = signal<ContainerDetailsData | null>(null);
  loading = signal(false);
  containerName = signal('');
  editingLot = signal<string | null>(null);
  editedQuantity = signal<number>(0);

  displayedPropertyColumns: string[] = ['name', 'value'];
  displayedLotColumns: string[] = ['name', 'quantity'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private containerService: ContainerService,
    private actionService: ActionService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const name = params['name'];
      if (name) {
        this.containerName.set(name);
        this.loadContainerDetails(name);
      }
    });
  }

  loadContainerDetails(name: string) {
    this.loading.set(true);
    this.containerService.getContainerWithLots(name).subscribe({
      next: (container) => {
        this.container.set(container);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        // Handle error - maybe redirect to containers list
        this.router.navigate(['/containers']);
      }
    });
  }

  editContainer() {
    this.router.navigate(['/containers', this.containerName(), 'edit']);
  }

  goBack() {
    this.router.navigate(['/containers']);
  }

  viewLotDetails(lotName: string) {
    this.router.navigate(['/lots', lotName, 'details']);
  }

  startEditingQuantity(lotName: string, currentQuantity: number) {
    this.editingLot.set(lotName);
    this.editedQuantity.set(currentQuantity);
  }

  cancelEditing() {
    this.editingLot.set(null);
    this.editedQuantity.set(0);
  }

  saveQuantity(lotName: string) {
    const newQuantity = this.editedQuantity();
    if (newQuantity < 0) {
      return; // Don't allow negative quantities
    }

    this.actionService.updateLotQuantity({
      lotName: lotName,
      containerName: this.containerName(),
      quantity: newQuantity
    }).subscribe({
      next: () => {
        // Update the local state
        const container = this.container();
        if (container) {
          const lot = container.lots.find(l => l.name === lotName);
          if (lot) {
            lot.quantity = newQuantity;
            this.container.set({ ...container });
          }
        }
        this.editingLot.set(null);
      },
      error: (err) => {
        console.error('Failed to update quantity:', err);
        this.cancelEditing();
      }
    });
  }
}