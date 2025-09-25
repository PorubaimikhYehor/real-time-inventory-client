import { Component, input, Input, output } from '@angular/core';
import { Container, Pagination } from '../../../../models/container';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-container-list',
  imports: [MatTableModule, MatPaginatorModule],
  templateUrl: './container-list.html',
  styleUrl: './container-list.css',
})
export class ContainerList {
  containers = input<Container[]>([]);
  pagination = input<Pagination>(new Pagination());

  pageEvent = output<Pagination>();

  handlePageEvent(event: any) {
    this.pageEvent.emit(event);
  }
}
