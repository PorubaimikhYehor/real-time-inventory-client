import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContainersService, Container } from '../containers.service';

@Component({
  selector: 'app-containers-list',
  imports: [CommonModule],
  templateUrl: './containers-list.html',
  styleUrl: './containers-list.css'
})
export class ContainersList implements OnInit {
  containers: Container[] = [];
  loading = true;
  error: string | null = null;

  constructor(private containersService: ContainersService) {}

  ngOnInit() {
    this.containersService.getContainers().subscribe({
      next: (data) => {
        console.log('Containers loaded:', data);
        
        this.containers = data;
        this.loading = false;
        console.log(this.loading);
      },
      error: (err) => {
        this.error = 'Failed to load containers';
        this.loading = false;
      }
    });
  }
}
