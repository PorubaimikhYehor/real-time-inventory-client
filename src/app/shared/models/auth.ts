export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
  userName?: string;
  role: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  userName?: string;
  role: string;
  fullName: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}

export interface UserListItem {
  id: string;
  email: string;
  userName?: string;
  firstName?: string;
  lastName?: string;
  role: string;
}

export interface UpdateUserRequest {
  email: string;
  firstName?: string;
  lastName?: string;
  userName?: string;
}

export interface ChangeRoleRequest {
  role: string;
}

export interface ResetPasswordRequest {
  newPassword: string;
}

export type UserRole = 'Admin' | 'Manager' | 'Operator' | 'Viewer';
