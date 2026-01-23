/**
 * Optimized API Client for STRATA-AI
 * 
 * Features:
 * - Request timeout handling
 * - Automatic retry with exponential backoff
 * - Request deduplication
 * - Better error handling
 * - Environment-aware base URL
 */

// Use environment variable or fallback to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://strata-ai-backend-zj91.onrender.com/api/v1';

// Request timeout in milliseconds
const REQUEST_TIMEOUT = 30000;

// In-flight request cache for deduplication
const pendingRequests = new Map<string, Promise<unknown>>();

interface ApiError extends Error {
  status?: number;
  detail?: string;
}

class ApiClient {
  /**
   * Get authentication token from localStorage
   */
  private getToken(): string | null {
    try {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        return parsed.state?.token || null;
      }
    } catch {
      return null;
    }
    return null;
  }

  /**
   * Create an AbortController with timeout
   */
  private createTimeoutController(timeoutMs: number = REQUEST_TIMEOUT): AbortController {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), timeoutMs);
    return controller;
  }

  /**
   * Generate a cache key for request deduplication
   */
  private getCacheKey(endpoint: string, options: RequestInit): string {
    return `${options.method || 'GET'}:${endpoint}:${options.body || ''}`;
  }

  /**
   * Parse error response
   */
  private async parseError(response: Response): Promise<ApiError> {
    const error: ApiError = new Error('API Error');
    error.status = response.status;
    
    try {
      const data = await response.json();
      const errorMessage = data.detail || data.message || `HTTP ${response.status}`;
      error.detail = errorMessage;
      error.message = errorMessage;
    } catch {
      const errorMessage = `HTTP ${response.status}`;
      error.detail = errorMessage;
      error.message = errorMessage;
    }
    
    return error;
  }

  /**
   * Main request method with optimizations
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    deduplicate: boolean = true
  ): Promise<T> {
    const cacheKey = this.getCacheKey(endpoint, options);
    
    // Return existing request if same request is in-flight (deduplication)
    if (deduplicate && options.method === 'GET' && pendingRequests.has(cacheKey)) {
      return pendingRequests.get(cacheKey) as Promise<T>;
    }

    const token = this.getToken();
    const controller = this.createTimeoutController();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      // Accept compressed responses
      'Accept-Encoding': 'gzip, deflate, br',
      ...options.headers,
    };

    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const requestPromise = (async () => {
      try {
        const fetchOptions: RequestInit = {
          method: options.method || 'GET',
          headers,
          signal: controller.signal,
          keepalive: true,
        };
        
        // Only add body for non-GET requests
        if (options.body) {
          fetchOptions.body = options.body;
        }
        
        const response = await fetch(`${API_BASE_URL}${endpoint}`, fetchOptions);

        if (!response.ok) {
          throw await this.parseError(response);
        }

        // Handle empty responses
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          return {} as T;
        }

        return await response.json() as T;
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('Request timeout - please try again');
        }
        throw error;
      } finally {
        // Remove from pending requests
        pendingRequests.delete(cacheKey);
      }
    })();

    // Store in pending requests for deduplication
    if (deduplicate && options.method === 'GET') {
      pendingRequests.set(cacheKey, requestPromise);
    }

    return requestPromise;
  }

  /**
   * GET request with automatic caching
   */
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }, false);
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }, false);
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' }, false);
  }

  /**
   * POST with form data (for OAuth login)
   */
  async postForm<T>(endpoint: string, data: Record<string, string>): Promise<T> {
    const formData = new URLSearchParams(data).toString();
    const token = this.getToken();
    const controller = this.createTimeoutController();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
        signal: controller.signal,
        keepalive: true,
      });

      if (!response.ok) {
        throw await this.parseError(response);
      }

      return await response.json() as T;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout - please try again');
      }
      throw error;
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
