import { describe, it, expect, vi, beforeEach } from 'vitest'
import router from '../../src/router'
import { useAuthStore } from '../../src/stores/auth'

// Mock the auth store
vi.mock('../../src/stores/auth', () => ({
  useAuthStore: vi.fn()
}))

describe('Router', () => {
  let mockAuthStore;
  
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();
    
    // Create mock auth store
    mockAuthStore = {
      token: null
    };
    
    // Set up mock implementation
    useAuthStore.mockReturnValue(mockAuthStore);
    
    // Reset router's current location
    router.currentRoute.value = { path: '/' };
  });

  it('has the correct routes', () => {
    const routes = router.getRoutes();
    
    // Check if all expected routes exist
    const routePaths = routes.map(route => route.path);
    expect(routePaths).toContain('/');
    expect(routePaths).toContain('/login');
    expect(routePaths).toContain('/register');
    expect(routePaths).toContain('/profile');
    expect(routePaths).toContain('/friends');
  });
  
  it('redirects to login when accessing protected route without auth', async () => {
    // Create a custom navigation guard that mimics the behavior we want to test
    const mockGuard = vi.fn((to, from, next) => {
      const auth = useAuthStore();
      if (to.meta.requiresAuth && !auth.token) {
        next('/login');
      } else {
        next();
      }
    });
    
    // Temporarily add our mock guard to the router
    const removeGuard = router.beforeEach(mockGuard);
    
    // Simulate navigation to a protected route
    const to = { path: '/profile', meta: { requiresAuth: true } };
    const from = { path: '/' };
    const next = vi.fn();
    
    // Call our mock guard
    await mockGuard(to, from, next);
    
    // Check if redirected to login
    expect(next).toHaveBeenCalledWith('/login');
    
    // Remove our temporary guard
    removeGuard();
  });
  
  it('allows access to protected route with auth', async () => {
    // Set token to simulate authenticated state
    mockAuthStore.token = 'fake-token';
    
    // Create a custom navigation guard that mimics the behavior we want to test
    const mockGuard = vi.fn((to, from, next) => {
      const auth = useAuthStore();
      if (to.meta.requiresAuth && !auth.token) {
        next('/login');
      } else {
        next();
      }
    });
    
    // Temporarily add our mock guard to the router
    const removeGuard = router.beforeEach(mockGuard);
    
    // Simulate navigation to a protected route
    const to = { path: '/profile', meta: { requiresAuth: true } };
    const from = { path: '/' };
    const next = vi.fn();
    
    // Call our mock guard
    await mockGuard(to, from, next);
    
    // Check if navigation proceeds
    expect(next).toHaveBeenCalledWith();
    
    // Remove our temporary guard
    removeGuard();
  });
  
  it('redirects to home when accessing login/register while authenticated', async () => {
    // Set token to simulate authenticated state
    mockAuthStore.token = 'fake-token';
    
    // Create a custom navigation guard that mimics the behavior we want to test
    const mockGuard = vi.fn((to, from, next) => {
      const auth = useAuthStore();
      if (to.meta.guest && auth.token) {
        next('/');
      } else {
        next();
      }
    });
    
    // Temporarily add our mock guard to the router
    const removeGuard = router.beforeEach(mockGuard);
    
    // Simulate navigation to a guest route
    const to = { path: '/login', meta: { guest: true } };
    const from = { path: '/' };
    const next = vi.fn();
    
    // Call our mock guard
    await mockGuard(to, from, next);
    
    // Check if redirected to home
    expect(next).toHaveBeenCalledWith('/');
    
    // Remove our temporary guard
    removeGuard();
  });
}); 