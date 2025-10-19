import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { FormInputComponent } from './form-input.component';

describe('FormInputComponent', () => {
  let component: FormInputComponent;
  let fixture: ComponentFixture<FormInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormInputComponent, ReactiveFormsModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormInputComponent);
    component = fixture.componentInstance;
    component.control = new FormControl('');
    component.label.set('Test Label');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});