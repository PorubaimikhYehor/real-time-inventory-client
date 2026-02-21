import { Component, signal, computed, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { Lot } from '@app/shared/models/lot';
import { LotService } from '../../services/lot-service';
import { Router } from '@angular/router';
import { ButtonComponent } from '@app/shared/components/button/button.component';
import { ViewSwitcherComponent, ViewMode } from '@app/shared/components/view-switcher/view-switcher.component';
import { TableComponent } from '@app/shared/components/table/table.component';

@Component({
  selector: 'app-lot-list',
  imports: [MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, MatTableModule, ButtonComponent, ViewSwitcherComponent, TableComponent],
  templateUrl: './lot-list.component.html'
})
export class LotListComponent {
  private lotService = inject(LotService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  lots = signal<Lot[]>([]);
  loading = signal(false);
  viewMode = signal<ViewMode>('cards');

  constructor() {
    this.loadLots();
  }

  loadLots() {
    this.loading.set(true);
    this.lotService.getLots()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
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
      this.lotService.deleteLot(lot.name)
        .subscribe({
          next: () => {
            this.loadLots(); // Reload the list after deletion
          }
        });
    }
  }

  onViewChange(mode: ViewMode) {
    this.viewMode.set(mode);
  }

  onEditEntity(entity: any) {
    this.editLot(entity as Lot);
  }

  onRemoveEntity(entity: any) {
    this.deleteLot(entity as Lot);
  }

  onViewDetails(entity: any) {
    this.viewLotDetails(entity as Lot);
  }
}