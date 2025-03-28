import { describe, it, expect, vi } from 'vitest'
import { createApp } from 'vue'

// Mock Vue
vi.mock('vue', () => ({
  createApp: vi.fn(() => ({
    use: vi.fn().mockReturnThis(),
    mount: vi.fn()
  }))
}))

// Mock router
vi.mock('../../src/router', () => ({
  default: 'mock-router'
}))

// Mock pinia
vi.mock('pinia', () => ({
  createPinia: vi.fn(() => 'mock-pinia'),
  defineStore: vi.fn(() => vi.fn())
}))

// Mock the auth store to prevent it from trying to use defineStore
vi.mock('../../src/stores/auth', () => ({
  useAuthStore: vi.fn()
}))

// Mock App component
vi.mock('../../src/App.vue', () => ({
  default: 'mock-app-component'
}))

describe('main.js', () => {
  it('creates and mounts the app with router and pinia', async () => {
    // Import main.js to execute it
    await import('../../src/main.js');
    
    // Check if createApp was called with App component
    expect(createApp).toHaveBeenCalledWith('mock-app-component');
    
    // Get the app instance
    const app = createApp.mock.results[0].value;
    
    // Check if app.use was called with router and pinia
    expect(app.use).toHaveBeenCalledWith('mock-router');
    expect(app.use).toHaveBeenCalledWith('mock-pinia');
    
    // Check if app.mount was called
    expect(app.mount).toHaveBeenCalledWith('#app');
  });
}); 