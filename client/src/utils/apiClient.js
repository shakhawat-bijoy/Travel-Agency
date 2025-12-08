const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";

/**
 * Enhanced fetch wrapper with error handling and retry logic
 */
export class ApiClient {
  constructor(baseURL = API_BASE) {
    this.baseURL = baseURL;
    this.timeout = 30000; // 30 seconds
  }

  /**
   * Make an API request with error handling
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      // Add timeout to fetch
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Parse response
      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      // Handle HTTP errors
      if (!response.ok) {
        throw new ApiError(
          data.error || data.message || `Request failed with status ${response.status}`,
          response.status,
          data
        );
      }

      return data;
    } catch (error) {
      // Handle different error types
      if (error.name === 'AbortError') {
        throw new ApiError('Request timeout - please try again', 408);
      }

      if (error instanceof ApiError) {
        throw error;
      }

      // Network errors
      if (error.message.includes('fetch') || error.message.includes('network')) {
        throw new ApiError(
          'Unable to connect to server. Please check your internet connection.',
          0
        );
      }

      // Unknown errors
      throw new ApiError(error.message || 'An unexpected error occurred', 500);
    }
  }

  // Convenience methods
  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }

  isNetworkError() {
    return this.status === 0;
  }

  isServerError() {
    return this.status >= 500;
  }

  isClientError() {
    return this.status >= 400 && this.status < 500;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export base URL for direct use
export { API_BASE };
