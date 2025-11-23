/// <reference types="jasmine" />
import { HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';

/**
 * Mock HttpClient for testing
 * Provides spy methods that can be configured for different test scenarios
 */
export class MockHttpClient {
  get = jasmine.createSpy('get').and.returnValue(of({}));
  post = jasmine.createSpy('post').and.returnValue(of({}));
  put = jasmine.createSpy('put').and.returnValue(of({}));
  delete = jasmine.createSpy('delete').and.returnValue(of({}));
  patch = jasmine.createSpy('patch').and.returnValue(of({}));
  request = jasmine.createSpy('request').and.returnValue(of({}));
  head = jasmine.createSpy('head').and.returnValue(of({}));
  options = jasmine.createSpy('options').and.returnValue(of({}));
  jsonp = jasmine.createSpy('jsonp').and.returnValue(of({}));

  /**
   * Configure GET requests to return specific data
   */
  setGetResponse(data: any) {
    this.get.and.returnValue(of(data));
  }

  /**
   * Configure POST requests to return specific data
   */
  setPostResponse(data: any) {
    this.post.and.returnValue(of(data));
  }

  /**
   * Configure PUT requests to return specific data
   */
  setPutResponse(data: any) {
    this.put.and.returnValue(of(data));
  }

  /**
   * Configure DELETE requests to return specific data
   */
  setDeleteResponse(data: any) {
    this.delete.and.returnValue(of(data));
  }

  /**
   * Configure any HTTP method to throw an error
   */
  setError(method: 'get' | 'post' | 'put' | 'delete' | 'patch', error: any) {
    this[method].and.returnValue(throwError(() => error));
  }

  /**
   * Reset all spies
   */
  reset() {
    this.get.calls.reset();
    this.post.calls.reset();
    this.put.calls.reset();
    this.delete.calls.reset();
    this.patch.calls.reset();
  }
}

/**
 * Helper function to provide MockHttpClient in tests
 */
export function provideMockHttpClient() {
  const mockHttpClient = new MockHttpClient();
  return { provide: HttpClient, useValue: mockHttpClient };
}
