import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContainerFormComponent } from './container-form.component';

describe('ContainerForm', () => {
  let component: ContainerForm;
  let fixture: ComponentFixture<ContainerForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContainerForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContainerForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
