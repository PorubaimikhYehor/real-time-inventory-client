import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  UserListItem,
  UpdateUserRequest,
  ChangeRoleRequest,
  ResetPasswordRequest,
  RegisterRequest,
  TokenResponse
} from '@app/shared/models/auth';

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  private readonly API_URL = '/api/users';

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<UserListItem[]> {
    return this.http.get<UserListItem[]>(this.API_URL);
  }

  getUserById(userId: string): Observable<UserListItem> {
    return this.http.get<UserListItem>(`${this.API_URL}/${userId}`);
  }

  createUser(request: RegisterRequest): Observable<TokenResponse> {
    return this.http.post<TokenResponse>('/api/auth/register', request);
  }

  updateUser(userId: string, request: UpdateUserRequest): Observable<UserListItem> {
    return this.http.put<UserListItem>(`${this.API_URL}/${userId}`, request);
  }

  deleteUser(userId: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${userId}`);
  }

  changeUserRole(userId: string, request: ChangeRoleRequest): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.API_URL}/${userId}/role`, request);
  }

  resetUserPassword(userId: string, request: ResetPasswordRequest): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.API_URL}/${userId}/password`, request);
  }
}
