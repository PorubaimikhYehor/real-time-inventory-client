import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { RouterLink } from '@angular/router';
import { AuthService } from '@app/core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    RouterLink
  ],
  templateUrl: './profile.component.html'
})
export class ProfileComponent {
  authService = inject(AuthService);
  user = this.authService.currentUser;

  getRoleColor(): string {
    const role = this.user()?.role;
    const colors: Record<string, string> = {
      'Admin': '#f44336',
      'Manager': '#ff9800',
      'Operator': '#4caf50',
      'Viewer': '#2196f3'
    };
    return colors[role || ''] || '#9e9e9e';
  }
}
