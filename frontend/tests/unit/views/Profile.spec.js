import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import Profile from '../../../src/views/Profile.vue'
import { useAuthStore } from '../../../src/stores/auth'
import { nextTick } from 'vue'

// Create a mock auth store
const createMockAuthStore = () => ({
  user: {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    created_at: '2023-01-01T00:00:00.000Z'
  },
  updateProfile: vi.fn(),
  updatePassword: vi.fn()
});

// Mock the auth store
vi.mock('../../../src/stores/auth', () => ({
  useAuthStore: vi.fn()
}));

describe('Profile.vue', () => {
  let mockAuthStore;
  
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();
    
    // Create a fresh mock store
    mockAuthStore = createMockAuthStore();
    
    // Set up the mock implementation
    useAuthStore.mockReturnValue(mockAuthStore);
    
    // Mock timers for setTimeout
    vi.useFakeTimers();
  });
  
  afterEach(() => {
    vi.resetAllMocks();
    vi.useRealTimers();
  });

  it('renders the profile page correctly', () => {
    const wrapper = mount(Profile);
    
    // Check if main sections exist
    expect(wrapper.text()).toContain('Profile Information');
    expect(wrapper.text()).toContain('Change Password');
    
    // Check if user info is displayed
    expect(wrapper.text()).toContain('Test User');
    expect(wrapper.text()).toContain('test@example.com');
    
    // Check for the edit button
    const editButton = wrapper.findAll('button').find(btn => btn.text() === 'Edit');
    expect(editButton).toBeTruthy();
  });

  it('loads user data on mount', async () => {
    const wrapper = mount(Profile);
    await flushPromises();
    
    // Check if the form data is populated with user data
    expect(wrapper.vm.userForm.name).toBe('Test User');
    expect(wrapper.vm.userForm.email).toBe('test@example.com');
  });

  it('toggles edit mode when Edit button is clicked', async () => {
    const wrapper = mount(Profile);
    
    // Initially not in edit mode
    expect(wrapper.vm.editMode).toBe(false);
    
    // The profile edit form should not exist initially
    // But the password form always exists, so we need to check specifically for the profile form
    expect(wrapper.find('input#name').exists()).toBe(false);
    expect(wrapper.find('input#email').exists()).toBe(false);
    
    // Click Edit button
    const editButton = wrapper.findAll('button').find(btn => btn.text() === 'Edit');
    await editButton.trigger('click');
    
    // Should now be in edit mode
    expect(wrapper.vm.editMode).toBe(true);
    
    // Profile form inputs should now exist
    expect(wrapper.find('input#name').exists()).toBe(true);
    expect(wrapper.find('input#email').exists()).toBe(true);
    
    // Form should be populated with user data
    const nameInput = wrapper.find('input#name');
    const emailInput = wrapper.find('input#email');
    expect(nameInput.element.value).toBe('Test User');
    expect(emailInput.element.value).toBe('test@example.com');
    
    // Click Cancel button
    const cancelButton = wrapper.findAll('button').find(btn => btn.text() === 'Cancel');
    await cancelButton.trigger('click');
    
    // Should no longer be in edit mode
    expect(wrapper.vm.editMode).toBe(false);
    
    // Profile form inputs should no longer exist
    expect(wrapper.find('input#name').exists()).toBe(false);
    expect(wrapper.find('input#email').exists()).toBe(false);
  });

  it('updates profile when form is submitted', async () => {
    const wrapper = mount(Profile);
    
    // Enter edit mode
    wrapper.vm.editMode = true;
    await nextTick();
    
    // Change form values
    const nameInput = wrapper.find('input#name');
    const emailInput = wrapper.find('input#email');
    await nameInput.setValue('Updated Name');
    await emailInput.setValue('updated@example.com');
    
    // Call the updateProfile method directly instead of trying to submit the form
    await wrapper.vm.updateProfile();
    
    // Check if updateProfile was called with correct data
    expect(mockAuthStore.updateProfile).toHaveBeenCalledWith({
      name: 'Updated Name',
      email: 'updated@example.com'
    });
    
    // Should show success message and exit edit mode
    await flushPromises();
    expect(wrapper.vm.successMessage).toBe('Profile updated successfully!');
    expect(wrapper.vm.editMode).toBe(false);
    
    // Success message should disappear after timeout
    vi.advanceTimersByTime(3000);
    await flushPromises();
    expect(wrapper.vm.successMessage).toBe('');
  });

  it('handles profile update errors', async () => {
    // Setup mock to reject
    mockAuthStore.updateProfile.mockRejectedValueOnce(new Error('Update failed'));
    
    const wrapper = mount(Profile);
    
    // Enter edit mode
    wrapper.vm.editMode = true;
    await nextTick();
    
    // Call the updateProfile method directly
    await wrapper.vm.updateProfile();
    
    // Should show error message
    await flushPromises();
    expect(wrapper.vm.errorMessage).toBe('Failed to update profile');
    
    // Error message should disappear after timeout
    vi.advanceTimersByTime(3000);
    await flushPromises();
    expect(wrapper.vm.errorMessage).toBe('');
  });

  it('updates password when password form is submitted', async () => {
    const wrapper = mount(Profile);
    
    // Fill in password form
    const currentPasswordInput = wrapper.find('input#currentPassword');
    const newPasswordInput = wrapper.find('input#newPassword');
    const confirmPasswordInput = wrapper.find('input#confirmPassword');
    
    await currentPasswordInput.setValue('oldpassword');
    await newPasswordInput.setValue('newpassword');
    await confirmPasswordInput.setValue('newpassword');
    
    // Call the updatePassword method directly
    await wrapper.vm.updatePassword();
    
    // Check if updatePassword was called with correct data
    expect(mockAuthStore.updatePassword).toHaveBeenCalledWith({
      current_password: 'oldpassword',
      password: 'newpassword',
      password_confirmation: 'newpassword'
    });
    
    // Should show success message
    await flushPromises();
    expect(wrapper.vm.successMessage).toBe('Password updated successfully!');
    
    // Password fields should be cleared
    expect(wrapper.vm.userForm.currentPassword).toBe('');
    expect(wrapper.vm.userForm.newPassword).toBe('');
    expect(wrapper.vm.userForm.newPasswordConfirmation).toBe('');
    
    // Success message should disappear after timeout
    vi.advanceTimersByTime(3000);
    await flushPromises();
    expect(wrapper.vm.successMessage).toBe('');
  });

  it('handles password update errors', async () => {
    // Setup mock to reject
    mockAuthStore.updatePassword.mockRejectedValueOnce(new Error('Update failed'));
    
    const wrapper = mount(Profile);
    
    // Fill in password form
    const currentPasswordInput = wrapper.find('input#currentPassword');
    const newPasswordInput = wrapper.find('input#newPassword');
    const confirmPasswordInput = wrapper.find('input#confirmPassword');
    
    await currentPasswordInput.setValue('oldpassword');
    await newPasswordInput.setValue('newpassword');
    await confirmPasswordInput.setValue('newpassword');
    
    // Call the updatePassword method directly
    await wrapper.vm.updatePassword();
    
    // Should show error message
    await flushPromises();
    expect(wrapper.vm.errorMessage).toBe('Failed to update password');
    
    // Error message should disappear after timeout
    vi.advanceTimersByTime(3000);
    await flushPromises();
    expect(wrapper.vm.errorMessage).toBe('');
  });

  it('displays the user avatar with first letter of name', () => {
    const wrapper = mount(Profile);
    
    // Check if avatar contains first letter of name
    const avatar = wrapper.find('.rounded-full');
    expect(avatar.text()).toBe('T'); // First letter of 'Test User'
  });

  it('displays the member since date correctly', () => {
    const wrapper = mount(Profile);
    
    // Check if member since date is displayed
    const expectedDate = new Date('2023-01-01').toLocaleDateString();
    expect(wrapper.text()).toContain(`Member since ${expectedDate}`);
  });

  it('handles case when user is null', async () => {
    // Create mock auth store with null user
    const mockAuthStore = {
      user: null,
      updateProfile: vi.fn(),
      updatePassword: vi.fn()
    };
    
    // Mock the auth store to return null user
    useAuthStore.mockReturnValue(mockAuthStore);
    
    const wrapper = mount(Profile);
    await flushPromises();
    
    // Check that form values are empty strings
    expect(wrapper.vm.userForm.name).toBe('');
    expect(wrapper.vm.userForm.email).toBe('');
  });
}); 