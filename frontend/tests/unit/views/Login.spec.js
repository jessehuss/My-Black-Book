import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import Login from '../../../src/views/Login.vue'
import { useAuthStore } from '../../../src/stores/auth'
import { useRouter } from 'vue-router'

// Mock the auth store without using Pinia
vi.mock('../../../src/stores/auth', () => ({
  useAuthStore: vi.fn()
}))

// Mock vue-router
vi.mock('vue-router', () => ({
  useRouter: vi.fn()
}))

describe('Login.vue', () => {
  let mockAuthStore;
  let mockRouter;
  
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();
    
    // Create mock auth store
    mockAuthStore = {
      login: vi.fn(),
      token: null
    };
    
    // Create mock router
    mockRouter = {
      push: vi.fn()
    };
    
    // Set up mock implementations
    useAuthStore.mockReturnValue(mockAuthStore);
    useRouter.mockReturnValue(mockRouter);
  });
  
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('renders login form correctly', () => {
    const wrapper = mount(Login);
    
    // Check if main elements exist
    expect(wrapper.text()).toContain('Sign in to your account');
    expect(wrapper.text()).toContain('create a new account');
    
    // Check for form inputs
    expect(wrapper.find('input[type="email"]').exists()).toBe(true);
    expect(wrapper.find('input[type="password"]').exists()).toBe(true);
    
    // Check for submit button
    const submitButton = wrapper.find('button[type="submit"]');
    expect(submitButton.exists()).toBe(true);
    expect(submitButton.text()).toContain('Sign in');
  });

  it('updates form values when inputs change', async () => {
    const wrapper = mount(Login);
    
    // Get form inputs
    const emailInput = wrapper.find('input[type="email"]');
    const passwordInput = wrapper.find('input[type="password"]');
    
    // Set input values
    await emailInput.setValue('test@example.com');
    await passwordInput.setValue('password123');
    
    // Check if component data is updated
    expect(wrapper.vm.email).toBe('test@example.com');
    expect(wrapper.vm.password).toBe('password123');
  });

  it('handles login process', async () => {
    // Setup mock to resolve successfully
    mockAuthStore.login.mockResolvedValueOnce({ token: 'fake-token' });
    mockAuthStore.token = 'fake-token';
    
    const wrapper = mount(Login);
    
    // Set form values
    await wrapper.find('input[type="email"]').setValue('test@example.com');
    await wrapper.find('input[type="password"]').setValue('password123');
    
    // Submit the form
    await wrapper.find('form').trigger('submit.prevent');
    
    // Wait for promises to resolve
    await flushPromises();
    
    // Check if auth methods were called with correct parameters
    expect(mockAuthStore.login).toHaveBeenCalledWith('test@example.com', 'password123');
    
    // Check if router.push was called to redirect user
    expect(mockRouter.push).toHaveBeenCalledWith('/');
  });

  it('handles failed login attempt', async () => {
    // Setup mock to reject
    mockAuthStore.login.mockRejectedValueOnce(new Error('Invalid credentials'));
    
    const wrapper = mount(Login);
    
    // Set form values
    await wrapper.find('input[type="email"]').setValue('test@example.com');
    await wrapper.find('input[type="password"]').setValue('wrong-password');
    
    // Submit the form
    await wrapper.find('form').trigger('submit.prevent');
    
    // Wait for promises to resolve
    await flushPromises();
    
    // Check if error message is displayed
    expect(wrapper.vm.error).toBe('Invalid credentials');
    expect(wrapper.text()).toContain('Invalid credentials');
    
    // Check that router.push was not called
    expect(mockRouter.push).not.toHaveBeenCalled();
    
    // Check if email field is preserved
    expect(wrapper.vm.email).toBe('test@example.com');
    const emailInput = wrapper.find('input[type="email"]');
    expect(emailInput.element.value).toBe('test@example.com');
  });

  it('navigates to register page when register link is clicked', async () => {
    const wrapper = mount(Login);
    
    // Find the register link
    const registerLink = wrapper.find('a');
    
    // Check if the link points to the register page
    expect(registerLink.attributes('href')).toBe('/register');
  });

  it('requires all fields to be filled', async () => {
    const wrapper = mount(Login);
    
    // Check if inputs have required attribute
    const emailInput = wrapper.find('input[type="email"]');
    const passwordInput = wrapper.find('input[type="password"]');
    
    expect(emailInput.attributes('required')).toBeDefined();
    expect(passwordInput.attributes('required')).toBeDefined();
  });

  it('validates email input type', async () => {
    const wrapper = mount(Login);
    
    // Check if email input has type="email"
    const emailInput = wrapper.find('input[type="email"]');
    expect(emailInput.attributes('type')).toBe('email');
  });

  it('masks password input', async () => {
    const wrapper = mount(Login);
    
    // Check if password input has type="password"
    const passwordInput = wrapper.find('input[type="password"]');
    expect(passwordInput.attributes('type')).toBe('password');
  });
});