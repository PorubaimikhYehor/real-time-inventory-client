import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { ContainerService } from './container-service';
import { HttpService } from '@app/core/services/http.service';
import { NotificationService } from '@app/core/services/notification.service';
import { MockHttpClient, provideMockHttpClient } from '@testing/mock-http-client';
import { MockNotificationService } from '@testing/mock-notification-service';
import { 
  Container, 
  GetAllContainersRequest, 
  GetAllContainersResponse 
} from '@app/shared/models/container';
import { createMockContainer } from '@testing/test-data-factories';

describe('ContainerService', () => {
  let service: ContainerService;
  let mockHttpClient: MockHttpClient;
  let httpService: HttpService;

  beforeEach(() => {
    TestBed.resetTestingModule();
    mockHttpClient = new MockHttpClient();
    
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        ContainerService,
        HttpService,
        { provide: HttpClient, useValue: mockHttpClient },
        { provide: NotificationService, useClass: MockNotificationService }
      ]
    });
    
    service = TestBed.inject(ContainerService);
    httpService = TestBed.inject(HttpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getContainers', () => {
    it('should fetch all containers with default request', (done) => {
      const mockContainers = [
        createMockContainer({ name: 'Container1' }),
        createMockContainer({ name: 'Container2' })
      ];
      const mockResponse = {
        items: mockContainers,
        page: 1,
        pageSize: 5,
        total: 2,
        hasNextPage: false
      };

      mockHttpClient.setPostResponse(mockResponse);

      service.getContainers().subscribe({
        next: (response) => {
          expect(response).toBeInstanceOf(GetAllContainersResponse);
          expect(response.items.length).toBe(2);
          expect(response.page).toBe(1);
          expect(response.pageSize).toBe(5);
          expect(mockHttpClient.post).toHaveBeenCalledWith(
            '/api/containers/GetAll',
            jasmine.any(GetAllContainersRequest)
          );
          done();
        },
        error: done.fail
      });
    });

    it('should fetch containers with custom pagination request', (done) => {
      const request = new GetAllContainersRequest({ page: 2, pageSize: 10 });
      const mockResponse = {
        items: [createMockContainer({ name: 'Container3' })],
        page: 2,
        pageSize: 10,
        total: 15,
        hasNextPage: true
      };

      mockHttpClient.setPostResponse(mockResponse);

      service.getContainers(request).subscribe({
        next: (response) => {
          expect(response.page).toBe(2);
          expect(response.pageSize).toBe(10);
          expect(response.hasNextPage).toBe(true);
          expect(mockHttpClient.post).toHaveBeenCalledWith(
            '/api/containers/GetAll',
            request
          );
          done();
        },
        error: done.fail
      });
    });

    it('should handle errors when fetching containers', (done) => {
      mockHttpClient.setError('post', { status: 500, message: 'Server error' });

      service.getContainers().subscribe({
        next: () => done.fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(500);
          done();
        }
      });
    });
  });

  describe('createMockContainer', () => {
    it('should create a new container', (done) => {
      const newContainer = {
        name: 'NewContainer',
        properties: [{ name: 'location', value: 'Warehouse A' }]
      };
      const mockResponse = createMockContainer(newContainer);

      mockHttpClient.setPostResponse(mockResponse);

      service.createContainer(newContainer).subscribe({
        next: (container: Container) => {
          expect(container.name).toBe('NewContainer');
          expect(container.properties.length).toBe(1);
          expect(mockHttpClient.post).toHaveBeenCalledWith(
            '/api/containers/',
            newContainer
          );
          done();
        },
        error: done.fail
      });
    });

    it('should handle duplicate container name error', (done) => {
      const newContainer = {
        name: 'DuplicateContainer',
        properties: []
      };
      mockHttpClient.setError('post', { status: 400, message: 'Container already exists' });

      service.createContainer(newContainer).subscribe({
        next: () => done.fail('Should have failed'),
        error: (error: any) => {
          expect(error.status).toBe(400);
          done();
        }
      });
    });
  });

  describe('deleteContainer', () => {
    it('should delete a container by name', (done) => {
      const containerName = 'ContainerToDelete';
      mockHttpClient.setDeleteResponse(undefined);

      service.deleteContainer(containerName).subscribe({
        next: () => {
          expect(mockHttpClient.delete).toHaveBeenCalledWith(
            `/api/containers/${encodeURIComponent(containerName)}`
          );
          done();
        },
        error: done.fail
      });
    });

    it('should encode container name with special characters', (done) => {
      const containerName = 'Container/With Spaces';
      mockHttpClient.setDeleteResponse(undefined);

      service.deleteContainer(containerName).subscribe({
        next: () => {
          expect(mockHttpClient.delete).toHaveBeenCalledWith(
            `/api/containers/${encodeURIComponent(containerName)}`
          );
          done();
        },
        error: done.fail
      });
    });

    it('should handle not found error when deleting', (done) => {
      mockHttpClient.setError('delete', { status: 404, message: 'Container not found' });

      service.deleteContainer('NonExistent').subscribe({
        next: () => done.fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
          done();
        }
      });
    });
  });

  describe('getContainer', () => {
    it('should fetch a single container by name', (done) => {
      const containerName = 'TestContainer';
      const mockContainer = createMockContainer({ name: containerName });

      mockHttpClient.setGetResponse(mockContainer);

      service.getContainer(containerName).subscribe({
        next: (container) => {
          expect(container.name).toBe(containerName);
          expect(mockHttpClient.get).toHaveBeenCalledWith(
            `/api/containers/${encodeURIComponent(containerName)}`
          );
          done();
        },
        error: done.fail
      });
    });

    it('should handle not found error', (done) => {
      mockHttpClient.setError('get', { status: 404, message: 'Container not found' });

      service.getContainer('NonExistent').subscribe({
        next: () => done.fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
          done();
        }
      });
    });
  });

  describe('getContainerWithLots', () => {
    it('should fetch container with its lots', (done) => {
      const containerName = 'ContainerWithLots';
      const mockResponse = {
        container: createMockContainer({ name: containerName }),
        lots: [
          { name: 'Lot1', quantity: 100, properties: [] },
          { name: 'Lot2', quantity: 200, properties: [] }
        ]
      };

      mockHttpClient.setGetResponse(mockResponse);

      service.getContainerWithLots(containerName).subscribe({
        next: (data) => {
          expect(data.container.name).toBe(containerName);
          expect(data.lots.length).toBe(2);
          expect(mockHttpClient.get).toHaveBeenCalledWith(
            `/api/containers/${encodeURIComponent(containerName)}/lots`
          );
          done();
        },
        error: done.fail
      });
    });
  });

  describe('updateContainer', () => {
    it('should update an existing container', (done) => {
      const containerName = 'ExistingContainer';
      const updateData = {
        name: 'UpdatedContainer',
        properties: [{ name: 'status', value: 'active' }]
      };
      const mockResponse = createMockContainer(updateData);

      mockHttpClient.setPutResponse(mockResponse);

      service.updateContainer(containerName, updateData).subscribe({
        next: (container) => {
          expect(container.name).toBe('UpdatedContainer');
          expect(container.properties.length).toBe(1);
          expect(mockHttpClient.put).toHaveBeenCalledWith(
            `/api/containers/${encodeURIComponent(containerName)}`,
            updateData
          );
          done();
        },
        error: done.fail
      });
    });

    it('should handle validation errors when updating', (done) => {
      const updateData = { name: '', properties: [] };
      mockHttpClient.setError('put', { status: 400, message: 'Invalid container data' });

      service.updateContainer('Test', updateData).subscribe({
        next: () => done.fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(400);
          done();
        }
      });
    });
  });
});
