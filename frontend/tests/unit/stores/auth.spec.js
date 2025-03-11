import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../../../src/stores/auth'
import api from '../../../src/api'

// Mock the API
vi.mock('../../../src/api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn()
  }
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn()
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Auth Store', () => {
  let store;
  
  beforeEach(() => {
    // Create a fresh pinia instance
    setActivePinia(createPinia())
    
    // Reset localStorage mock
    localStorageMock.getItem.mockReset();
    localStorageMock.setItem.mockReset();
    localStorageMock.removeItem.mockReset();
    
    // Mock localStorage to return a token
    localStorageMock.getItem.mockReturnValue('existing-token');
    
    // Create the actual store instance
    store = useAuthStore();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should initialize with token from localStorage', () => {
    expect(localStorageMock.getItem).toHaveBeenCalledWith('auth_token');
    expect(store.token).toBe('existing-token');
  });

  it('should register a new user', async () => {
    // Mock API response
    api.post.mockResolvedValue({ data: { success: true } });

    // Call register method
    await store.register('Test User', 'test@example.com', 'password123');

    // Assertions
    expect(api.post).toHaveBeenCalledWith('/register', {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });
  });

  it('should handle registration errors', async () => {
    // Mock API to throw error
    api.post.mockRejectedValue(new Error('Registration failed'));

    // Call register method and expect it to throw
    await expect(
      store.register('Test User', 'test@example.com', 'password123')
    ).rejects.toThrow('Registration failed');
  });

  it('should update user after login', async () => {
    // Mock API response
    const mockUser = { id: 1, name: 'Test User', email: 'test@example.com' };
    const mockToken = 'fake-token';
    
    api.post.mockResolvedValue({ 
      data: { user: mockUser, token: mockToken }
    });

    // Call the actual store method
    await store.login('test@example.com', 'password');

    // Assertions
    expect(store.user).toEqual(mockUser);
    expect(store.token).toBe(mockToken);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_token', mockToken);
  });

  it('should handle login errors', async () => {
    // Mock API to throw error
    api.post.mockRejectedValue(new Error('Invalid credentials'));

    // Call login method and expect it to throw
    await expect(
      store.login('test@example.com', 'wrong-password')
    ).rejects.toThrow('Invalid credentials');
  });

  it('should fetch user profile when token exists', async () => {
    // Mock API response
    const mockUser = { id: 1, name: 'Test User', email: 'test@example.com' };
    api.get.mockResolvedValue({ data: mockUser });

    // Call fetchUser method
    await store.fetchUser();

    // Assertions
    expect(api.get).toHaveBeenCalledWith('/me', {
      headers: { Authorization: `Bearer existing-token` }
    });
    expect(store.user).toEqual(mockUser);
  });

  it('should not fetch user profile when token does not exist', async () => {
    // Set token to null
    store.token = null;

    // Call fetchUser method
    await store.fetchUser();

    // Assertions
    expect(api.get).not.toHaveBeenCalled();
  });

  it('should logout and clear user data', async () => {
    // Setup initial state
    store.user = { id: 1, name: 'Test User' };
    store.token = 'test-token';
    
    // Mock API response
    api.post.mockResolvedValue({});

    // Call logout method
    await store.logout();

    // Assertions
    expect(api.post).toHaveBeenCalledWith('/logout', null, {
      headers: { Authorization: `Bearer test-token` }
    });
    expect(store.user).toBeNull();
    expect(store.token).toBeNull();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token');
  });

  it('should handle logout errors', async () => {
    // Setup initial state
    store.user = { id: 1, name: 'Test User' };
    store.token = 'test-token';
    
    // Mock API to throw error
    api.post.mockRejectedValue(new Error('Logout failed'));

    // Call logout method
    await expect(store.logout()).rejects.toThrow('Logout failed');
  });

  it('should logout when fetchUser fails', async () => {
    // Mock API to throw error
    api.get.mockRejectedValue(new Error('Unauthorized'));
    
    // Spy on logout method
    const logoutSpy = vi.spyOn(store, 'logout');
    logoutSpy.mockResolvedValue();

    // Call fetchUser method
    await store.fetchUser();

    // Assertions
    expect(logoutSpy).toHaveBeenCalled();
  });

  it('should update user profile', async () => {
    // Setup initial state
    store.token = 'test-token';
    
    // Mock API response
    const updatedUser = { id: 1, name: 'Updated Name', email: 'updated@example.com' };
    api.put.mockResolvedValue({ data: updatedUser });

    // Call updateProfile method
    const profileData = { name: 'Updated Name', email: 'updated@example.com' };
    const result = await store.updateProfile(profileData);

    // Assertions
    expect(api.put).toHaveBeenCalledWith('/profile', profileData, {
      headers: { Authorization: `Bearer test-token` }
    });
    expect(store.user).toEqual(updatedUser);
    expect(result).toEqual(updatedUser);
  });

  it('should handle profile update errors', async () => {
    // Setup initial state
    store.token = 'test-token';
    
    // Mock API to throw error
    api.put.mockRejectedValue(new Error('Update failed'));

    // Call updateProfile method and expect it to throw
    await expect(
      store.updateProfile({ name: 'New Name', email: 'new@example.com' })
    ).rejects.toThrow('Update failed');
  });

  it('should update password', async () => {
    // Setup initial state
    store.token = 'test-token';
    
    // Mock API response
    const response = { success: true, message: 'Password updated' };
    api.put.mockResolvedValue({ data: response });

    // Call updatePassword method
    const passwordData = {
      current_password: 'oldpassword',
      password: 'newpassword',
      password_confirmation: 'newpassword'
    };
    const result = await store.updatePassword(passwordData);

    // Assertions
    expect(api.put).toHaveBeenCalledWith('/password', passwordData, {
      headers: { Authorization: `Bearer test-token` }
    });
    expect(result).toEqual(response);
  });

  it('should handle password update errors', async () => {
    // Setup initial state
    store.token = 'test-token';
    
    // Mock API to throw error
    api.put.mockRejectedValue(new Error('Password update failed'));

    // Call updatePassword method and expect it to throw
    const passwordData = {
      current_password: 'wrongpassword',
      password: 'newpassword',
      password_confirmation: 'newpassword'
    };
    await expect(
      store.updatePassword(passwordData)
    ).rejects.toThrow('Password update failed');
  });

  it('should log user data during login', async () => {
    // Mock console.log
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    // Mock API response
    const mockUser = { id: 1, name: 'Test User', email: 'test@example.com' };
    const mockToken = 'fake-token';
    
    api.post.mockResolvedValue({ 
      data: { user: mockUser, token: mockToken }
    });

    // Call login method
    await store.login('test@example.com', 'password');

    // Assertions
    expect(consoleLogSpy).toHaveBeenCalledWith(mockUser);
    
    // Restore console.log
    consoleLogSpy.mockRestore();
  });
});