import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';

export type ViewMode = 'cards' | 'table';

@Component({
  selector: 'app-view-switcher',
  standalone: true,
  imports: [CommonModule, MatButtonToggleModule, MatIconModule],
  template: `
    <mat-button-toggle-group [value]="currentView" (change)="onViewChange($event)">
      <mat-button-toggle value="cards" aria-label="Card view">
        <mat-icon>view_module</mat-icon>
        Cards
      </mat-button-toggle>
      <mat-button-toggle value="table" aria-label="Table view">
        <mat-icon>table_chart</mat-icon>
        Table
      </mat-button-toggle>
    </mat-button-toggle-group>
  `
})
export class ViewSwitcherComponent {
  currentView = input<ViewMode>('cards');
  viewChange = output<ViewMode>();

  onViewChange(event: any) {
    this.viewChange.emit(event.value);
  }
}