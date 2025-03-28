import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import api from '../../src/api'

// Mock axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() }
      }
    }))
  }
}))

describe('API', () => {
  it('creates an axios instance with the correct base URL', () => {
    expect(axios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: expect.any(String),
        withCredentials: true,
        headers: expect.objectContaining({
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        })
      })
    );
  }); 
  
  it('exports the api instance', () => {
    expect(api).toBeDefined();
    expect(api.get).toBeDefined();
    expect(api.post).toBeDefined();
    expect(api.put).toBeDefined();
    expect(api.delete).toBeDefined();
  });
}); 

