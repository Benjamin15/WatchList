import { render, screen } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import React from 'react';

// Helper function for rendering components with providers
export const renderWithProviders = (component: React.ReactElement) => {
  return render(
    React.createElement(PaperProvider, { children: component })
  );
};

// Mock data for testing
export const mockMedia = {
  id: 1,
  title: 'Test Movie',
  type: 'movie' as const,
  year: 2023,
  genre: 'Action',
  description: 'Test description',
  posterUrl: 'https://example.com/poster.jpg',
  rating: 8.5,
  tmdbId: 123,
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
};

export const mockRoom = {
  id: 1,
  name: 'Test Room',
  code: 'ABC123',
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
};

export const mockWatchlistItem = {
  id: 1,
  roomId: 1,
  mediaId: 1,
  status: 'watching' as const,
  addedAt: '2023-01-01T00:00:00Z',
  media: mockMedia,
};

// Common assertions
export const commonAssertions = {
  shouldRenderWithoutCrashing: (component: React.ReactElement) => {
    expect(() => renderWithProviders(component)).not.toThrow();
  },

  shouldBeAccessible: (testId: string) => {
    expect(screen.getByTestId(testId)).toBeTruthy();
  },

  shouldDisplayText: (text: string) => {
    expect(screen.getByText(text)).toBeTruthy();
  },

  shouldHaveCorrectProps: (element: any, props: Record<string, any>) => {
    Object.entries(props).forEach(([key, value]) => {
      expect(element.props[key]).toBe(value);
    });
  },
};

// Test suite configuration
export const testConfig = {
  timeout: 10000,
  retries: 2,
  setupTimeout: 5000,
};

// Performance testing utilities
export const performanceTests = {
  measureRenderTime: (component: React.ReactElement) => {
    const start = performance.now();
    renderWithProviders(component);
    const end = performance.now();
    return end - start;
  },

  expectFastRender: (component: React.ReactElement, maxTime = 100) => {
    const renderTime = performanceTests.measureRenderTime(component);
    expect(renderTime).toBeLessThan(maxTime);
  },
};

// Integration test helpers
export const integrationHelpers = {
  createMockNavigation: () => ({
    navigate: jest.fn(),
    setOptions: jest.fn(),
    goBack: jest.fn(),
    canGoBack: jest.fn(),
    reset: jest.fn(),
    dispatch: jest.fn(),
    isFocused: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    getId: jest.fn(),
    getParent: jest.fn(),
    getState: jest.fn(),
  }),

  createMockRoute: (params = {}) => ({
    key: 'test-route',
    name: 'TestScreen',
    params,
  }),

  waitForAsyncOperation: (asyncFn: () => Promise<void>, timeout = 5000) => {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Async operation timeout'));
      }, timeout);

      asyncFn()
        .then(() => {
          clearTimeout(timer);
          resolve(undefined);
        })
        .catch((error) => {
          clearTimeout(timer);
          reject(error);
        });
    });
  },
};

// Custom matchers for better assertions
export const customMatchers = {
  toBeAccessible: (received: any) => {
    const hasAccessibilityLabel = received.props.accessibilityLabel || received.props.accessible;
    const hasTestId = received.props.testID;
    
    if (hasAccessibilityLabel || hasTestId) {
      return {
        message: () => `Expected element to not be accessible`,
        pass: true,
      };
    } else {
      return {
        message: () => `Expected element to be accessible (have accessibilityLabel or testID)`,
        pass: false,
      };
    }
  },

  toHaveCorrectMediaType: (received: any, expectedType: string) => {
    const actualType = received.type;
    
    if (actualType === expectedType) {
      return {
        message: () => `Expected media type to not be ${expectedType}`,
        pass: true,
      };
    } else {
      return {
        message: () => `Expected media type to be ${expectedType}, received ${actualType}`,
        pass: false,
      };
    }
  },
};

// Test data generators
export const testDataGenerators = {
  generateRandomMedia: (overrides = {}) => ({
    id: Math.floor(Math.random() * 1000),
    title: `Test Movie ${Math.floor(Math.random() * 100)}`,
    type: 'movie' as const,
    year: 2020 + Math.floor(Math.random() * 5),
    genre: 'Test Genre',
    description: 'Test description',
    posterUrl: `https://example.com/poster${Math.floor(Math.random() * 100)}.jpg`,
    rating: Math.round((Math.random() * 10) * 10) / 10,
    tmdbId: Math.floor(Math.random() * 10000),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }),

  generateRandomRoom: (overrides = {}) => ({
    id: Math.floor(Math.random() * 1000),
    name: `Test Room ${Math.floor(Math.random() * 100)}`,
    code: Math.random().toString(36).substr(2, 6).toUpperCase(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }),

  generateMultipleMedia: (count: number, overrides = {}) => {
    return Array.from({ length: count }, () => 
      testDataGenerators.generateRandomMedia(overrides)
    );
  },
};

export default {
  renderWithProviders,
  mockMedia,
  mockRoom,
  mockWatchlistItem,
  commonAssertions,
  testConfig,
  performanceTests,
  integrationHelpers,
  customMatchers,
  testDataGenerators,
};
