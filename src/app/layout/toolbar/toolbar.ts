import { Component, computed, output, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { RouterLink } from '@angular/router';

import { ButtonComponent } from '@app/shared/components/button/button.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-toolbar',
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule, MatDividerModule, ButtonComponent, RouterLink],
  templateUrl: './toolbar.html',
  styleUrl: './toolbar.scss'
})
export class Toolbar {
  private activatedRoute = inject(ActivatedRoute);
  router = inject(Router);
  authService = inject(AuthService);


  toggleSidebar = output<void>();

  navigateToContainers() {
    this.router.navigate(['/containers']);
  }

  logout() {
    this.authService.logout();
  }
}
