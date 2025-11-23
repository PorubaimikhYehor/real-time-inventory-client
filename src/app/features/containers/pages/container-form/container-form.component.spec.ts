import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { ContainerFormComponent } from './container-form.component';
import { ContainerService } from '../../services/container-service';
import { PropertyDefinitionService } from '@app/features/property-definitions/services/property-definition.service';
import { ActivatedRoute } from '@angular/router';

const mockContainerService = {
  getContainer: jasmine.createSpy('getContainer').and.returnValue(of({ name: 'Test', properties: [{ name: 'prop1', value: 'val1' }] })),
  createContainer: jasmine.createSpy('createContainer').and.returnValue(of({ name: 'Test', properties: [] })),
  updateContainer: jasmine.createSpy('updateContainer').and.returnValue(of({ name: 'Test', properties: [] }))
};

const mockPropertyDefinitionService = {
  getAll: jasmine.createSpy('getAll').and.returnValue(of([{ name: 'prop1' }, { name: 'prop2' }]))
};

describe('ContainerFormComponent', () => {
  let component: ContainerFormComponent;
  let fixture: ComponentFixture<ContainerFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, RouterTestingModule, ContainerFormComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ContainerService, useValue: mockContainerService },
        { provide: PropertyDefinitionService, useValue: mockPropertyDefinitionService },
        { provide: ActivatedRoute, useValue: { snapshot: { data: { mode: 'create' }, paramMap: { get: () => null } } } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ContainerFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form in create mode', () => {
    expect(component.isCreating()).toBeTrue();
    expect(component.isEditing()).toBeTrue();
    expect(component.form.get('name')?.value).toBe('');
    expect(component.properties.length).toBe(0);
  });

  it('should add and remove property', () => {
    component.addProperty();
    expect(component.properties.length).toBe(1);
    component.removeProperty(0);
    expect(component.properties.length).toBe(0);
  });

  it('should call createContainer on save in create mode', () => {
    component.form.get('name')?.setValue('NewContainer');
    component.addProperty();
    component.properties.at(0).get('name')?.setValue('prop1');
    component.properties.at(0).get('value')?.setValue('val1');
    component.save();
    expect(mockContainerService.createContainer).toHaveBeenCalled();
  });

  it('should handle error on createContainer', async () => {
    mockContainerService.createContainer.and.returnValue(throwError(() => new Error('fail')));
    component.form.get('name')?.setValue('NewContainer');
    component.save();
    await Promise.resolve();
    expect(component.isCreating()).toBeTrue();
  });

  it('should call updateContainer on save in edit mode', () => {
    component.isCreating.set(false);
    component.isEditing.set(true);
    component.container.set({
      id: '1',
      name: 'Test',
      properties: [],
      getPropertyValue: () => ''
    });
    component.form.get('name')?.setValue('Test');
    component.save();
    expect(mockContainerService.updateContainer).toHaveBeenCalled();
  });

  it('should handle error on updateContainer', async () => {
    mockContainerService.updateContainer.and.returnValue(throwError(() => new Error('fail')));
    component.isCreating.set(false);
    component.isEditing.set(true);
    component.container.set({
      id: '1',
      name: 'Test',
      properties: [],
      getPropertyValue: () => ''
    });
    component.form.get('name')?.setValue('Test');
    component.save();
    await Promise.resolve();
    expect(component.isEditing()).toBeTrue();
  });

  it('should load property definitions', () => {
    component.loadPropertyDefinitions();
    expect(mockPropertyDefinitionService.getAll).toHaveBeenCalled();
    expect(component.propertyDefinitionOptions().length).toBeGreaterThan(0);
  });

  it('should cancel and go back', () => {
    const navigateSpy = spyOn<any>(component['router'], 'navigate');
    component.cancel();
    expect(navigateSpy).toHaveBeenCalledWith(['/containers']);
    component.goBack();
    expect(navigateSpy).toHaveBeenCalledWith(['/containers']);
  });
});
