import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpHandlerFn, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { provideZonelessChangeDetection } from '@angular/core';
import { of, throwError } from 'rxjs';

import { authInterceptor } from './auth.interceptor';
import { MockRouter } from '@testing/mock-router';

describe('authInterceptor', () => {
  let mockRouter: MockRouter;
  let mockNext: jasmine.Spy<HttpHandlerFn>;
  let originalLocalStorage: Storage;

  beforeEach(() => {
    mockRouter = new MockRouter();
    mockNext = jasmine.createSpy('next');

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: Router, useValue: mockRouter }
      ]
    });

    // Mock localStorage
    originalLocalStorage = window.localStorage;
    let store: Record<string, string> = {};
    spyOn(localStorage, 'getItem').and.callFake((key: string) => store[key] || null);
    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => {
      store[key] = value;
    });
    spyOn(localStorage, 'removeItem').and.callFake((key: string) => {
      delete store[key];
    });
    spyOn(localStorage, 'clear').and.callFake(() => {
      store = {};
    });
  });

  describe('authorization header', () => {
    it('should add Authorization header when token exists', (done) => {
      const token = 'test-jwt-token';
      (localStorage.getItem as jasmine.Spy).and.returnValue(token);

      const request = new HttpRequest('GET', '/api/test');
      mockNext.and.returnValue(of(new HttpResponse({ status: 200 })));

      TestBed.runInInjectionContext(() => {
        authInterceptor(request, mockNext).subscribe({
          next: () => {
            const modifiedRequest = mockNext.calls.mostRecent().args[0] as HttpRequest<any>;
            expect(modifiedRequest.headers.has('Authorization')).toBe(true);
            expect(modifiedRequest.headers.get('Authorization')).toBe(`Bearer ${token}`);
            done();
          },
          error: done.fail
        });
      });
    });

    it('should not add Authorization header when token does not exist', (done) => {
      (localStorage.getItem as jasmine.Spy).and.returnValue(null);

      const request = new HttpRequest('GET', '/api/test');
      mockNext.and.returnValue(of(new HttpResponse({ status: 200 })));

      TestBed.runInInjectionContext(() => {
        authInterceptor(request, mockNext).subscribe({
          next: () => {
            const modifiedRequest = mockNext.calls.mostRecent().args[0] as HttpRequest<any>;
            expect(modifiedRequest.headers.has('Authorization')).toBe(false);
            done();
          },
          error: done.fail
        });
      });
    });

    it('should retrieve token from access_token key in localStorage', (done) => {
      const token = 'my-access-token';
      (localStorage.getItem as jasmine.Spy).and.returnValue(token);

      const request = new HttpRequest('GET', '/api/data');
      mockNext.and.returnValue(of(new HttpResponse({ status: 200 })));

      TestBed.runInInjectionContext(() => {
        authInterceptor(request, mockNext).subscribe({
          next: () => {
            expect(localStorage.getItem).toHaveBeenCalledWith('access_token');
            done();
          },
          error: done.fail
        });
      });
    });

    it('should not modify the original request object', (done) => {
      const token = 'test-token';
      (localStorage.getItem as jasmine.Spy).and.returnValue(token);

      const request = new HttpRequest('GET', '/api/data');
      const originalHeaders = request.headers;
      mockNext.and.returnValue(of(new HttpResponse({ status: 200 })));

      TestBed.runInInjectionContext(() => {
        authInterceptor(request, mockNext).subscribe({
          next: () => {
            expect(request.headers).toBe(originalHeaders);
            expect(request.headers.has('Authorization')).toBe(false);
            done();
          },
          error: done.fail
        });
      });
    });
  });

  describe('401 Unauthorized handling', () => {
    it('should clear tokens and redirect to login on 401 error', (done) => {
      const token = 'expired-token';
      (localStorage.getItem as jasmine.Spy).and.returnValue(token);

      const request = new HttpRequest('GET', '/api/protected');
      const error = new HttpErrorResponse({
        status: 401,
        statusText: 'Unauthorized'
      });
      mockNext.and.returnValue(throwError(() => error));

      TestBed.runInInjectionContext(() => {
        authInterceptor(request, mockNext).subscribe({
          next: () => done.fail('Should have failed'),
          error: (err) => {
            expect(localStorage.removeItem).toHaveBeenCalledWith('access_token');
            expect(localStorage.removeItem).toHaveBeenCalledWith('refresh_token');
            expect(localStorage.removeItem).toHaveBeenCalledWith('current_user');
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
            expect(err.status).toBe(401);
            done();
          }
        });
      });
    });

    it('should not clear tokens on other error codes', (done) => {
      const token = 'valid-token';
      (localStorage.getItem as jasmine.Spy).and.returnValue(token);

      const request = new HttpRequest('GET', '/api/test');
      const error = new HttpErrorResponse({
        status: 500,
        statusText: 'Internal Server Error'
      });
      mockNext.and.returnValue(throwError(() => error));

      TestBed.runInInjectionContext(() => {
        authInterceptor(request, mockNext).subscribe({
          next: () => done.fail('Should have failed'),
          error: (err) => {
            expect(localStorage.removeItem).not.toHaveBeenCalled();
            expect(mockRouter.navigate).not.toHaveBeenCalled();
            expect(err.status).toBe(500);
            done();
          }
        });
      });
    });

    it('should not redirect on 404 errors', (done) => {
      const token = 'valid-token';
      (localStorage.getItem as jasmine.Spy).and.returnValue(token);

      const request = new HttpRequest('GET', '/api/not-found');
      const error = new HttpErrorResponse({
        status: 404,
        statusText: 'Not Found'
      });
      mockNext.and.returnValue(throwError(() => error));

      TestBed.runInInjectionContext(() => {
        authInterceptor(request, mockNext).subscribe({
          next: () => done.fail('Should have failed'),
          error: (err) => {
            expect(mockRouter.navigate).not.toHaveBeenCalled();
            expect(err.status).toBe(404);
            done();
          }
        });
      });
    });

    it('should not redirect on 403 Forbidden errors', (done) => {
      const token = 'valid-token';
      (localStorage.getItem as jasmine.Spy).and.returnValue(token);

      const request = new HttpRequest('GET', '/api/forbidden');
      const error = new HttpErrorResponse({
        status: 403,
        statusText: 'Forbidden'
      });
      mockNext.and.returnValue(throwError(() => error));

      TestBed.runInInjectionContext(() => {
        authInterceptor(request, mockNext).subscribe({
          next: () => done.fail('Should have failed'),
          error: (err) => {
            expect(mockRouter.navigate).not.toHaveBeenCalled();
            expect(err.status).toBe(403);
            done();
          }
        });
      });
    });
  });

  describe('request flow', () => {
    it('should pass through successful responses', (done) => {
      const token = 'valid-token';
      (localStorage.getItem as jasmine.Spy).and.returnValue(token);

      const request = new HttpRequest('GET', '/api/data');
      const response = new HttpResponse({
        status: 200,
        body: { data: 'test' }
      });
      mockNext.and.returnValue(of(response));

      TestBed.runInInjectionContext(() => {
        authInterceptor(request, mockNext).subscribe({
          next: (res) => {
            expect(res).toBe(response);
            expect((res as HttpResponse<any>).status).toBe(200);
            done();
          },
          error: done.fail
        });
      });
    });

    it('should work with POST requests', (done) => {
      const token = 'test-token';
      (localStorage.getItem as jasmine.Spy).and.returnValue(token);

      const request = new HttpRequest('POST', '/api/create', { name: 'test' });
      mockNext.and.returnValue(of(new HttpResponse({ status: 201 })));

      TestBed.runInInjectionContext(() => {
        authInterceptor(request, mockNext).subscribe({
          next: () => {
            const modifiedRequest = mockNext.calls.mostRecent().args[0] as HttpRequest<any>;
            expect(modifiedRequest.headers.get('Authorization')).toBe(`Bearer ${token}`);
            expect(modifiedRequest.method).toBe('POST');
            done();
          },
          error: done.fail
        });
      });
    });

    it('should work with PUT requests', (done) => {
      const token = 'test-token';
      (localStorage.getItem as jasmine.Spy).and.returnValue(token);

      const request = new HttpRequest('PUT', '/api/update/1', { name: 'updated' });
      mockNext.and.returnValue(of(new HttpResponse({ status: 200 })));

      TestBed.runInInjectionContext(() => {
        authInterceptor(request, mockNext).subscribe({
          next: () => {
            const modifiedRequest = mockNext.calls.mostRecent().args[0] as HttpRequest<any>;
            expect(modifiedRequest.headers.get('Authorization')).toBe(`Bearer ${token}`);
            expect(modifiedRequest.method).toBe('PUT');
            done();
          },
          error: done.fail
        });
      });
    });

    it('should work with DELETE requests', (done) => {
      const token = 'test-token';
      (localStorage.getItem as jasmine.Spy).and.returnValue(token);

      const request = new HttpRequest('DELETE', '/api/delete/1');
      mockNext.and.returnValue(of(new HttpResponse({ status: 204 })));

      TestBed.runInInjectionContext(() => {
        authInterceptor(request, mockNext).subscribe({
          next: () => {
            const modifiedRequest = mockNext.calls.mostRecent().args[0] as HttpRequest<any>;
            expect(modifiedRequest.headers.get('Authorization')).toBe(`Bearer ${token}`);
            expect(modifiedRequest.method).toBe('DELETE');
            done();
          },
          error: done.fail
        });
      });
    });
  });
});
