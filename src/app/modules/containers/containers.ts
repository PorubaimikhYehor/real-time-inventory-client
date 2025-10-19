import { Component, signal, OnInit } from '@angular/core';
import { ContainerList } from './components/container-list/container-list';
import { Container, GetAllContainersRequest, Pagination } from '../../models/container';
import { ContainerService } from './services/container-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-containers',
  imports: [ContainerList],
  templateUrl: './containers.html',
  styleUrl: './containers.css'
})
export class Containers implements OnInit {

  containers = signal<Container[]>([]);
  pagination = signal<Pagination>(new Pagination());

  constructor(private containerService: ContainerService, private router: Router) { }

  ngOnInit() {
    this.loadContainers();
  }

  private loadContainers(pagination?: GetAllContainersRequest) {
    this.containerService.getContainers(pagination)
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
    this.router.navigate(['/containers', container.name]);
  }

  onRemoveContainer(container: Container) {
    if (confirm(`Are you sure you want to delete ${container.name}?`)) {
      this.containerService.deleteContainer(container.name).subscribe({
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
