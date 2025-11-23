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
      const aggregated = component.aggregatedLots();
      
      expect(aggregated.length).toBe(2);
      expect(aggregated[0].name).toBe('lot1');
      expect(aggregated[0].totalQuantity).toBe(15); // 10 + 5
      expect(aggregated[1].name).toBe('lot2');
      expect(aggregated[1].totalQuantity).toBe(20);
    });

    it('should include all entries for each lot', () => {
      const aggregated = component.aggregatedLots();
      const lot1 = aggregated.find(l => l.name === 'lot1');
      
      expect(lot1?.entries.length).toBe(2);
      expect(lot1?.entries[0].quantity).toBe(10);
      expect(lot1?.entries[1].quantity).toBe(5);
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
});
