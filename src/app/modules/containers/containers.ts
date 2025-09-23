import { Component } from '@angular/core';
import { ContainerList } from './components/container-list/container-list';
import { Container, Pagination } from '../../models/container';
import { ContainerService } from './services/container-service';

@Component({
  selector: 'app-containers',
  imports: [ContainerList],
  templateUrl: './containers.html',
  styleUrl: './containers.css'
})
export class Containers {

  containers: Container[] = [];
  pagination: Pagination = new Pagination();

  constructor(private containerService: ContainerService ) { }

  ngOnInit() {
    this.loadContainers();
  }

  private loadContainers() {
    this.containerService.getContainers().subscribe(response => {
      this.containers.push(...response.items);
      // Assign the pagination object directly from the response
      this.pagination = {
        page: response.page,
        pageSize: response.pageSize,
        total: response.total,
        hasNextPage: response.hasNextPage
      };
      console.log('Loaded containers:', this.containers);
      console.log('Loaded pagination:', this.pagination);
      console.log(response);
    });
  }
}
