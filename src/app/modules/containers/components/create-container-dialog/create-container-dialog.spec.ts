import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateContainerDialog } from './create-container-dialog';

describe('CreateContainerDialog', () => {
  let component: CreateContainerDialog;
  let fixture: ComponentFixture<CreateContainerDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateContainerDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateContainerDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
