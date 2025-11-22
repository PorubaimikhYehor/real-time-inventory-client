import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { HttpService } from './http.service';
import { NotificationService } from './notification.service';
import { MockHttpClient } from '@testing/mock-http-client';
import { MockNotificationService } from '@testing/mock-notification-service';

describe('HttpService', () => {
  let service: HttpService;
  let mockHttpClient: MockHttpClient;
  let mockNotificationService: MockNotificationService;

  beforeEach(() => {
    mockHttpClient = new MockHttpClient();
    mockNotificationService = new MockNotificationService();

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        HttpService,
        { provide: HttpClient, useValue: mockHttpClient },
        { provide: NotificationService, useValue: mockNotificationService }
      ]
    });

    service = TestBed.inject(HttpService);
  });

  afterEach(() => {
    mockHttpClient.reset();
    mockNotificationService.reset();
  });

  describe('GET requests', () => {
    it('should make GET request and return data', (done) => {
      const testData = { id: 1, name: 'Test' };
      mockHttpClient.setGetResponse(testData);

      service.get<typeof testData>('/api/test').subscribe({
        next: (data) => {
          expect(data).toEqual(testData);
          expect(mockHttpClient.get).toHaveBeenCalledWith('/api/test');
          done();
        }
      });
    });

    it('should show success notification when successMessage is provided', (done) => {
      const testData = { id: 1 };
      mockHttpClient.setGetResponse(testData);

      service.get('/api/test', 'Data loaded successfully').subscribe({
        next: () => {
          expect(mockNotificationService.showSuccess).toHaveBeenCalledWith('Data loaded successfully');
          done();
        }
      });
    });

    it('should not show notification when successMessage is not provided', (done) => {
      mockHttpClient.setGetResponse({ data: 'test' });

      service.get('/api/test').subscribe({
        next: () => {
          expect(mockNotificationService.showSuccess).not.toHaveBeenCalled();
          done();
        }
      });
    });

    it('should handle HTTP errors and show error notification', (done) => {
      const errorResponse = new HttpErrorResponse({
        error: 'Not Found',
        status: 404,
        statusText: 'Not Found',
        url: '/api/test'
      });

      mockHttpClient.setError('get', errorResponse);

      service.get('/api/test').subscribe({
        error: (error) => {
          expect(error).toBe(errorResponse);
          expect(mockNotificationService.showError).toHaveBeenCalled();
          done();
        }
      });
    });
  });

  describe('POST requests', () => {
    it('should make POST request with body and return data', (done) => {
      const requestBody = { name: 'New Item' };
      const responseData = { id: 1, name: 'New Item' };
      mockHttpClient.setPostResponse(responseData);

      service.post('/api/test', requestBody).subscribe({
        next: (data) => {
          expect(data).toEqual(responseData);
          expect(mockHttpClient.post).toHaveBeenCalledWith('/api/test', requestBody);
          done();
        }
      });
    });

    it('should show success notification on successful POST', (done) => {
      mockHttpClient.setPostResponse({ id: 1 });

      service.post('/api/test', {}, 'Item created successfully').subscribe({
        next: () => {
          expect(mockNotificationService.showSuccess).toHaveBeenCalledWith('Item created successfully');
          done();
        }
      });
    });

    it('should handle POST errors', (done) => {
      const errorResponse = new HttpErrorResponse({
        error: { message: 'Validation failed' },
        status: 400,
        statusText: 'Bad Request'
      });

      mockHttpClient.setError('post', errorResponse);

      service.post('/api/test', {}).subscribe({
        error: (error) => {
          expect(error.status).toBe(400);
          expect(mockNotificationService.showError).toHaveBeenCalled();
          done();
        }
      });
    });
  });

  describe('PUT requests', () => {
    it('should make PUT request and return updated data', (done) => {
      const updateData = { id: 1, name: 'Updated' };
      mockHttpClient.setPutResponse(updateData);

      service.put('/api/test/1', updateData).subscribe({
        next: (data) => {
          expect(data).toEqual(updateData);
          expect(mockHttpClient.put).toHaveBeenCalledWith('/api/test/1', updateData);
          done();
        }
      });
    });

    it('should show success notification on successful PUT', (done) => {
      mockHttpClient.setPutResponse({ id: 1 });

      service.put('/api/test/1', {}, 'Item updated').subscribe({
        next: () => {
          expect(mockNotificationService.showSuccess).toHaveBeenCalledWith('Item updated');
          done();
        }
      });
    });
  });

  describe('DELETE requests', () => {
    it('should make DELETE request', (done) => {
      mockHttpClient.setDeleteResponse(null);

      service.delete('/api/test/1').subscribe({
        next: () => {
          expect(mockHttpClient.delete).toHaveBeenCalledWith('/api/test/1');
          done();
        }
      });
    });

    it('should show success notification on successful DELETE', (done) => {
      mockHttpClient.setDeleteResponse(null);

      service.delete('/api/test/1', 'Item deleted').subscribe({
        next: () => {
          expect(mockNotificationService.showSuccess).toHaveBeenCalledWith('Item deleted');
          done();
        }
      });
    });

    it('should handle DELETE errors', (done) => {
      const errorResponse = new HttpErrorResponse({
        status: 403,
        statusText: 'Forbidden'
      });

      mockHttpClient.setError('delete', errorResponse);

      service.delete('/api/test/1').subscribe({
        error: (error) => {
          expect(error.status).toBe(403);
          done();
        }
      });
    });
  });

  describe('Error handling', () => {
    it('should show generic error for unknown HTTP errors', (done) => {
      const errorResponse = new HttpErrorResponse({
        status: 500,
        statusText: 'Internal Server Error'
      });

      mockHttpClient.setError('get', errorResponse);

      service.get('/api/test').subscribe({
        error: () => {
          expect(mockNotificationService.showError).toHaveBeenCalled();
          done();
        }
      });
    });

    it('should handle network errors', (done) => {
      const errorResponse = new HttpErrorResponse({
        error: new ProgressEvent('error'),
        status: 0,
        statusText: 'Unknown Error'
      });

      mockHttpClient.setError('get', errorResponse);

      service.get('/api/test').subscribe({
        error: (error) => {
          expect(error.status).toBe(0);
          expect(mockNotificationService.showError).toHaveBeenCalled();
          done();
        }
      });
    });
  });
});
