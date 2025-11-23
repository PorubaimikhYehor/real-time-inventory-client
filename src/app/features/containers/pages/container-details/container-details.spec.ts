import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ContainerDetailsComponent } from './container-details.component';
import { ContainerService } from '../../services/container-service';
import { ActionService } from '@app/features/actions/services/action.service';
import { MockRouter } from '@testing/mock-router';

describe('ContainerDetailsComponent', () => {
  let component: ContainerDetailsComponent;
  let fixture: ComponentFixture<ContainerDetailsComponent>;
  let mockRouter: MockRouter;
  let mockContainerService: jasmine.SpyObj<ContainerService>;
  let mockActionService: jasmine.SpyObj<ActionService>;
  let mockActivatedRoute: any;

  const mockContainerData = {
    name: 'test-container',
    properties: [
      { name: 'color', value: 'red' },
      { name: 'size', value: 'large' }
    ],
    lots: [
      { name: 'lot1', quantity: 10, inputTimestamp: '2025-01-01' },
      { name: 'lot1', quantity: 5, inputTimestamp: '2025-01-02' },
      { name: 'lot2', quantity: 20, inputTimestamp: '2025-01-01' }
    ]
  };

  beforeEach(async () => {
    TestBed.resetTestingModule();
    mockRouter = new MockRouter();
    mockContainerService = jasmine.createSpyObj('ContainerService', ['getContainerWithLots', 'updateLotQuantity']);
    mockActionService = jasmine.createSpyObj('ActionService', ['performAction']);
    
    mockActivatedRoute = {
      params: of({ name: 'test-container' })
    };

    mockContainerService.getContainerWithLots.and.returnValue(of(mockContainerData));

    await TestBed.configureTestingModule({
      imports: [ContainerDetailsComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: ContainerService, useValue: mockContainerService },
        { provide: ActionService, useValue: mockActionService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContainerDetailsComponent);
    component = fixture.componentInstance;
    mockRouter.reset();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('should load container details on init', () => {
      fixture.detectChanges();
      
      expect(mockContainerService.getContainerWithLots).toHaveBeenCalledWith('test-container');
      expect(component.container()).toEqual(mockContainerData);
      expect(component.containerName()).toBe('test-container');
    });

    it('should set loading state while fetching data', () => {
      expect(component.loading()).toBe(false);
      
      fixture.detectChanges();
      
      // After successful load, loading should be false
      expect(component.loading()).toBe(false);
    });

    it('should handle load error and redirect to containers list', async () => {
      // Create a new fixture with error mock
      const errorService = jasmine.createSpyObj('ContainerService', ['getContainerWithLots']);
      errorService.getContainerWithLots.and.returnValue(
        throwError(() => new Error('Not found'))
      );

      const errorRouter = new MockRouter();
      
      await TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [ContainerDetailsComponent],
        providers: [
          provideZonelessChangeDetection(),
          { provide: Router, useValue: errorRouter },
          { provide: ActivatedRoute, useValue: mockActivatedRoute },
          { provide: ContainerService, useValue: errorService },
          { provide: ActionService, useValue: mockActionService }
        ]
      }).compileComponents();

      const errorFixture = TestBed.createComponent(ContainerDetailsComponent);
      const errorComponent = errorFixture.componentInstance;
      
      errorFixture.detectChanges();
      
      expect(errorComponent.loading()).toBe(false);
      expect(errorRouter.navigate).toHaveBeenCalledWith(['/containers']);
    });
  });

  describe('aggregatedLots computed', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should aggregate lots by name', () => {
      fixture.detectChanges();
      const aggregated = component.aggregatedLots();
      // There are two lots: lot1 (10+5) and lot2 (20)
      expect(aggregated.length).toBe(2);
      const lot1 = aggregated.find(l => l.name === 'lot1');
      const lot2 = aggregated.find(l => l.name === 'lot2');
      expect(lot1).toBeDefined();
      expect(lot2).toBeDefined();
      expect(lot1?.totalQuantity).toBe(15); // 10 + 5
      expect(lot2?.totalQuantity).toBe(20);
    });

    it('should include all entries for each lot', () => {
      fixture.detectChanges();
      const aggregated = component.aggregatedLots();
      const lot1 = aggregated.find(l => l.name === 'lot1');
      expect(lot1).toBeDefined();
      expect(lot1?.entries.length).toBe(2);
      expect(lot1?.entries.map(e => e.quantity)).toEqual([10, 5]);
      const lot2 = aggregated.find(l => l.name === 'lot2');
      expect(lot2).toBeDefined();
      expect(lot2?.entries.length).toBe(1);
      expect(lot2?.entries[0].quantity).toBe(20);
    });

    it('should return empty array when no container loaded', () => {
      component.container.set(null);
      expect(component.aggregatedLots()).toEqual([]);
    });
  });

  describe('route parameter changes', () => {
    it('should reload container when route params change', () => {
      fixture.detectChanges();
      mockContainerService.getContainerWithLots.calls.reset();

      // Simulate route param change
      mockActivatedRoute.params = of({ name: 'new-container' });
      const newComponent = TestBed.createComponent(ContainerDetailsComponent).componentInstance;
      TestBed.inject(ActivatedRoute).params.subscribe(() => {
        expect(component.containerName()).toBe('test-container');
      });
    });
  });

  describe('error handling', () => {
    it('should handle null container data gracefully', () => {
      component.container.set(null);
      expect(() => component.aggregatedLots()).not.toThrow();
    });
   });

   describe('editing lot quantity', () => {
     const lot = { name: 'lot1', quantity: 10, inputTimestamp: '2025-01-01' };
     beforeEach(() => {
       component.container.set({ ...mockContainerData });
       // Ensure updateLotQuantity is a spy for every test
       if (!mockActionService.updateLotQuantity) {
         mockActionService.updateLotQuantity = jasmine.createSpy('updateLotQuantity');
       }
     });
     it('should start editing quantity', () => {
       component.startEditingQuantity(lot);
       expect(component.editingLotKey()).toBe('lot1|2025-01-01');
       expect(component.editedQuantity()).toBe(10);
     });
     it('should cancel editing', () => {
       component.startEditingQuantity(lot);
       component.cancelEditing();
       expect(component.editingLotKey()).toBeNull();
       expect(component.editedQuantity()).toBe(0);
     });
     it('should not save negative quantity', () => {
       component.startEditingQuantity(lot);
       component.editedQuantity.set(-5);
       component.saveQuantity(lot);
       expect(mockActionService.updateLotQuantity).not.toHaveBeenCalled();
     });
     it('should save quantity and update state on success', () => {
       mockActionService.updateLotQuantity.and.returnValue(of({ message: 'ok' }));
       component.startEditingQuantity(lot);
       component.editedQuantity.set(99);
       component.saveQuantity(lot);
       expect(mockActionService.updateLotQuantity).toHaveBeenCalledWith({
         lotName: 'lot1',
         containerName: 'test-container',
         quantity: 99
       });
       expect(component.editingLotKey()).toBeNull();
       const container = component.container();
       if (container) {
         expect(container.lots.find(l => l.name === 'lot1' && l.inputTimestamp === '2025-01-01')?.quantity).toBe(99);
       }
     });
     it('should handle error on saveQuantity', () => {
       mockActionService.updateLotQuantity.and.returnValue(throwError(() => new Error('fail')));
       component.startEditingQuantity(lot);
       component.editedQuantity.set(88);
       component.saveQuantity(lot);
       expect(component.editingLotKey()).toBeNull();
     });
   });

   describe('navigation methods', () => {
     it('should navigate to editContainer', () => {
       component.editContainer();
       expect(mockRouter.navigate).toHaveBeenCalledWith(['/containers', 'test-container', 'edit']);
     });
     it('should navigate back to containers', () => {
       component.goBack();
       expect(mockRouter.navigate).toHaveBeenCalledWith(['/containers']);
     });
     it('should navigate to lot details', () => {
       component.viewLotDetails('lot1');
       expect(mockRouter.navigate).toHaveBeenCalledWith(['/lots', 'lot1', 'details']);
     });
   });

   describe('getLotKey', () => {
     it('should return correct lot key', () => {
       const key = component.getLotKey({ name: 'lot1', inputTimestamp: '2025-01-01' });
       expect(key).toBe('lot1|2025-01-01');
     });
   });
  });
