import { Component, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from "@angular/router";
import { HomeService } from '../services/home.service';

@Component({
  selector: 'app-home.component',
  imports: [MatCardModule, MatIconModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  homeService = inject(HomeService);
  
  items = signal<any[]>(
  [
    { name: 'Containers', label: 'Total Containers', icon: 'warehouse', routerLink: '/containers', data: { count: 0 } },
    { name: 'Lots', label: 'Total Lots', icon: 'inventory', routerLink: '/lots', data: { count: 0 } },
  ]);

  getInformation = () => this.homeService.getInformation().subscribe((data: any) => {
    
    data?.items?.forEach((item: any) => {
       const found = this.items().find(i => i.name === item.name);
       if (found && found.data) {
         found.data.count = item.totalCount || 0;
       }
    });
    this.items.set([...this.items()]);
  });
  constructor() {
    this.getInformation();
  }
}
