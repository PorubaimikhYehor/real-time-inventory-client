import { Component, computed, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../components/button/button.component';

@Component({
  selector: 'app-toolbar',
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, CommonModule, ButtonComponent],
  templateUrl: './toolbar.html',
  styleUrl: './toolbar.css'
})
export class Toolbar {
  currentRoute = '';
  pageTitle = computed(() => {
    if (this.currentRoute.startsWith('/containers/')) {
      const name = this.currentRoute.split('/')[2];
      return `Container Details: ${decodeURIComponent(name)}`;
    } else if (this.currentRoute === '/containers') {
      return 'Containers';
    }
    return 'Home';
  });

  constructor(private router: Router) {
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
}
