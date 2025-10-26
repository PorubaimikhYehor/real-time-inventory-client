import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { LotService } from '../../services/lot-service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

interface LotDetailsData {
  name: string;
  properties: { name: string; value: string }[];
  locations: { containerName: string; quantity: number }[];
}

@Component({
  selector: 'app-lot-details',
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatTableModule, MatChipsModule, MatTooltipModule, ButtonComponent],
  templateUrl: './lot-details.html'
})
export class LotDetails implements OnInit {
  lot = signal<LotDetailsData | null>(null);
  loading = signal(false);
  lotName = signal('');

  displayedPropertyColumns: string[] = ['name', 'value'];
  displayedLocationColumns: string[] = ['containerName', 'quantity'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private lotService: LotService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const name = params['name'];
      if (name) {
        this.lotName.set(name);
        this.loadLotDetails(name);
      }
    });
  }

  loadLotDetails(name: string) {
    this.loading.set(true);
    this.lotService.getLotDetails(name).subscribe({
      next: (lot) => {
        this.lot.set(lot);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        // Handle error - maybe redirect to lots list
        this.router.navigate(['/lots']);
      }
    });
  }

  editLot() {
    this.router.navigate(['/lots', this.lotName(), 'edit']);
  }

  goBack() {
    this.router.navigate(['/lots']);
  }

  viewContainerDetails(containerName: string) {
    this.router.navigate(['/containers', containerName, 'details']);
  }
}