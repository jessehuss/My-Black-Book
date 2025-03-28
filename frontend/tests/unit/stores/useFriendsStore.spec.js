import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useFriendsStore } from '../../../src/stores/useFriendsStore'
import { useAuthStore } from '../../../src/stores/auth'
import api from '../../../src/api'

// Mock the API module
vi.mock('../../../src/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn()
  }
}))

// Mock the auth store
vi.mock('../../../src/stores/auth', () => ({
  useAuthStore: vi.fn()
}))

describe('Friends Store', () => {
  let store;
  const mockToken = 'fake-token';
  
  beforeEach(() => {
    // Create a fresh pinia instance
    setActivePinia(createPinia())
    
    // Setup auth store mock
    useAuthStore.mockReturnValue({ token: mockToken });
    
    // Create the actual store instance
    store = useFriendsStore();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should fetch and update friends list', async () => {
    // Mock API response
    const mockFriends = [
      { id: 1, name: 'Friend 1' },
      { id: 2, name: 'Friend 2' }
    ];
    
    api.get.mockResolvedValue({ data: mockFriends });

    // Call the actual store method
    await store.fetchFriends();

    // Assertions
    expect(api.get).toHaveBeenCalledWith('/friends', {
      headers: { Authorization: `Bearer ${mockToken}` }
    });
    expect(store.friends).toEqual(mockFriends);
  });

  it('should fetch and update pending requests', async () => {
    // Mock API response
    const mockRequests = [
      { id: 1, sender: { id: 3, name: 'User 3' } },
      { id: 2, sender: { id: 4, name: 'User 4' } }
    ];
    
    api.get.mockResolvedValue({ data: mockRequests });

    // Call the fetchPendingRequests function
    await store.fetchPendingRequests();

    // Assertions
    expect(api.get).toHaveBeenCalledWith('/friends/pending', {
      headers: { Authorization: `Bearer ${mockToken}` }
    });
    expect(store.pendingRequests).toEqual(mockRequests);
  });

  it('should send friend request and refresh pending requests', async () => {
    // Setup spies
    const fetchPendingRequestsSpy = vi.spyOn(store, 'fetchPendingRequests');
    api.post.mockResolvedValue({});

    // Call the sendFriendRequest function
    const friendId = 123;
    await store.sendFriendRequest(friendId);

    // Assertions
    expect(api.post).toHaveBeenCalledWith(
      '/friends/request',
      { friend_id: friendId },
      { headers: { Authorization: `Bearer ${mockToken}` }}
    );
    expect(fetchPendingRequestsSpy).toHaveBeenCalled();
  });

  it('should accept friend request and refresh lists', async () => {
    // Setup spies
    const fetchFriendsSpy = vi.spyOn(store, 'fetchFriends');
    const fetchPendingRequestsSpy = vi.spyOn(store, 'fetchPendingRequests');
    api.post.mockResolvedValue({});

    // Call the acceptFriendRequest function
    const requestId = 456;
    await store.acceptFriendRequest(requestId);

    // Assertions
    expect(api.post).toHaveBeenCalledWith(
      `/friends/accept/${requestId}`,
      null,
      { headers: { Authorization: `Bearer ${mockToken}` }}
    );
    expect(fetchFriendsSpy).toHaveBeenCalled();
    expect(fetchPendingRequestsSpy).toHaveBeenCalled();
  });

  it('should remove friend and refresh friends list', async () => {
    // Setup spy
    const fetchFriendsSpy = vi.spyOn(store, 'fetchFriends');
    api.delete.mockResolvedValue({});

    // Call the removeFriend function
    const friendId = 789;
    await store.removeFriend(friendId);

    // Assertions
    expect(api.delete).toHaveBeenCalledWith(
      `/friends/remove/${friendId}`,
      { headers: { Authorization: `Bearer ${mockToken}` }}
    );
    expect(fetchFriendsSpy).toHaveBeenCalled();
  });

  it('should search users and update results', async () => {
    // Mock API response
    const mockResults = [
      { id: 5, name: 'Test User 1' },
      { id: 6, name: 'Test User 2' }
    ];
    
    api.get.mockResolvedValue({ data: mockResults });

    // Call the searchUsers function
    const query = 'test';
    await store.searchUsers(query);

    // Assertions
    expect(api.get).toHaveBeenCalledWith('/users/search', {
      params: { q: query },
      headers: { Authorization: `Bearer ${mockToken}` }
    });
    expect(store.searchResults).toEqual(mockResults);
  });

  it('should clear search results when query is too short', async () => {
    // Setup initial state
    store.searchResults = [{ id: 1, name: 'Previous Result' }];
    
    // Call the searchUsers function with short query
    await store.searchUsers('a');

    // Assertions
    expect(api.get).not.toHaveBeenCalled();
    expect(store.searchResults).toEqual([]);
  });

  it('should handle search errors', async () => {
    // Mock console.error
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock API to throw error
    api.get.mockRejectedValue(new Error('Network error'));

    // Call the searchUsers function
    const query = 'test';
    await store.searchUsers(query);

    // Assertions
    expect(api.get).toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith('Search failed:', expect.any(Error));
    expect(store.searchResults).toEqual([]);
    
    // Restore console.error
    consoleErrorSpy.mockRestore();
  });
}); 