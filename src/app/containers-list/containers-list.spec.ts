import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContainersList } from './containers-list';

describe('ContainersList', () => {
  let component: ContainersList;
  let fixture: ComponentFixture<ContainersList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContainersList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContainersList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
