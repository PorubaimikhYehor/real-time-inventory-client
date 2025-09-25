import { Component, signal } from '@angular/core';
import { ContainerList } from './components/container-list/container-list';
import { Container, GetAllContainersRequest, Pagination } from '../../models/container';
import { ContainerService } from './services/container-service';

@Component({
  selector: 'app-containers',
  imports: [ContainerList],
  templateUrl: './containers.html',
  styleUrl: './containers.css'
})
export class Containers {

  containers = signal<Container[]>([]);
  pagination = signal<Pagination>(new Pagination());

  constructor(private containerService: ContainerService) { }

  ngOnInit() {
    this.loadContainers();
  }

  private loadContainers(pagination?: GetAllContainersRequest) {
    this.containerService.getContainers(pagination)
      .subscribe(response => {
        console.log('Response received:', response);
        this.containers.set(response.getContainers());
        this.pagination.set({
          page: response.page,
          pageSize: response.pageSize,
          total: response.total,
          hasNextPage: response.hasNextPage
        }); 
      });
  }

  onPageEvent(event: any) {
    console.log(event);
    this.loadContainers(new GetAllContainersRequest({
      page: event.pageIndex + 1,
      pageSize: event.pageSize
    }));
  } 
/* 
{
  "previousPageIndex": 0,
  "pageIndex": 0,
  "pageSize": 25,
  "length": 6
}
*/


/* 
   "page": 0,}
  "pageSize": 0,
  "filtes": {
    "names": [
      "string"
    ],
    "properties": [
      {
        "name": "string",
        "values": [
          "string"
        ]
      }
    ]
  },
  "sortBy": "string" 
  */
}
