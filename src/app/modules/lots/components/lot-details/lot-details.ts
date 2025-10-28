import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LotService } from '../../services/lot-service';
import { ActionService } from '../../../actions/services/action.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

interface LotDetailsData {
  name: string;
  properties: { name: string; value: string }[];
  locations: { containerName: string; quantity: number }[];
}

@Component({
  selector: 'app-lot-details',
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatTableModule, MatChipsModule, MatTooltipModule, MatInputModule, MatFormFieldModule, FormsModule, ButtonComponent],
  templateUrl: './lot-details.html'
})
export class LotDetails implements OnInit {
  lot = signal<LotDetailsData | null>(null);
  loading = signal(false);
  lotName = signal('');
  editingContainer = signal<string | null>(null);
  editedQuantity = signal<number>(0);

  displayedPropertyColumns: string[] = ['name', 'value'];
  displayedLocationColumns: string[] = ['containerName', 'quantity'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private lotService: LotService,
    private actionService: ActionService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const name = params['name'];
      if (name) {
        this.lotName.set(name);
        this.loadLotDetails(name);
      }
    });
  }

  loadLotDetails(name: string) {
    this.loading.set(true);
    this.lotService.getLotDetails(name).subscribe({
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

  startEditingQuantity(containerName: string, currentQuantity: number) {
    this.editingContainer.set(containerName);
    this.editedQuantity.set(currentQuantity);
  }

  cancelEditing() {
    this.editingContainer.set(null);
    this.editedQuantity.set(0);
  }

  saveQuantity(containerName: string) {
    const newQuantity = this.editedQuantity();
    if (newQuantity < 0) {
      return; // Don't allow negative quantities
    }

    this.actionService.updateLotQuantity({
      lotName: this.lotName(),
      containerName: containerName,
      quantity: newQuantity
    }).subscribe({
      next: () => {
        // Update the local state
        const lot = this.lot();
        if (lot) {
          const location = lot.locations.find(l => l.containerName === containerName);
          if (location) {
            location.quantity = newQuantity;
            this.lot.set({ ...lot });
          }
        }
        this.editingContainer.set(null);
      },
      error: (err) => {
        console.error('Failed to update quantity:', err);
        this.cancelEditing();
      }
    });
  }
}