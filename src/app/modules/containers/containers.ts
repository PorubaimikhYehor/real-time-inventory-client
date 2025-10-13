import { Component, signal, OnInit } from '@angular/core';
import { ContainerList } from './components/container-list/container-list';
import { Container, GetAllContainersRequest, Pagination } from '../../models/container';
import { ContainerService } from './services/container-service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CreateContainerDialog } from './components/create-container-dialog/create-container-dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-containers',
  imports: [ContainerList, MatDialogModule],
  templateUrl: './containers.html',
  styleUrl: './containers.css'
})
export class Containers implements OnInit {

  containers = signal<Container[]>([]);
  pagination = signal<Pagination>(new Pagination());

  constructor(private containerService: ContainerService, private dialog: MatDialog, private router: Router) { }

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

  onNewContainer() {
    const dialogRef = this.dialog.open(CreateContainerDialog, {
      width: '600px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.containerService.createContainer(result).subscribe({
          next: () => {
            this.loadContainers(); // Reload the list
          },
          error: (err) => {
            console.error('Error creating container:', err);
          }
        });
      }
    });
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
