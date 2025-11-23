import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { StorageService } from './storage.service';

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    service = new StorageService();
    // Optionally clear localStorage before each test
    localStorage.clear();
  });

  it('should retrieve item', () => {
    localStorage.setItem('test-key', 'test-value');
    expect(service.getItem('test-key')).toBe('test-value');
  });

  it('should return null for non-existent key', () => {
    expect(service.getItem('non-existent-key')).toBeNull();
  });

  it('should store item', () => {
    service.setItem('test-key', 'test-value');
    expect(localStorage.getItem('test-key')).toBe('test-value');
  });

  it('should remove item', () => {
    localStorage.setItem('test-key', 'test-value');
    service.removeItem('test-key');
    expect(localStorage.getItem('test-key')).toBeNull();
  });

  it('should clear all items', () => {
    localStorage.setItem('test-key', 'test-value');
    service.clear();
    expect(localStorage.length).toBe(0);
  });
});


