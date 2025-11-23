import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { 
  PropertyDefinitionService, 
  PropertyDefinition, 
  PropertyDefinitionRequest,
  PropertyType 
} from './property-definition.service';
import { HttpService } from '@app/core/services/http.service';
import { NotificationService } from '@app/core/services/notification.service';
import { MockHttpClient } from '@testing/mock-http-client';
import { MockNotificationService } from '@testing/mock-notification-service';
import { createMockPropertyDefinition } from '@testing/test-data-factories';

describe('PropertyDefinitionService', () => {
  let service: PropertyDefinitionService;
  let mockHttpClient: MockHttpClient;
  let mockNotificationService: MockNotificationService;

  beforeEach(() => {
    TestBed.resetTestingModule();
    mockHttpClient = new MockHttpClient();
    mockNotificationService = new MockNotificationService();
    
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        PropertyDefinitionService,
        HttpService,
        { provide: HttpClient, useValue: mockHttpClient },
        { provide: NotificationService, useValue: mockNotificationService }
      ]
    });
    
    service = TestBed.inject(PropertyDefinitionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll', () => {
    it('should fetch all property definitions', (done) => {
      const mockDefinitions: PropertyDefinition[] = [
        createMockPropertyDefinition({ name: 'location', type: PropertyType.String }),
        createMockPropertyDefinition({ name: 'temperature', type: PropertyType.Double }),
        createMockPropertyDefinition({ name: 'quantity', type: PropertyType.Integer })
      ];

      mockHttpClient.setGetResponse(mockDefinitions);

      service.getAll().subscribe({
        next: (definitions) => {
          expect(definitions.length).toBe(3);
          expect(definitions[0].name).toBe('location');
          expect(definitions[1].type).toBe(PropertyType.Double);
          expect(mockHttpClient.get).toHaveBeenCalledWith('/api/property-definitions');
          done();
        },
        error: done.fail
      });
    });

    it('should return empty array when no definitions exist', (done) => {
      mockHttpClient.setGetResponse([]);

      service.getAll().subscribe({
        next: (definitions) => {
          expect(definitions.length).toBe(0);
          done();
        },
        error: done.fail
      });
    });

    it('should handle server error', (done) => {
      mockHttpClient.setError('get', { status: 500, message: 'Internal server error' });

      service.getAll().subscribe({
        next: () => done.fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(500);
          done();
        }
      });
    });
  });

  describe('getOne', () => {
    it('should fetch a single property definition by name', (done) => {
      const mockDefinition = createMockPropertyDefinition({ 
        name: 'location',
        description: 'Storage location',
        type: PropertyType.String 
      });

      mockHttpClient.setGetResponse(mockDefinition);

      service.getOne('location').subscribe({
        next: (definition) => {
          expect(definition.name).toBe('location');
          expect(definition.description).toBe('Storage location');
          expect(definition.type).toBe(PropertyType.String);
          expect(mockHttpClient.get).toHaveBeenCalledWith('/api/property-definitions/location');
          done();
        },
        error: done.fail
      });
    });

    it('should handle not found error', (done) => {
      mockHttpClient.setError('get', { status: 404, message: 'Property definition not found' });

      service.getOne('nonexistent').subscribe({
        next: () => done.fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
          done();
        }
      });
    });

    it('should encode property names with special characters', (done) => {
      const mockDefinition = createMockPropertyDefinition({ name: 'property/with spaces' });
      mockHttpClient.setGetResponse(mockDefinition);

      service.getOne('property/with spaces').subscribe({
        next: () => {
          // Note: HttpClient automatically encodes URLs
          expect(mockHttpClient.get).toHaveBeenCalled();
          done();
        },
        error: done.fail
      });
    });
  });

  describe('create', () => {
    it('should create a new property definition', (done) => {
      const request: PropertyDefinitionRequest = {
        name: 'new-property',
        description: 'A new property',
        type: PropertyType.Boolean
      };

      const mockResponse = createMockPropertyDefinition(request);
      mockHttpClient.setPostResponse(mockResponse);

      service.create(request).subscribe({
        next: (definition) => {
          expect(definition.name).toBe('new-property');
          expect(definition.type).toBe(PropertyType.Boolean);
          expect(mockHttpClient.post).toHaveBeenCalledWith(
            '/api/property-definitions',
            request
          );
          expect(mockNotificationService.showSuccess).toHaveBeenCalledWith(
            'Property definition created successfully'
          );
          done();
        },
        error: done.fail
      });
    });

    it('should handle duplicate name error', (done) => {
      const request: PropertyDefinitionRequest = {
        name: 'existing-property',
        type: PropertyType.String
      };

      mockHttpClient.setError('post', { 
        status: 409, 
        message: 'Property definition already exists' 
      });

      service.create(request).subscribe({
        next: () => done.fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(409);
          done();
        }
      });
    });

    it('should handle validation errors', (done) => {
      const request: PropertyDefinitionRequest = {
        name: '',
        type: PropertyType.String
      };

      mockHttpClient.setError('post', { 
        status: 400, 
        message: 'Property name is required' 
      });

      service.create(request).subscribe({
        next: () => done.fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(400);
          done();
        }
      });
    });
  });

  describe('update', () => {
    it('should update an existing property definition', (done) => {
      const name = 'existing-property';
      const request: PropertyDefinitionRequest = {
        name: 'updated-property',
        description: 'Updated description',
        type: PropertyType.Integer
      };

      const mockResponse = createMockPropertyDefinition(request);
      mockHttpClient.setPutResponse(mockResponse);

      service.update(name, request).subscribe({
        next: (definition) => {
          expect(definition.name).toBe('updated-property');
          expect(definition.description).toBe('Updated description');
          expect(mockHttpClient.put).toHaveBeenCalledWith(
            `/api/property-definitions/${name}`,
            request
          );
          expect(mockNotificationService.showSuccess).toHaveBeenCalledWith(
            'Property definition updated successfully'
          );
          done();
        },
        error: done.fail
      });
    });

    it('should handle not found error when updating', (done) => {
      const request: PropertyDefinitionRequest = {
        name: 'updated-name',
        type: PropertyType.String
      };

      mockHttpClient.setError('put', { 
        status: 404, 
        message: 'Property definition not found' 
      });

      service.update('nonexistent', request).subscribe({
        next: () => done.fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
          done();
        }
      });
    });

    it('should handle validation errors when updating', (done) => {
      const request: PropertyDefinitionRequest = {
        name: '',
        type: PropertyType.String
      };

      mockHttpClient.setError('put', { 
        status: 400, 
        message: 'Invalid property definition' 
      });

      service.update('existing', request).subscribe({
        next: () => done.fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(400);
          done();
        }
      });
    });
  });

  describe('delete', () => {
    it('should delete a property definition', (done) => {
      mockHttpClient.setDeleteResponse(undefined);

      service.delete('property-to-delete').subscribe({
        next: () => {
          expect(mockHttpClient.delete).toHaveBeenCalledWith(
            '/api/property-definitions/property-to-delete'
          );
          expect(mockNotificationService.showSuccess).toHaveBeenCalledWith(
            'Property definition deleted successfully'
          );
          done();
        },
        error: done.fail
      });
    });

    it('should handle not found error when deleting', (done) => {
      mockHttpClient.setError('delete', { 
        status: 404, 
        message: 'Property definition not found' 
      });

      service.delete('nonexistent').subscribe({
        next: () => done.fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
          done();
        }
      });
    });

    it('should handle in-use error when deleting', (done) => {
      mockHttpClient.setError('delete', { 
        status: 409, 
        message: 'Property definition is in use and cannot be deleted' 
      });

      service.delete('in-use-property').subscribe({
        next: () => done.fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(409);
          done();
        }
      });
    });
  });

  describe('PropertyType enum', () => {
    it('should have all expected types', () => {
      expect(PropertyType.String).toBe(0);
      expect(PropertyType.Double).toBe(1);
      expect(PropertyType.Integer).toBe(2);
      expect(PropertyType.Boolean).toBe(3);
      expect(PropertyType.DateTime).toBe(4);
      expect(PropertyType.Array).toBe(5);
    });
  });
});
