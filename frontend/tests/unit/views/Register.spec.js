import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import Register from '../../../src/views/Register.vue'
import { useAuthStore } from '../../../src/stores/auth'
import { useRouter } from 'vue-router'

// Mock the auth store
vi.mock('../../../src/stores/auth', () => ({
  useAuthStore: vi.fn()
}))

// Mock vue-router
vi.mock('vue-router', () => ({
  useRouter: vi.fn()
}))

describe('Register.vue', () => {
  let mockAuthStore;
  let mockRouter;
  
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();
    
    // Create mock auth store
    mockAuthStore = {
      register: vi.fn(),
      login: vi.fn()
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

  it('renders the registration page correctly', () => {
    const wrapper = mount(Register);
    
    // Check if main elements exist
    expect(wrapper.text()).toContain('Create your account');
    expect(wrapper.text()).toContain('sign in to existing account');
    
    // Check for form inputs
    expect(wrapper.find('input#name').exists()).toBe(true);
    expect(wrapper.find('input#email').exists()).toBe(true);
    expect(wrapper.find('input#password').exists()).toBe(true);
    
    // Check for submit button
    const submitButton = wrapper.find('button[type="submit"]');
    expect(submitButton.exists()).toBe(true);
    expect(submitButton.text()).toBe('Create account');
  });

  it('updates form values when inputs change', async () => {
    const wrapper = mount(Register);
    
    // Get form inputs
    const nameInput = wrapper.find('input#name');
    const emailInput = wrapper.find('input#email');
    const passwordInput = wrapper.find('input#password');
    
    // Set input values
    await nameInput.setValue('Test User');
    await emailInput.setValue('test@example.com');
    await passwordInput.setValue('password123');
    
    // Check if component data is updated
    expect(wrapper.vm.name).toBe('Test User');
    expect(wrapper.vm.email).toBe('test@example.com');
    expect(wrapper.vm.password).toBe('password123');
  });

  it('calls register and login methods when form is submitted', async () => {
    const wrapper = mount(Register);
    
    // Set form values
    await wrapper.find('input#name').setValue('Test User');
    await wrapper.find('input#email').setValue('test@example.com');
    await wrapper.find('input#password').setValue('password123');
    
    // Submit the form
    await wrapper.find('form').trigger('submit.prevent');
    
    // Wait for promises to resolve
    await flushPromises();
    
    // Check if auth methods were called with correct parameters
    expect(mockAuthStore.register).toHaveBeenCalledWith('Test User', 'test@example.com', 'password123');
    expect(mockAuthStore.login).toHaveBeenCalledWith('test@example.com', 'password123');
    
    // Check if router.push was called to redirect user
    expect(mockRouter.push).toHaveBeenCalledWith('/');
  });

  it('displays error message when registration fails', async () => {
    // Setup mock to reject
    mockAuthStore.register.mockRejectedValueOnce(new Error('Registration failed'));
    
    const wrapper = mount(Register);
    
    // Set form values
    await wrapper.find('input#name').setValue('Test User');
    await wrapper.find('input#email').setValue('test@example.com');
    await wrapper.find('input#password').setValue('password123');
    
    // Submit the form
    await wrapper.find('form').trigger('submit.prevent');
    
    // Wait for promises to resolve
    await flushPromises();
    
    // Check if error message is displayed
    expect(wrapper.vm.error).toBe('Registration failed. Please try again.');
    expect(wrapper.text()).toContain('Registration failed. Please try again.');
    
    // Check that login and router.push were not called
    expect(mockAuthStore.login).not.toHaveBeenCalled();
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it('navigates to login page when login link is clicked', async () => {
    const wrapper = mount(Register);
    
    // Find the login link
    const loginLink = wrapper.find('a');
    
    // Check if the link points to the login page
    expect(loginLink.attributes('href')).toBe('/login');
  });

  it('requires all fields to be filled', async () => {
    const wrapper = mount(Register);
    
    // Check if inputs have required attribute
    const nameInput = wrapper.find('input#name');
    const emailInput = wrapper.find('input#email');
    const passwordInput = wrapper.find('input#password');
    
    expect(nameInput.attributes('required')).toBeDefined();
    expect(emailInput.attributes('required')).toBeDefined();
    expect(passwordInput.attributes('required')).toBeDefined();
  });

  it('validates email input type', async () => {
    const wrapper = mount(Register);
    
    // Check if email input has type="email"
    const emailInput = wrapper.find('input#email');
    expect(emailInput.attributes('type')).toBe('email');
  });

  it('masks password input', async () => {
    const wrapper = mount(Register);
    
    // Check if password input has type="password"
    const passwordInput = wrapper.find('input#password');
    expect(passwordInput.attributes('type')).toBe('password');
  });
}); 