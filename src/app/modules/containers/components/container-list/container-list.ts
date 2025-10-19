import { Component, input, Input, output } from '@angular/core';
import { Container, Pagination } from '../../../../models/container';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

@Component({
  selector: 'app-container-list',
  imports: [MatTableModule, MatPaginatorModule, MatButtonModule, MatIconModule, RouterLink, ButtonComponent],
  templateUrl: './container-list.html',
  styleUrl: './container-list.css',
})
export class ContainerList {
  containers = input<Container[]>([]);
  pagination = input<Pagination>(new Pagination());

  pageEvent = output<Pagination>();
  editContainer = output<Container>();
  removeContainer = output<Container>();

  handlePageEvent(event: any) {
    this.pageEvent.emit(event);
  }
}
