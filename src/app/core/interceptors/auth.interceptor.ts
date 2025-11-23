import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { StorageService } from '../services/storage.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const storage = inject(StorageService);

  // Get access token from storage
  const token = storage.getItem('access_token');

  // Clone request and add Authorization header if token exists
  const authReq = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      })
    : req;

  // Handle response
  return next(authReq).pipe(
    catchError(error => {
      // If 401 Unauthorized, clear tokens and redirect to login
      if (error.status === 401) {
        storage.removeItem('access_token');
        storage.removeItem('refresh_token');
        storage.removeItem('current_user');
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
