import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { Router } from '@angular/router';
import { signal } from '@angular/core';

import { ContainerListComponent } from './container-list.component';
import { Container, Pagination } from '@app/shared/models/container';
import { MockRouter } from '@testing/mock-router';
import { createMockContainer } from '@testing/test-data-factories';

describe('ContainerListComponent', () => {
  let component: ContainerListComponent;
  let fixture: ComponentFixture<ContainerListComponent>;
  let mockRouter: MockRouter;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    mockRouter = new MockRouter();

    await TestBed.configureTestingModule({
      imports: [ContainerListComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: Router, useValue: mockRouter }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContainerListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    mockRouter.reset();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('should initialize with empty containers', () => {
      expect(component.containers()).toEqual([]);
    });

    it('should initialize with default pagination', () => {
      const pagination = component.pagination();
      expect(pagination.page).toBe(1);
      expect(pagination.pageSize).toBe(5);
      expect(pagination.total).toBe(0);
      expect(pagination.hasNextPage).toBe(false);
    });

    it('should initialize view mode as table', () => {
      expect(component.viewMode()).toBe('table');
    });
  });

  describe('view mode', () => {
    it('should update view mode to table', () => {
      component.onViewChange('table');
      expect(component.viewMode()).toBe('table');
    });

    it('should update view mode to cards', () => {
      component.onViewChange('cards');
      expect(component.viewMode()).toBe('cards');
    });
  });

  describe('navigation', () => {
    it('should navigate to create container page', () => {
      component.createContainer();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/containers/create']);
    });

    it('should navigate to container details page', () => {
      const container = createMockContainer({
        name: 'test-container'
      });
      component.viewDetails(container);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/containers', 'test-container', 'details']);
    });
  });

  describe('event emissions', () => {
    it('should emit pageEvent when handlePageEvent is called', (done) => {
      const pageEvent = { pageIndex: 1, pageSize: 20 };
      
      component.pageEvent.subscribe((event: any) => {
        expect(event).toEqual(pageEvent);
        done();
      });

      component.handlePageEvent(pageEvent);
    });

    it('should emit editContainer when output is triggered', (done) => {
      const container = createMockContainer({
        name: 'test-container'
      });

      component.editContainer.subscribe((emittedContainer: Container) => {
        expect(emittedContainer).toEqual(container);
        done();
      });

      component.editContainer.emit(container);
    });

    it('should emit removeContainer when output is triggered', (done) => {
      const container = createMockContainer({
        name: 'test-container'
      });

      component.removeContainer.subscribe((emittedContainer: Container) => {
        expect(emittedContainer).toEqual(container);
        done();
      });

      component.removeContainer.emit(container);
    });
  });

  describe('input handling', () => {
    it('should accept containers input', () => {
      const containers: Container[] = [
        createMockContainer({ name: 'container1' }),
        createMockContainer({ name: 'container2' })
      ];
      
      fixture.componentRef.setInput('containers', containers);
      expect(component.containers()).toEqual(containers);
    });

    it('should accept pagination input', () => {
      const pagination: Pagination = {
        page: 2,
        pageSize: 25,
        total: 100,
        hasNextPage: true
      };
      
      fixture.componentRef.setInput('pagination', pagination);
      expect(component.pagination()).toEqual(pagination);
    });
  });
});
