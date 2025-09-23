import { Component, input, Input } from '@angular/core';
import { Container, Pagination } from '../../../../models/container';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-container-list',
  imports: [JsonPipe],
  templateUrl: './container-list.html',
  styleUrl: './container-list.css',
})
export class ContainerList {
  @Input() containers: Container[] = [];
  @Input() pagination: Pagination = new Pagination();
// readonly containers = input<Container[]>();
// readonly pagination = input<Pagination>();


  counter:number = 0;

  ngOnInit() {
    console.log('ContainerList initialized with containers:', this.containers);
    console.log('Pagination info:', this.pagination);
  }

  ngOnChanges() {
    console.log('ContainerList input properties changed.');
    console.log('ContainerList containers:', this.containers);
    console.log('ContainerList pagination:', this.pagination);
  }

  incrementCounter() {
    this.counter++;
  }
}
