import { Component, signal, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ContainerListComponent } from '../components/container-list/container-list.component';
import { Container, GetAllContainersRequest, Pagination } from '../../../shared/models/container';
import { ContainerService } from '../services/container-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-containers',
  imports: [ContainerListComponent],
  templateUrl: './containers.component.html',
  styleUrl: './containers.component.css'
})
export class ContainersComponent {
  private containerService = inject(ContainerService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  containers = signal<Container[]>([]);
  pagination = signal<Pagination>(new Pagination());

  constructor() {
    this.loadContainers();
  }

  private loadContainers(pagination?: GetAllContainersRequest) {
    this.containerService.getContainers(pagination)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          console.log('Response received:', response);
          this.containers.set(response.getContainers());
          this.pagination.set({
            page: response.page,
            pageSize: response.pageSize,
            total: response.total,
            hasNextPage: response.hasNextPage
          }); 
        },
        error: (err) => {
          console.error('Error loading containers:', err);
        }
      });
  }

  onPageEvent(event: any) {
    console.log(event);
    this.loadContainers(new GetAllContainersRequest({
      page: event.pageIndex + 1,
      pageSize: event.pageSize
    }));
  }

  onEditContainer(container: Container) {
    this.router.navigate(['/containers', container.name, 'edit']);
  }

  onRemoveContainer(container: Container) {
    if (confirm(`Are you sure you want to delete ${container.name}?`)) {
      this.containerService.deleteContainer(container.name)
        .subscribe({
          next: () => {
            this.loadContainers(); // Reload the list
          },
          error: (err) => {
            console.error('Error deleting container:', err);
          }
        });
    }
  } 
}
