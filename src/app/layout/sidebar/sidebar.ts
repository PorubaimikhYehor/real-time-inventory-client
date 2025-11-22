import { Component, input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '@app/core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, MatListModule, MatIconModule],
  templateUrl: './sidebar.html'
})
export class Sidebar {
  isOpen = input.required<boolean>();
  authService = inject(AuthService);
}
