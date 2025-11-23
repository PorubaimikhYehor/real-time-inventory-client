import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { provideZonelessChangeDetection } from '@angular/core';

import { FormInputComponent } from './form-input.component';

describe('FormInputComponent', () => {
  let component: FormInputComponent;
  let fixture: ComponentFixture<FormInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormInputComponent, ReactiveFormsModule],
      providers: [provideZonelessChangeDetection()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormInputComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('control', new FormControl(''));
    fixture.componentRef.setInput('label', 'Test Label');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render label and input', () => {
    const label = fixture.nativeElement.querySelector('label');
    const input = fixture.nativeElement.querySelector('input');
    expect(label.textContent).toContain('Test Label');
    expect(input).toBeTruthy();
  });

  it('should bind value from control', () => {
    component.control().setValue('abc');
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input');
    expect(input.value).toBe('abc');
  });

  it('should propagate value changes', () => {
    const input = fixture.nativeElement.querySelector('input');
    input.value = 'xyz';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(component.control().value).toBe('xyz');
  });

  it('should show error message if error input is set', async () => {
    const control = component.control();
    control.setErrors({ required: true });
    control.markAsDirty();
    control.markAsTouched();
    control.updateValueAndValidity();
    fixture.detectChanges();
    // Trigger a value change event to force update
    const input = fixture.nativeElement.querySelector('input');
    input.value = '';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
    // Wait for signals/computed to update
    await new Promise(resolve => setTimeout(resolve, 0));
    fixture.detectChanges();
    // Validate error logic directly
    expect(component.hasError()).toBeTrue();
    expect(component.errorMessage()).toContain('is required');
    // Check DOM for error message
    const error = fixture.nativeElement.querySelector('mat-error');
    expect(error).not.toBeNull();
    expect(error?.textContent).toContain('is required');
  });

  it('should set input type and placeholder', () => {
    fixture.componentRef.setInput('type', 'number');
    fixture.componentRef.setInput('placeholder', 'Enter value');
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input');
    expect(input.type).toBe('number');
    expect(input.placeholder).toBe('Enter value');
  });

  it('should disable input when control is disabled', () => {
    component.control().disable();
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input');
    expect(input.disabled).toBeTrue();
  });
});