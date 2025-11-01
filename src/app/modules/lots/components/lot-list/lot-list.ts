import { Component, signal, computed, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { Lot } from '../../../../models/lot';
import { LotService } from '../../services/lot-service';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { ViewSwitcherComponent, ViewMode } from '../../../../shared/components/view-switcher/view-switcher.component';

@Component({
  selector: 'app-lot-list',
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, MatTableModule, ButtonComponent, ViewSwitcherComponent],
  templateUrl: './lot-list.html'
})
export class LotList {
  private lotService = inject(LotService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  lots = signal<Lot[]>([]);
  loading = signal(false);
  viewMode = signal<ViewMode>('cards');

  // Computed signal to get all unique property names across all lots
  displayedColumns = computed(() => {
    const lots = this.lots();
    const propertyNames = new Set<string>();

    // Collect all unique property names
    lots.forEach(lot => {
      lot.properties.forEach(prop => {
        propertyNames.add(prop.name);
      });
    });

    // Return column names: name, all properties, actions
    return ['name', ...Array.from(propertyNames).sort(), 'actions'];
  });

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
}