import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MockHttpClient } from '@testing/mock-http-client';
import { MockNotificationService } from '@testing/mock-notification-service';
import { NotificationService } from '@app/core/services/notification.service';

import { ContainerFormComponent } from './container-form.component';

describe('ContainerFormComponent', () => {
  let component: ContainerFormComponent;
  let fixture: ComponentFixture<ContainerFormComponent>;
  let mockHttpClient: MockHttpClient;

  beforeEach(async () => {
    mockHttpClient = new MockHttpClient();
    
    // Set up mock response BEFORE configuring TestBed
    mockHttpClient.setGetResponse([]);
    
    await TestBed.configureTestingModule({
      imports: [ContainerFormComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: HttpClient, useValue: mockHttpClient },
        { provide: NotificationService, useClass: MockNotificationService },
        provideRouter([]),
        provideNoopAnimations()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContainerFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
