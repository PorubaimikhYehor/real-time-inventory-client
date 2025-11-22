import { Component, computed, output, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '@app/shared/components/button/button.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-toolbar',
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule, MatDividerModule, CommonModule, ButtonComponent],
  templateUrl: './toolbar.html',
  styleUrl: './toolbar.css'
})
export class Toolbar {
  router = inject(Router);
  authService = inject(AuthService);

  currentRoute = '';
  pageTitle = computed(() => {
    if (this.currentRoute.startsWith('/containers/')) {
      const name = this.currentRoute.split('/')[2];
      return `Container: ${decodeURIComponent(name)}`;
    } else if (this.currentRoute === '/containers') {
      return 'Containers';
    } else if (this.currentRoute.startsWith('/lots/')) {
      const name = this.currentRoute.split('/')[2];
      return `Lot: ${decodeURIComponent(name)}`;
    } else if (this.currentRoute === '/lots') {
      return 'Lots';
    } else if (this.currentRoute === '/actions') {
      return 'Actions';
    } else if (this.currentRoute === '/property-definitions') {
      return 'Property Definitions';
    } else if (this.currentRoute === '/profile') {
      return 'Profile';
    } else if (this.currentRoute === '/admin/users') {
      return 'User Management';
    }
    return 'Real-Time Inventory';
  });

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentRoute = event.url;
    });
  }

  toggleSidebar = output<void>();

  navigateToContainers() {
    this.router.navigate(['/containers']);
  }

  logout() {
    this.authService.logout();
  }
}
