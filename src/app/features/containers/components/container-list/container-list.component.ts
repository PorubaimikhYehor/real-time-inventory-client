import { Component, input, Input, output, signal, computed, inject } from '@angular/core';
import { Container, Pagination } from '@app/shared/models/container';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonComponent } from '@app/shared/components/button/button.component';
import { ViewSwitcherComponent, ViewMode } from '@app/shared/components/view-switcher/view-switcher.component';

@Component({
  selector: 'app-container-list',
  imports: [MatTableModule, MatPaginatorModule, MatButtonModule, MatIconModule, MatCardModule, MatChipsModule, CommonModule, ButtonComponent, ViewSwitcherComponent],
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

  viewMode = signal<ViewMode>('cards');

  // Computed signal to get all unique property names across all containers
  displayedColumns = computed(() => {
    const containers = this.containers();
    const propertyNames = new Set<string>();

    // Collect all unique property names
    containers.forEach(container => {
      container.properties.forEach(prop => {
        propertyNames.add(prop.name);
      });
    });

    // Return column names: name, all properties, actions
    return ['name', ...Array.from(propertyNames).sort(), 'actions'];
  });

  handlePageEvent(event: any) {
    this.pageEvent.emit(event);
  }

  createContainer() {
    this.router.navigate(['/containers/create']);
  }

  onViewChange(mode: ViewMode) {
    this.viewMode.set(mode);
  }

  viewContainerDetails(container: Container) {
    this.router.navigate(['/containers', container.name, 'details']);
  }
}
