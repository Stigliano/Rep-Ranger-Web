import { describe, it, expect } from 'vitest';
import { apiClient } from './client';

describe('API Client', () => {
  it('should be defined', () => {
    expect(apiClient).toBeDefined();
  });

  it('should have the correct base URL', () => {
    // Accessing private/internal property defaults or checking via interceptor context if possible
    // But axios instance doesn't expose baseURL easily after creation without accessing defaults
    expect(apiClient.defaults.baseURL).toContain('api');
  });

  it('should have request interceptor', () => {
    expect(apiClient.interceptors.request).toBeDefined();
    // handlers is an internal array, length should be > 0
    // @ts-expect-error handlers is private
    expect(apiClient.interceptors.request.handlers.length).toBeGreaterThan(0);
  });

  it('should have response interceptor', () => {
    expect(apiClient.interceptors.response).toBeDefined();
    // @ts-expect-error handlers is private
    expect(apiClient.interceptors.response.handlers.length).toBeGreaterThan(0);
  });
});

