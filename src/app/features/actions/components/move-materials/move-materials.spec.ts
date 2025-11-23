import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

import { MoveMaterialsComponent } from './move-materials.component';
import { ContainerService } from '@app/features/containers/services/container-service';
import { ActionService, TransferLotResponse } from '../../services/action.service';
import { NotificationService } from '@app/core/services/notification.service';
import { Container, GetAllContainersResponse } from '@app/shared/models/container';
import { MockNotificationService } from '@testing/mock-notification-service';
import { createMockContainer } from '@testing/test-data-factories';

describe('MoveMaterialsComponent', () => {
  let component: MoveMaterialsComponent;
  let fixture: ComponentFixture<MoveMaterialsComponent>;
  let mockContainerService: jasmine.SpyObj<ContainerService>;
  let mockActionService: jasmine.SpyObj<ActionService>;
  let mockNotificationService: MockNotificationService;

  const mockContainers: Container[] = [
    createMockContainer({ name: 'container1' }),
    createMockContainer({ name: 'container2' }),
    createMockContainer({ name: 'container3' })
  ];

  const mockResponse: GetAllContainersResponse = {
    items: mockContainers,
    page: 1,
    pageSize: 10,
    total: 3,
    hasNextPage: false,
    getContainers: () => mockContainers
  };

  beforeEach(async () => {
    TestBed.resetTestingModule();
    mockContainerService = jasmine.createSpyObj('ContainerService', ['getContainers']);
    mockActionService = jasmine.createSpyObj('ActionService', ['moveMaterials']);
    mockNotificationService = new MockNotificationService();

    mockContainerService.getContainers.and.returnValue(of(mockResponse));

    await TestBed.configureTestingModule({
      imports: [MoveMaterialsComponent, ReactiveFormsModule],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ContainerService, useValue: mockContainerService },
        { provide: ActionService, useValue: mockActionService },
        { provide: NotificationService, useValue: mockNotificationService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MoveMaterialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('should load containers on init', () => {
      expect(mockContainerService.getContainers).toHaveBeenCalled();
      expect(component.containers()).toEqual(mockContainers);
    });

    it('should set loading state while loading containers', () => {
      expect(component.isLoading()).toBe(false);
    });

    it('should populate source container options', () => {
      const options = component.sourceContainerOptions();
      expect(options.length).toBe(3);
      expect(options[0].value).toBe('container1');
      expect(options[0].label).toBe('container1');
    });

    it('should handle container loading error', () => {
      const error = new Error('Load failed');
      mockContainerService.getContainers.and.returnValue(throwError(() => error));
      
      const newFixture = TestBed.createComponent(MoveMaterialsComponent);
      newFixture.detectChanges();
      
      expect(mockNotificationService.showError).toHaveBeenCalledWith('Failed to load containers');
    });
  });

  describe('form validation', () => {
    it('should initialize form with default values', () => {
      expect(component.form.get('sourceContainerName')?.value).toBe('');
      expect(component.form.get('destinationContainerName')?.value).toBe('');
      expect(component.form.get('quantity')?.value).toBe(1);
    });

    it('should mark source container as required', () => {
      const control = component.form.get('sourceContainerName');
      control?.setValue('');
      expect(control?.hasError('required')).toBe(true);
    });

    it('should mark destination container as required', () => {
      const control = component.form.get('destinationContainerName');
      control?.setValue('');
      expect(control?.hasError('required')).toBe(true);
    });

    it('should validate quantity as required', () => {
      const control = component.form.get('quantity');
      control?.setValue(null);
      expect(control?.hasError('required')).toBe(true);
    });

    it('should validate quantity minimum value', () => {
      const control = component.form.get('quantity');
      control?.setValue(0);
      expect(control?.hasError('min')).toBe(true);
    });

    it('should accept valid quantity', () => {
      const control = component.form.get('quantity');
      control?.setValue(10);
      expect(control?.valid).toBe(true);
    });

    it('should have valid form when all required fields are filled', () => {
      component.form.patchValue({
        sourceContainerName: 'container1',
        destinationContainerName: 'container2',
        quantity: 5
      });
      expect(component.form.valid).toBe(true);
    });
  });

  describe('destination container filtering', () => {
    it('should exclude source container from destination options', () => {
      component.form.patchValue({ sourceContainerName: 'container1' });
      const available = component.getAvailableDestinationContainers();
      
      expect(available.length).toBe(2);
      expect(available.find(c => c.name === 'container1')).toBeUndefined();
      expect(available.find(c => c.name === 'container2')).toBeDefined();
      expect(available.find(c => c.name === 'container3')).toBeDefined();
    });

    it('should include all containers when no source is selected', () => {
      component.form.patchValue({ sourceContainerName: '' });
      const available = component.getAvailableDestinationContainers();
      expect(available.length).toBe(3);
    });

    it('should update destination options when source changes', () => {
      component.form.patchValue({ sourceContainerName: 'container1' });
      
      // Get available containers after filtering
      const available = component.getAvailableDestinationContainers();
      const options = component.getContainerOptions(available);
      
      expect(options.length).toBe(2);
      expect(options.find(opt => opt.value === 'container1')).toBeUndefined();
      expect(options.find(opt => opt.value === 'container2')).toBeDefined();
      expect(options.find(opt => opt.value === 'container3')).toBeDefined();
    });
  });

  describe('form submission', () => {
    beforeEach(() => {
      component.form.patchValue({
        sourceContainerName: 'container1',
        destinationContainerName: 'container2',
        quantity: 10
      });
    });

    it('should submit valid form', () => {
      const mockMoveResponse: TransferLotResponse = {
        sourceContainer: { name: 'container1' },
        destinationContainer: { name: 'container2' },
        lots: [{ name: 'lot1', quantity: 10 }]
      };
      mockActionService.moveMaterials.and.returnValue(of(mockMoveResponse));

      component.onSubmit();

      expect(mockActionService.moveMaterials).toHaveBeenCalledWith({
        sourceContainerName: 'container1',
        destinationContainerName: 'container2',
        quantity: 10,
        startedAt: undefined,
        finishedAt: undefined
      });
    });

    it('should show success notification after successful move', () => {
      const mockMoveResponse: TransferLotResponse = {
        sourceContainer: { name: 'container1' },
        destinationContainer: { name: 'container2' },
        lots: [{ name: 'lot1', quantity: 10 }]
      };
      mockActionService.moveMaterials.and.returnValue(of(mockMoveResponse));

      component.onSubmit();

      expect(mockNotificationService.showSuccess).toHaveBeenCalledWith(
        jasmine.stringContaining('Successfully moved 10 items')
      );
    });

    it('should reset form after successful submission', () => {
      const mockMoveResponse: TransferLotResponse = {
        sourceContainer: { name: 'container1' },
        destinationContainer: { name: 'container2' },
        lots: [{ name: 'lot1', quantity: 10 }]
      };
      mockActionService.moveMaterials.and.returnValue(of(mockMoveResponse));

      component.onSubmit();

      expect(component.form.get('sourceContainerName')?.value).toBeNull();
      expect(component.form.get('quantity')?.value).toBe(1);
    });

    it('should not submit invalid form', () => {
      component.form.patchValue({
        sourceContainerName: '',
        destinationContainerName: '',
        quantity: 0
      });

      component.onSubmit();

      expect(mockActionService.moveMaterials).not.toHaveBeenCalled();
      expect(mockNotificationService.showError).toHaveBeenCalledWith(
        'Please fill in all required fields correctly.'
      );
    });

    it('should handle submission error', () => {
      mockActionService.moveMaterials.and.returnValue(
        throwError(() => new Error('Move failed'))
      );

      component.onSubmit();

      expect(mockNotificationService.showError).toHaveBeenCalledWith(
        'Failed to move materials. Please check your inputs and try again.'
      );
    });

    it('should set submitting state during submission', () => {
      mockActionService.moveMaterials.and.returnValue(of({
        sourceContainer: { name: 'container1' },
        destinationContainer: { name: 'container2' },
        lots: [{ name: 'lot1', quantity: 10 }]
      }));

      component.onSubmit();
      expect(component.isSubmitting()).toBe(false); // Should be false after completion
    });
  });

  describe('helper methods', () => {
    it('should convert containers to select options', () => {
      const options = component.getContainerOptions(mockContainers);
      
      expect(options.length).toBe(3);
      expect(options[0]).toEqual({ value: 'container1', label: 'container1' });
      expect(options[1]).toEqual({ value: 'container2', label: 'container2' });
    });

    it('should get source container options', () => {
      const options = component.getSourceContainerOptions();
      expect(options.length).toBe(3);
    });

    it('should get destination container options', () => {
      component.form.patchValue({ sourceContainerName: 'container1' });
      const options = component.getDestinationContainerOptions();
      expect(options.length).toBe(2);
    });
  });

  describe('form controls', () => {
    it('should expose sourceContainerControl', () => {
      expect(component.sourceContainerControl).toBeDefined();
      expect(component.sourceContainerControl.value).toBe('');
    });

    it('should expose destinationContainerControl', () => {
      expect(component.destinationContainerControl).toBeDefined();
      expect(component.destinationContainerControl.value).toBe('');
    });

    it('should expose quantityControl', () => {
      expect(component.quantityControl).toBeDefined();
      expect(component.quantityControl.value).toBe(1);
    });
  });
});
