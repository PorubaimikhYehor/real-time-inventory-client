import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { Lot } from '../../../../models/lot';
import { LotService } from '../../services/lot-service';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

@Component({
  selector: 'app-lot-list',
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, ButtonComponent],
  templateUrl: './lot-list.html'
})
export class LotList {
  lots = signal<Lot[]>([]);
  loading = signal(false);

  constructor(private lotService: LotService, private router: Router) {
    this.loadLots();
  }

  loadLots() {
    this.loading.set(true);
    this.lotService.getLots().subscribe({
      next: (lots) => {
        this.lots.set(lots);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  createLot() {
    this.router.navigate(['/lots/create']);
  }

  viewLotDetails(lot: Lot) {
    this.router.navigate(['/lots', lot.name, 'details']);
  }

  editLot(lot: Lot) {
    this.router.navigate(['/lots', lot.name, 'edit']);
  }

  deleteLot(lot: Lot) {
    if (confirm(`Are you sure you want to delete lot "${lot.name}"?`)) {
      this.lotService.deleteLot(lot.name).subscribe({
        next: () => {
          this.loadLots(); // Reload the list after deletion
        }
      });
    }
  }
}