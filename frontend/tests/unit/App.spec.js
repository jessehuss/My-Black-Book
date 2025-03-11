import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import App from '../../src/App.vue'
import { useAuthStore } from '../../src/stores/auth'
import { createRouter, createWebHistory } from 'vue-router'

// Mock the auth store
vi.mock('../../src/stores/auth', () => ({
  useAuthStore: vi.fn()
}))

// Create a minimal router
const routes = [
  { path: '/', component: { template: '<div>Home</div>' } },
  { path: '/login', component: { template: '<div>Login</div>' } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

describe('App.vue', () => {
  let mockAuthStore;
  
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();
    
    // Create mock auth store
    mockAuthStore = {
      token: 'fake-token',
      user: { id: 1, name: 'Test User' },
      logout: vi.fn()
    };
    
    // Set up mock implementation
    useAuthStore.mockReturnValue(mockAuthStore);
  });

  it('renders the app correctly when authenticated', async () => {
    const wrapper = mount(App, {
      global: {
        plugins: [router]
      }
    });
    
    await flushPromises();
    
    // Check if app renders with navigation
    expect(wrapper.find('nav').exists()).toBe(true);
    expect(wrapper.text()).toContain('Home');
    expect(wrapper.text()).toContain('Profile');
    expect(wrapper.text()).toContain('Friends');
  });
  
  it('shows navigation links when user is authenticated', async () => {
    const wrapper = mount(App, {
      global: {
        plugins: [router]
      }
    });
    
    await flushPromises();
    
    // Check if user-specific navigation links are shown
    expect(wrapper.text()).toContain('Profile');
    expect(wrapper.text()).toContain('Friends');
    expect(wrapper.text()).toContain('Logout');
  });
  
  it('hides navigation when user is not authenticated', async () => {
    // Set token to null to simulate unauthenticated state
    mockAuthStore.token = null;
    mockAuthStore.user = null;
    
    const wrapper = mount(App, {
      global: {
        plugins: [router]
      }
    });
    
    await flushPromises();
    
    // Check if navigation is hidden
    expect(wrapper.find('nav').exists()).toBe(false);
  });
  
  it('calls logout when logout button is clicked', async () => {
    const wrapper = mount(App, {
      global: {
        plugins: [router]
      }
    });
    
    await flushPromises();
    
    // Find and click logout button
    const logoutButton = wrapper.find('button[class*="bg-blue-600"]');
    await logoutButton.trigger('click');
    
    // Check if logout was called
    expect(mockAuthStore.logout).toHaveBeenCalled();
    
    // Check if router.push was called with '/login'
    // We can't directly test this since router.push is not mocked,
    // but we can check that the component attempted to navigate
  });
  
  it('toggles mobile menu when hamburger button is clicked', async () => {
    const wrapper = mount(App, {
      global: {
        plugins: [router]
      }
    });
    
    await flushPromises();
    
    // Find the mobile menu toggle button
    const hamburgerButton = wrapper.find('button');
    
    // Check that mobile menu is initially hidden
    expect(wrapper.vm.mobileMenuOpen).toBe(false);
    expect(wrapper.find('div.sm\\:hidden > div').exists()).toBe(false);
    
    // Click the button to toggle the menu
    await hamburgerButton.trigger('click');
    
    // Check that mobile menu is now visible
    expect(wrapper.vm.mobileMenuOpen).toBe(true);
    expect(wrapper.find('div.sm\\:hidden > div').exists()).toBe(true);
    
    // Click again to hide
    await hamburgerButton.trigger('click');
    
    // Check that mobile menu is hidden again
    expect(wrapper.vm.mobileMenuOpen).toBe(false);
    expect(wrapper.find('div.sm\\:hidden > div').exists()).toBe(false);
  });
}); 