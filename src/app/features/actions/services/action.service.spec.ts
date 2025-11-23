import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ActionService, MoveMaterialsRequest, UpdateLotQuantityRequest } from './action.service';
import { HttpService } from '@app/core/services/http.service';
import { NotificationService } from '@app/core/services/notification.service';
import { MockHttpClient } from '@testing/mock-http-client';
import { MockNotificationService } from '@testing/mock-notification-service';

describe('ActionService', () => {
  let service: ActionService;
  let mockHttpClient: MockHttpClient;
  let mockNotificationService: MockNotificationService;

  beforeEach(() => {
    TestBed.resetTestingModule();
    mockHttpClient = new MockHttpClient();
    mockNotificationService = new MockNotificationService();
    
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        ActionService,
        HttpService,
        { provide: HttpClient, useValue: mockHttpClient },
        { provide: NotificationService, useValue: mockNotificationService }
      ]
    });
    
    service = TestBed.inject(ActionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('moveMaterials', () => {
    it('should move materials between containers', (done) => {
      const request: MoveMaterialsRequest = {
        sourceContainerName: 'Container-A',
        destinationContainerName: 'Container-B',
        quantity: 100
      };

      const mockResponse = {
        sourceContainer: { name: 'Container-A' },
        destinationContainer: { name: 'Container-B' },
        lots: [
          { name: 'LOT-001', quantity: 100 }
        ]
      };

      mockHttpClient.setPostResponse(mockResponse);

      service.moveMaterials(request).subscribe({
        next: (response) => {
          expect(response.sourceContainer.name).toBe('Container-A');
          expect(response.destinationContainer.name).toBe('Container-B');
          expect(response.lots.length).toBe(1);
          expect(response.lots[0].quantity).toBe(100);
          expect(mockHttpClient.post).toHaveBeenCalledWith(
            '/api/actions/MoveMaterials',
            request
          );
          done();
        },
        error: done.fail
      });
    });

    it('should include timestamp fields if provided', (done) => {
      const request: MoveMaterialsRequest = {
        sourceContainerName: 'Container-A',
        destinationContainerName: 'Container-B',
        quantity: 50,
        startedAt: '2024-01-01T10:00:00Z',
        finishedAt: '2024-01-01T11:00:00Z'
      };

      const mockResponse = {
        sourceContainer: { name: 'Container-A' },
        destinationContainer: { name: 'Container-B' },
        lots: []
      };

      mockHttpClient.setPostResponse(mockResponse);

      service.moveMaterials(request).subscribe({
        next: () => {
          expect(mockHttpClient.post).toHaveBeenCalledWith(
            '/api/actions/MoveMaterials',
            jasmine.objectContaining({
              startedAt: '2024-01-01T10:00:00Z',
              finishedAt: '2024-01-01T11:00:00Z'
            })
          );
          done();
        },
        error: done.fail
      });
    });

    it('should handle insufficient quantity error', (done) => {
      const request: MoveMaterialsRequest = {
        sourceContainerName: 'Container-A',
        destinationContainerName: 'Container-B',
        quantity: 1000
      };

      mockHttpClient.setError('post', { 
        status: 400, 
        message: 'Insufficient quantity in source container' 
      });

      service.moveMaterials(request).subscribe({
        next: () => done.fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(400);
          expect(mockNotificationService.showError).toHaveBeenCalled();
          done();
        }
      });
    });

    it('should handle source container not found error', (done) => {
      const request: MoveMaterialsRequest = {
        sourceContainerName: 'NonExistent',
        destinationContainerName: 'Container-B',
        quantity: 50
      };

      mockHttpClient.setError('post', { 
        status: 404, 
        message: 'Source container not found' 
      });

      service.moveMaterials(request).subscribe({
        next: () => done.fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
          done();
        }
      });
    });
  });

  describe('updateLotQuantity', () => {
    it('should update lot quantity successfully', (done) => {
      const request: UpdateLotQuantityRequest = {
        lotName: 'LOT-001',
        containerName: 'Container-A',
        quantity: 250
      };

      const mockResponse = { message: 'Quantity updated successfully!' };
      mockHttpClient.setPostResponse(mockResponse);

      service.updateLotQuantity(request).subscribe({
        next: (response) => {
          expect(response.message).toBe('Quantity updated successfully!');
          expect(mockHttpClient.post).toHaveBeenCalledWith(
            '/api/actions/UpdateLotQuantity',
            request
          );
          // Should trigger success notification
          expect(mockNotificationService.showSuccess).toHaveBeenCalledWith(
            'Quantity updated successfully!'
          );
          done();
        },
        error: done.fail
      });
    });

    it('should handle negative quantity error', (done) => {
      const request: UpdateLotQuantityRequest = {
        lotName: 'LOT-001',
        containerName: 'Container-A',
        quantity: -10
      };

      mockHttpClient.setError('post', { 
        status: 400, 
        message: 'Quantity must be positive' 
      });

      service.updateLotQuantity(request).subscribe({
        next: () => done.fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(400);
          done();
        }
      });
    });

    it('should handle lot not found error', (done) => {
      const request: UpdateLotQuantityRequest = {
        lotName: 'NonExistent',
        containerName: 'Container-A',
        quantity: 100
      };

      mockHttpClient.setError('post', { 
        status: 404, 
        message: 'Lot not found' 
      });

      service.updateLotQuantity(request).subscribe({
        next: () => done.fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
          done();
        }
      });
    });

    it('should handle container not found error', (done) => {
      const request: UpdateLotQuantityRequest = {
        lotName: 'LOT-001',
        containerName: 'NonExistent',
        quantity: 100
      };

      mockHttpClient.setError('post', { 
        status: 404, 
        message: 'Container not found' 
      });

      service.updateLotQuantity(request).subscribe({
        next: () => done.fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
          done();
        }
      });
    });
  });
});
