import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatExpansionModule } from '@angular/material/expansion';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ContainerService } from '../../services/container-service';
import { ActionService } from '../../../actions/services/action.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

interface LotEntry {
  name: string;
  quantity: number;
  inputTimestamp: string;
}

interface AggregatedLot {
  name: string;
  totalQuantity: number;
  entries: LotEntry[];
}

interface ContainerDetailsData {
  name: string;
  properties: { name: string; value: string }[];
  lots: LotEntry[];
}

@Component({
  selector: 'app-container-details',
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatTableModule, MatChipsModule, MatInputModule, MatFormFieldModule, MatExpansionModule, FormsModule, ButtonComponent],
  templateUrl: './container-details.html'
})
export class ContainerDetails {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private containerService = inject(ContainerService);
  private actionService = inject(ActionService);

  container = signal<ContainerDetailsData | null>(null);
  loading = signal(false);
  containerName = signal('');
  editingLotKey = signal<string | null>(null);
  editedQuantity = signal<number>(0);

  displayedPropertyColumns: string[] = ['name', 'value'];

  // Computed property to aggregate lots by name
  aggregatedLots = computed(() => {
    const container = this.container();
    if (!container) return [];

    const lotsMap = new Map<string, AggregatedLot>();
    
    container.lots.forEach(lot => {
      if (!lotsMap.has(lot.name)) {
        lotsMap.set(lot.name, {
          name: lot.name,
          totalQuantity: 0,
          entries: []
        });
      }
      const aggregated = lotsMap.get(lot.name)!;
      aggregated.totalQuantity += lot.quantity;
      aggregated.entries.push(lot);
    });

    return Array.from(lotsMap.values());
  });

  constructor() {
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

  getLotKey(lot: { name: string; inputTimestamp: string }): string {
    return `${lot.name}|${lot.inputTimestamp}`;
  }

  startEditingQuantity(lot: { name: string; quantity: number; inputTimestamp: string }) {
    this.editingLotKey.set(this.getLotKey(lot));
    this.editedQuantity.set(lot.quantity);
  }

  cancelEditing() {
    this.editingLotKey.set(null);
    this.editedQuantity.set(0);
  }

  saveQuantity(lot: { name: string; inputTimestamp: string }) {
    const newQuantity = this.editedQuantity();
    if (newQuantity < 0) {
      return; // Don't allow negative quantities
    }

    this.actionService.updateLotQuantity({
      lotName: lot.name,
      containerName: this.containerName(),
      quantity: newQuantity
    }).subscribe({
      next: () => {
        // Update the local state
        const container = this.container();
        if (container) {
          const lotEntry = container.lots.find(l => this.getLotKey(l) === this.getLotKey(lot));
          if (lotEntry) {
            lotEntry.quantity = newQuantity;
            this.container.set({ ...container });
          }
        }
        this.editingLotKey.set(null);
      },
      error: (err) => {
        console.error('Failed to update quantity:', err);
        this.cancelEditing();
      }
    });
  }
}