import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) { }

  get<T>(url: string, successMessage?: string): Observable<T> {
    return this.http.get<T>(url).pipe(
      tap(() => {
        if (successMessage) {
          this.notificationService.showSuccess(successMessage);
        }
      }),
      catchError((error: HttpErrorResponse) => {
        this.handleError(error);
        return throwError(() => error);
      })
    );
  }

  post<T>(url: string, body: any, successMessage?: string): Observable<T> {
    return this.http.post<T>(url, body).pipe(
      tap(() => {
        if (successMessage) {
          this.notificationService.showSuccess(successMessage);
        }
      }),
      catchError((error: HttpErrorResponse) => {
        this.handleError(error);
        return throwError(() => error);
      })
    );
  }

  put<T>(url: string, body: any, successMessage?: string): Observable<T> {
    return this.http.put<T>(url, body).pipe(
      tap(() => {
        if (successMessage) {
          this.notificationService.showSuccess(successMessage);
        }
      }),
      catchError((error: HttpErrorResponse) => {
        this.handleError(error);
        return throwError(() => error);
      })
    );
  }

  delete<T>(url: string, successMessage?: string): Observable<T> {
    return this.http.delete<T>(url).pipe(
      tap(() => {
        if (successMessage) {
          this.notificationService.showSuccess(successMessage);
        }
      }),
      catchError((error: HttpErrorResponse) => {
        this.handleError(error);
        return throwError(() => error);
      })
    );
  }

  private handleError(error: HttpErrorResponse): void {
    let errorMessage = 'An unexpected error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.error?.errors && Array.isArray(error.error.errors)) {
        // Handle validation errors format: {"errors":[{"propertyName":"Name","message":"Container already exists"}]}
        const validationErrors = error.error.errors as Array<{propertyName: string, message: string}>;
        const errorMessages = validationErrors.map(err => `${err.propertyName}: ${err.message}`);
        errorMessage = errorMessages.join('\n');
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.status === 404) {
        errorMessage = 'Resource not found';
      } else if (error.status === 400) {
        errorMessage = 'Invalid request data';
      } else if (error.status === 401) {
        errorMessage = 'Unauthorized access';
      } else if (error.status === 403) {
        errorMessage = 'Access forbidden';
      } else if (error.status === 500) {
        errorMessage = 'Server error occurred';
      } else {
        errorMessage = `Server error: ${error.status} ${error.statusText}`;
      }
    }

    this.notificationService.showError(errorMessage);
  }
}