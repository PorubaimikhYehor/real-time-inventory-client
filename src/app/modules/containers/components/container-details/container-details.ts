import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { ActivatedRoute, Router } from '@angular/router';
import { ContainerService } from '../../services/container-service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

interface ContainerDetailsData {
  name: string;
  properties: { name: string; value: string }[];
  lots: { name: string; quantity: number }[];
}

@Component({
  selector: 'app-container-details',
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatTableModule, MatChipsModule, ButtonComponent],
  templateUrl: './container-details.html'
})
export class ContainerDetails implements OnInit {
  container = signal<ContainerDetailsData | null>(null);
  loading = signal(false);
  containerName = signal('');

  displayedPropertyColumns: string[] = ['name', 'value'];
  displayedLotColumns: string[] = ['name', 'quantity'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private containerService: ContainerService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const name = params['name'];
      if (name) {
        this.containerName.set(name);
        this.loadContainerDetails(name);
      }
    });
  }

  loadContainerDetails(name: string) {
    this.loading.set(true);
    this.containerService.getContainerWithLots(name).subscribe({
      next: (container) => {
        this.container.set(container);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        // Handle error - maybe redirect to containers list
        this.router.navigate(['/containers']);
      }
    });
  }

  editContainer() {
    this.router.navigate(['/containers', this.containerName(), 'edit']);
  }

  goBack() {
    this.router.navigate(['/containers']);
  }

  viewLotDetails(lotName: string) {
    this.router.navigate(['/lots', lotName, 'details']);
  }
}