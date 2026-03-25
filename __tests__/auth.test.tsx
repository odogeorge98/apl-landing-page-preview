import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import useAuthStore from '@/lib/store/auth';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Auth Store', () => {
  beforeEach(() => {
    // Reset the store before each test
    useAuthStore.getState().logout();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
  });

  it('should initialize with empty state', () => {
    const state = useAuthStore.getState();
    expect(state.authUser).toBe(null);
    expect(state.token).toBe(null);
    expect(state.isAuthenticated).toBe(false);
  });

  it('should handle login correctly', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      role: 'user',
      orgRole: 'member',
      isVerified: true,
      isActive: true,
      organizationId: 'org1',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      organization: {
        id: 'org1',
        name: 'Test Org',
        type: 'business',
        email: 'org@example.com',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
    };
    const mockToken = 'test-token';

    useAuthStore.getState().login(mockUser, mockToken);

    const state = useAuthStore.getState();
    expect(state.authUser).toEqual(mockUser);
    expect(state.token).toBe(mockToken);
    expect(state.isAuthenticated).toBe(true);
    expect(state.isInitialized).toBe(true);
  });

  it('should handle logout correctly', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      role: 'user',
      orgRole: 'member',
      isVerified: true,
      isActive: true,
      organizationId: 'org1',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      organization: {
        id: 'org1',
        name: 'Test Org',
        type: 'business',
        email: 'org@example.com',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
    };
    const mockToken = 'test-token';

    // First login
    useAuthStore.getState().login(mockUser, mockToken);
    
    // Then logout
    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.authUser).toBe(null);
    expect(state.token).toBe(null);
    expect(state.isAuthenticated).toBe(false);
    expect(state.isInitialized).toBe(true);
  });

  it('should check auth status correctly', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      role: 'user',
      orgRole: 'member',
      isVerified: true,
      isActive: true,
      organizationId: 'org1',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      organization: {
        id: 'org1',
        name: 'Test Org',
        type: 'business',
        email: 'org@example.com',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
    };
    const mockToken = 'test-token';

    // Initially not authenticated
    expect(useAuthStore.getState().checkAuthStatus()).toBe(false);

    // After login, should be authenticated
    useAuthStore.getState().login(mockUser, mockToken);
    expect(useAuthStore.getState().checkAuthStatus()).toBe(true);

    // After logout, should not be authenticated
    useAuthStore.getState().logout();
    expect(useAuthStore.getState().checkAuthStatus()).toBe(false);
  });
});