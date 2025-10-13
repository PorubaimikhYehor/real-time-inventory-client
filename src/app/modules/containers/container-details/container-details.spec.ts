import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContainerDetails } from './container-details';

describe('ContainerDetails', () => {
  let component: ContainerDetails;
  let fixture: ComponentFixture<ContainerDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContainerDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContainerDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
