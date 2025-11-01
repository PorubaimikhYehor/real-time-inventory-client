import { Component, signal, inject, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatExpansionModule } from '@angular/material/expansion';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LotService } from '../../services/lot-service';
import { ActionService } from '../../../actions/services/action.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

interface LocationEntry {
  containerName: string;
  quantity: number;
  inputTimestamp: string;
}

interface AggregatedLocation {
  containerName: string;
  totalQuantity: number;
  entries: LocationEntry[];
}

interface LotDetailsData {
  name: string;
  properties: { name: string; value: string }[];
  locations: LocationEntry[];
}

@Component({
  selector: 'app-lot-details',
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatTableModule, MatChipsModule, MatTooltipModule, MatInputModule, MatFormFieldModule, MatExpansionModule, FormsModule, ButtonComponent],
  templateUrl: './lot-details.html'
})
export class LotDetails {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private lotService = inject(LotService);
  private actionService = inject(ActionService);
  private destroyRef = inject(DestroyRef);

  lot = signal<LotDetailsData | null>(null);
  loading = signal(false);
  lotName = signal('');
  editingLocationKey = signal<string | null>(null);
  editedQuantity = signal<number>(0);

  displayedPropertyColumns: string[] = ['name', 'value'];

  // Computed property to aggregate locations by container name
  aggregatedLocations = computed(() => {
    const lot = this.lot();
    if (!lot) return [];

    const locationsMap = new Map<string, AggregatedLocation>();
    
    lot.locations.forEach(location => {
      if (!locationsMap.has(location.containerName)) {
        locationsMap.set(location.containerName, {
          containerName: location.containerName,
          totalQuantity: 0,
          entries: []
        });
      }
      const aggregated = locationsMap.get(location.containerName)!;
      aggregated.totalQuantity += location.quantity;
      aggregated.entries.push(location);
    });

    return Array.from(locationsMap.values());
  });

  constructor() {
    this.route.params
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        const name = params['name'];
        if (name) {
          this.lotName.set(name);
          this.loadLotDetails(name);
        }
      });
  }

  loadLotDetails(name: string) {
    this.loading.set(true);
    this.lotService.getLotDetails(name)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (lot) => {
          this.lot.set(lot);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          // Handle error - maybe redirect to lots list
          this.router.navigate(['/lots']);
        }
      });
  }

  editLot() {
    this.router.navigate(['/lots', this.lotName(), 'edit']);
  }

  goBack() {
    this.router.navigate(['/lots']);
  }

  viewContainerDetails(containerName: string) {
    this.router.navigate(['/containers', containerName, 'details']);
  }

  getLocationKey(location: { containerName: string; inputTimestamp: string }): string {
    return `${location.containerName}|${location.inputTimestamp}`;
  }

  startEditingQuantity(location: { containerName: string; quantity: number; inputTimestamp: string }) {
    this.editingLocationKey.set(this.getLocationKey(location));
    this.editedQuantity.set(location.quantity);
  }

  cancelEditing() {
    this.editingLocationKey.set(null);
    this.editedQuantity.set(0);
  }

  saveQuantity(location: { containerName: string; inputTimestamp: string }) {
    const newQuantity = this.editedQuantity();
    if (newQuantity < 0) {
      return; // Don't allow negative quantities
    }

    this.actionService.updateLotQuantity({
      lotName: this.lotName(),
      containerName: location.containerName,
      quantity: newQuantity
    })
      .subscribe({
        next: () => {
          // Update the local state
          const lot = this.lot();
          if (lot) {
            const locationEntry = lot.locations.find(l => this.getLocationKey(l) === this.getLocationKey(location));
            if (locationEntry) {
            locationEntry.quantity = newQuantity;
            this.lot.set({ ...lot });
          }
        }
        this.editingLocationKey.set(null);
      },
      error: (err) => {
        console.error('Failed to update quantity:', err);
        this.cancelEditing();
      }
    });
  }
}