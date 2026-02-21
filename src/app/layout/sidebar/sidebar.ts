import { Component, input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RouterLinkActive } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '@app/core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, MatListModule, MatIconModule, RouterLinkActive],
  templateUrl: './sidebar.html'
})
export class Sidebar {
  active = '';
  isOpen = input.required<boolean>();
  authService = inject(AuthService);
  readonly items = [
    { label: 'Containers', icon: 'warehouse', routerLink: '/containers' },
    { label: 'Lots', icon: 'inventory', routerLink: '/lots' },
    { label: 'Actions', icon: 'build', routerLink: '/actions' },
    { label: 'Property Definitions', icon: 'settings', routerLink: '/property-definitions' },
    ...(this.authService.isAdmin() ? [{ label: 'Users', icon: 'people', routerLink: '/users' }] : [])
  ];
  onActiveChange(route: string, isActive: boolean) {
    this.active = route && isActive ? route : this.active;
  }
}