import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ContainersComponent } from './containers.component';
import { ContainerService } from '../services/container-service';
import { Container, GetAllContainersRequest, GetAllContainersResponse } from '@app/shared/models/container';
import { MockRouter } from '@testing/mock-router';
import { createMockContainer } from '@testing/test-data-factories';

describe('ContainersComponent', () => {
  let component: ContainersComponent;
  let fixture: ComponentFixture<ContainersComponent>;
  let mockRouter: MockRouter;
  let mockContainerService: jasmine.SpyObj<ContainerService>;

  const mockContainers: Container[] = [
    createMockContainer({ name: 'container1', properties: [{ name: 'color', value: 'red' }] }),
    createMockContainer({ name: 'container2', properties: [{ name: 'color', value: 'blue' }] })
  ];

  const mockResponse: GetAllContainersResponse = {
    items: mockContainers,
    page: 1,
    pageSize: 10,
    total: 2,
    hasNextPage: false,
    getContainers: () => mockContainers
  };

  beforeEach(async () => {
    TestBed.resetTestingModule();
    mockRouter = new MockRouter();
    mockContainerService = jasmine.createSpyObj('ContainerService', ['getContainers', 'deleteContainer']);
    mockContainerService.getContainers.and.returnValue(of(mockResponse));

    await TestBed.configureTestingModule({
      imports: [ContainersComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: Router, useValue: mockRouter },
        { provide: ContainerService, useValue: mockContainerService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContainersComponent);
    component = fixture.componentInstance;
    mockRouter.reset();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('should load containers on init', () => {
      fixture.detectChanges(); // Trigger constructor
      expect(mockContainerService.getContainers).toHaveBeenCalledWith(undefined);
      expect(component.containers()).toEqual(mockContainers);
    });

    it('should set pagination on init', () => {
      fixture.detectChanges();
      const pagination = component.pagination();
      expect(pagination.page).toBe(1);
      expect(pagination.pageSize).toBe(10);
      expect(pagination.total).toBe(2);
      expect(pagination.hasNextPage).toBe(false);
    });

    it('should handle error when loading containers fails', () => {
      const consoleErrorSpy = spyOn(console, 'error');
      mockContainerService.getContainers.and.returnValue(throwError(() => new Error('Load failed')));
      
      fixture.detectChanges();
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error loading containers:', jasmine.any(Error));
    });
  });

  describe('pagination', () => {
    beforeEach(() => {
      fixture.detectChanges(); // Load initial data
      mockContainerService.getContainers.calls.reset();
    });

    it('should load containers with pagination parameters', () => {
      const pageEvent = { pageIndex: 1, pageSize: 20 };
      component.onPageEvent(pageEvent);

      expect(mockContainerService.getContainers).toHaveBeenCalledWith(
        jasmine.objectContaining({
          page: 2, // pageIndex + 1
          pageSize: 20
        })
      );
    });

    it('should update containers after page change', () => {
      const newContainers: Container[] = [
        createMockContainer({ name: 'container3' })
      ];
      const newResponse: GetAllContainersResponse = {
        items: newContainers,
        page: 2,
        pageSize: 10,
        total: 3,
        hasNextPage: false,
        getContainers: () => newContainers
      };
      mockContainerService.getContainers.and.returnValue(of(newResponse));

      component.onPageEvent({ pageIndex: 1, pageSize: 10 });

      expect(component.containers()).toEqual(newContainers);
      expect(component.pagination().page).toBe(2);
    });
  });

  describe('container operations', () => {
    beforeEach(() => {
      fixture.detectChanges();
      mockRouter.reset();
      mockContainerService.getContainers.calls.reset();
    });

    it('should navigate to edit page when editing container', () => {
      const container = createMockContainer({ name: 'test-container' });
      component.onEditContainer(container);

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/containers', 'test-container', 'edit']);
    });

    it('should delete container after confirmation', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      mockContainerService.deleteContainer.and.returnValue(of(undefined));

      const container = createMockContainer({ name: 'test-container' });
      component.onRemoveContainer(container);

      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete test-container?');
      expect(mockContainerService.deleteContainer).toHaveBeenCalledWith('test-container');
    });

    it('should reload containers after successful deletion', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      mockContainerService.deleteContainer.and.returnValue(of(undefined));

      const container = createMockContainer({ name: 'test-container' });
      component.onRemoveContainer(container);

      expect(mockContainerService.getContainers).toHaveBeenCalled();
    });

    it('should not delete container if confirmation is cancelled', () => {
      spyOn(window, 'confirm').and.returnValue(false);

      const container = createMockContainer({ name: 'test-container' });
      component.onRemoveContainer(container);

      expect(mockContainerService.deleteContainer).not.toHaveBeenCalled();
    });

    it('should handle delete error', () => {
      const consoleErrorSpy = spyOn(console, 'error');
      spyOn(window, 'confirm').and.returnValue(true);
      mockContainerService.deleteContainer.and.returnValue(throwError(() => new Error('Delete failed')));

      const container = createMockContainer({ name: 'test-container' });
      component.onRemoveContainer(container);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error deleting container:', jasmine.any(Error));
    });
  });
});
