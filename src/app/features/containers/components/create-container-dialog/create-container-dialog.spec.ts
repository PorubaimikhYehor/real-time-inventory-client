import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideMockMatDialogRef, provideMockMatDialogData } from '@testing/mock-mat-dialog';

import { CreateContainerDialogComponent } from './create-container-dialog.component';

describe('CreateContainerDialogComponent', () => {
  let component: CreateContainerDialogComponent;
  let fixture: ComponentFixture<CreateContainerDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateContainerDialogComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideMockMatDialogRef(),
        provideMockMatDialogData({})
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateContainerDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
