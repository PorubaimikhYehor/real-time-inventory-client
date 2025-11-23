/// <reference types="jasmine" />
import { Router, ActivatedRoute } from '@angular/router';
import { of, Subject } from 'rxjs';

/**
 * Mock Router for testing
 */
export class MockRouter {
  navigate = jasmine.createSpy('navigate').and.returnValue(Promise.resolve(true));
  navigateByUrl = jasmine.createSpy('navigateByUrl').and.returnValue(Promise.resolve(true));
  url = '/';
  events = new Subject();

  reset() {
    this.navigate.calls.reset();
    this.navigateByUrl.calls.reset();
  }
}

/**
 * Mock ActivatedRoute for testing
 */
export class MockActivatedRoute {
  params = of({});
  queryParams = of({});
  snapshot = {
    params: {},
    queryParams: {},
    data: {},
    paramMap: {
      get: (key: string) => null,
      has: (key: string) => false
    },
    queryParamMap: {
      get: (key: string) => null,
      has: (key: string) => false
    }
  };

  /**
   * Set route params
   */
  setParams(params: any) {
    this.params = of(params);
    this.snapshot.params = params;
  }

  /**
   * Set query params
   */
  setQueryParams(params: any) {
    this.queryParams = of(params);
    this.snapshot.queryParams = params;
  }
}

/**
 * Helper function to provide MockRouter in tests
 */
export function provideMockRouter() {
  const mockRouter = new MockRouter();
  return { provide: Router, useValue: mockRouter };
}

/**
 * Helper function to provide MockActivatedRoute in tests
 */
export function provideMockActivatedRoute() {
  const mockRoute = new MockActivatedRoute();
  return { provide: ActivatedRoute, useValue: mockRoute };
}
