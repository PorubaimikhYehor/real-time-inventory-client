import { Component, input, Input, output, signal, computed, inject } from '@angular/core';
import { Container, Pagination } from '@app/shared/models/container';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';

import { Router } from '@angular/router';
import { ButtonComponent } from '@app/shared/components/button/button.component';
import { ViewSwitcherComponent, ViewMode } from '@app/shared/components/view-switcher/view-switcher.component';
import { TableComponent } from '@app/shared/components/table/table.component';

@Component({
  selector: 'app-container-list',
  imports: [MatTableModule, MatPaginatorModule, MatButtonModule, MatIconModule, MatCardModule, MatChipsModule, ButtonComponent, ViewSwitcherComponent, TableComponent],
  templateUrl: './container-list.component.html',
  styleUrl: './container-list.component.css',
})
export class ContainerListComponent {
  private router = inject(Router);

  containers = input<Container[]>([]);
  pagination = input<Pagination>(new Pagination());

  pageEvent = output<Pagination>();
  editContainer = output<Container>();
  removeContainer = output<Container>();

  viewMode = signal<ViewMode>('table');

  handlePageEvent(event: any) {
    this.pageEvent.emit(event);
  }

  createContainer() {
    this.router.navigate(['/containers/create']);
  }

  onViewChange(mode: ViewMode) {
    this.viewMode.set(mode);
  }

  viewDetails(entity: any) {
    this.router.navigate(['/containers', entity.name, 'details']);
  }

  onEditEntity(entity: any) {
    this.editContainer.emit(entity as Container);
  }

  onRemoveEntity(entity: any) {
    this.removeContainer.emit(entity as Container);
  }
}
