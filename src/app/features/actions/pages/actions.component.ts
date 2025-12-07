import { Component } from '@angular/core';

import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MoveMaterialsComponent } from '../components/move-materials/move-materials.component';

@Component({
  selector: 'app-actions',
  imports: [
    MatTabsModule,
    MatIconModule,
    MatCardModule,
    MoveMaterialsComponent
],
  templateUrl: './actions.component.html',
  styleUrl: './actions.component.css'
})
export class ActionsComponent {
  selectedTabIndex = 0; // Default to Move Materials tab

  // Mock data - in a real app, these would come from services
  getContainerCount(): number {
    return 12; // This would be fetched from a service
  }

  getLotCount(): number {
    return 45; // This would be fetched from a service
  }

  getTransferCount(): number {
    return 8; // This would be fetched from a service
  }

  getEfficiencyRate(): number {
    return 94; // This would be calculated from service data
  }
}