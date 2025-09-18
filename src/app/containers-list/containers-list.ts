import { Component, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ViewChild } from '@angular/core';
import { ContainersService, Container } from '../containers.service';
import { Observable, of } from 'rxjs';
import { catchError, map, startWith } from 'rxjs/operators';

interface ContainersListState {
  loading: boolean;
  error: string | null;
  data: Container[];
}

@Component({
  selector: 'app-containers-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatPaginatorModule],
  templateUrl: './containers-list.html',
  styleUrl: './containers-list.css'
})
export class ContainersList {
  @ViewChild('paginator') paginator: any;
  pageSize = 3;
  pageIndex = 0;

  get pagedTableData() {
    const data = this.tableData();
    const start = this.pageIndex * this.pageSize;
    return data.slice(start, start + this.pageSize);
  }

  onPage(event: any) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }
  state$: Observable<ContainersListState>;
  counter: number = 0;
  displayedColumns = signal<string[]>(['name']);
  tableData = signal<any[]>([]);

  constructor(private containersService: ContainersService) {
    // Angular Material and Tailwind should be used on this project
    this.state$ = this.containersService.getContainers().pipe(
      map(data => ({ loading: false, error: null, data })),
      catchError(() => of({ loading: false, error: 'Failed to load containers', data: [] })),
      startWith({ loading: true, error: null, data: [] })
    );
    // Dynamically compute columns and flatten data when state changes
    effect(() => {
      this.state$.subscribe((state: ContainersListState) => {
        if (state.data && state.data.length) {
          const propertyNames = Array.from(new Set(state.data.flatMap((c: Container) => c.properties?.map((p: any) => p.name) || [])));
          this.displayedColumns.set(['name', ...propertyNames]);
          this.tableData.set(state.data.map(container => {
            const row: any = { name: container.name };
            propertyNames.forEach(prop => {
              row[prop] = container.properties?.find((p: any) => p.name === prop)?.value || '';
            });
            return row;
          }));
        } else {
          this.displayedColumns.set(['name']);
          this.tableData.set([]);
        }
      });
    });
  }

  counterPlus() {
    this.counter++;
  }
}
