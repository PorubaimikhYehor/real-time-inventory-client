import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideMockMatDialogRef, provideMockMatDialogData } from '@testing/mock-mat-dialog';
import { MockHttpClient } from '@testing/mock-http-client';
import { MockNotificationService } from '@testing/mock-notification-service';
import { NotificationService } from '@app/core/services/notification.service';

import { CreateContainerDialogComponent } from './create-container-dialog.component';

describe('CreateContainerDialogComponent', () => {
  let component: CreateContainerDialogComponent;
  let fixture: ComponentFixture<CreateContainerDialogComponent>;
  let mockHttpClient: MockHttpClient;

  beforeEach(async () => {
    mockHttpClient = new MockHttpClient();
    
    // Set up mock response BEFORE configuring TestBed
    mockHttpClient.setGetResponse([]);
    
    await TestBed.configureTestingModule({
      imports: [CreateContainerDialogComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: HttpClient, useValue: mockHttpClient },
        { provide: NotificationService, useClass: MockNotificationService },
        provideNoopAnimations(),
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
