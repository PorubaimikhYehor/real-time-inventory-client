import { Component, OnInit, signal } from '@angular/core';

import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserManagementService } from '../services/user-management.service';
import { UserListItem, UserRole } from '@app/shared/models/auth';
import { CreateUserDialogComponent } from '../components/create-user-dialog.component';
import { ButtonComponent } from '@app/shared/components/button/button.component';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [
    MatTableModule,
    MatIconModule,
    MatChipsModule,
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule,
    ButtonComponent
],
  templateUrl: './users-list.component.html'
})
export class UsersListComponent implements OnInit {
  users = signal<UserListItem[]>([]);
  displayedColumns = ['email', 'name', 'role', 'actions'];

  constructor(
    private userService: UserManagementService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => this.users.set(users),
      error: () => this.showError('Failed to load users')
    });
  }

  createUser(): void {
    const dialogRef = this.dialog.open(CreateUserDialogComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userService.createUser(result).subscribe({
          next: () => {
            this.showSuccess('User created successfully');
            this.loadUsers();
          },
          error: (err) => {
            console.error('Create user error:', err);
            let message = 'Failed to create user';
            
            // Handle validation errors from FluentValidation
            if (err.error?.errors) {
              const errors = Object.values(err.error.errors).flat();
              message = errors.join(', ');
            } else if (err.error?.title) {
              message = err.error.title;
            } else if (err.error?.message) {
              message = err.error.message;
            } else if (err.message) {
              message = err.message;
            }
            
            this.showError(message);
          }
        });
      }
    });
  }

  editUser(user: UserListItem): void {
    this.showInfo('Edit user dialog - implement as needed');
  }

  changeRole(user: UserListItem): void {
    this.showInfo('Change role dialog - implement as needed');
  }

  resetPassword(user: UserListItem): void {
    this.showInfo('Reset password dialog - implement as needed');
  }

  deleteUser(user: UserListItem): void {
    if (confirm(`Delete user ${user.email}?`)) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.showSuccess('User deleted successfully');
          this.loadUsers();
        },
        error: () => this.showError('Failed to delete user')
      });
    }
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', { duration: 3000 });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
  }

  private showInfo(message: string): void {
    this.snackBar.open(message, 'Close', { duration: 3000 });
  }
}
