import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Toolbar } from './layout/toolbar/toolbar';
import { Sidebar } from './layout/sidebar/sidebar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Toolbar, Sidebar, MatSidenavModule, MatSnackBarModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  authService = inject(AuthService);
  protected readonly title = signal('real-time-inventory-client');
  sidebarOpen = signal(true);

  toggleSidebar() {
    this.sidebarOpen.set(!this.sidebarOpen());
  }
}
