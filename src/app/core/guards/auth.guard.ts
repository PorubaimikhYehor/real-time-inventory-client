import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // Check role-based access if required
  const requiredRole = route.data?.['role'] as string | undefined;
  if (requiredRole) {
    const userRole = authService.currentUser()?.role;
    
    // Check role hierarchy
    const roleHierarchy: Record<string, number> = {
      'Viewer': 1,
      'Operator': 2,
      'Manager': 3,
      'Admin': 4
    };

    const userLevel = userRole ? roleHierarchy[userRole] : 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;

    if (userLevel < requiredLevel) {
      router.navigate(['/']);
      return false;
    }
  }

  return true;
};

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAdmin()) {
    router.navigate(['/']);
    return false;
  }

  return true;
};
