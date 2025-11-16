// API base URL
const API_BASE_URL = 'http://localhost:5001/api';

// Get token from localStorage
const getToken = () => {
    return localStorage.getItem('token');
};

// API call helper function
const apiCall = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = getToken();

    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        ...options,
    };

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            // Create error object with validation errors if available
            const error = new Error(data.message || 'API call failed');
            if (data.errors) {
                error.errors = data.errors;
            }
            throw error;
        }

        return data;
    } catch (error) {
        console.error('API call error:', error);
        throw error;
    }
};

// Auth API functions
export const authAPI = {
    // Register user
    register: (userData) => {
        return apiCall('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    },

    // Login user
    login: (credentials) => {
        return apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
    },

    // Get current user profile
    getProfile: () => {
        return apiCall('/auth/me');
    },

    // Forgot password
    forgotPassword: (email) => {
        return apiCall('/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
    },

    // Verify reset code
    verifyResetCode: (email, code) => {
        return apiCall('/auth/verify-reset-code', {
            method: 'POST',
            body: JSON.stringify({ email, code }),
        });
    },

    // Reset password
    resetPassword: (resetToken, newPassword, email) => {
        return apiCall('/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify({ resetToken, newPassword, email }),
        });
    },
};

// User management functions
export const userAPI = {
    // Update user profile
    updateProfile: (userData) => {
        return apiCall('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(userData),
        });
    },

    // Upload user image (profile or cover)
    uploadImage: async (formData) => {
        const token = getToken();
        console.log('Making upload request to:', `${API_BASE_URL}/auth/upload-image`);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/upload-image`, {
                method: 'POST',
                headers: {
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
                body: formData,
            });

            console.log('Upload response status:', response.status);
            const data = await response.json();
            console.log('Upload response data:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Upload failed');
            }

            return data;
        } catch (error) {
            console.error('Upload API error:', error);
            throw error;
        }
    },

    // Delete user account
    deleteAccount: () => {
        return apiCall('/auth/delete-account', {
            method: 'DELETE',
        });
    },
};

// Flight API functions
export const flightAPI = {
    // Search flights directly from Amadeus (no database storage)
    searchFlightsDirect: (searchParams) => {
        const queryString = new URLSearchParams(searchParams).toString();
        return apiCall(`/flights/search-direct?${queryString}`);
    },

    // Search airports
    searchAirports: (query, limit = 15) => {
        return apiCall(`/flights/airports?query=${encodeURIComponent(query)}&limit=${limit}`);
    },

    // Book a flight (only booking data goes to database)
    bookFlight: (bookingData) => {
        return apiCall('/flights/book', {
            method: 'POST',
            body: JSON.stringify(bookingData),
        });
    },

    // Get user bookings
    getUserBookings: (userId, page = 1, limit = 20) => {
        return apiCall(`/flights/bookings/${userId}?page=${page}&limit=${limit}`);
    },

    // Get bookings by email (fallback)
    getBookingsByEmail: (email, page = 1, limit = 20) => {
        return apiCall(`/flights/bookings/email/${encodeURIComponent(email)}?page=${page}&limit=${limit}`);
    },

    // Get all bookings directly from bookings table
    getAllBookings: (page = 1, limit = 50) => {
        return apiCall(`/flights/bookings/all?page=${page}&limit=${limit}`);
    },

    // Get multiple bookings by their IDs
    getBookingsByIds: (bookingIds) => {
        return apiCall('/flights/bookings/by-ids', {
            method: 'POST',
            body: JSON.stringify({ bookingIds }),
        });
    },

    // Link bookings with null userId to a user by email
    linkUserBookings: (userId, email) => {
        return apiCall('/flights/bookings/link-user', {
            method: 'PUT',
            body: JSON.stringify({ userId, email }),
        });
    },

    // Get booking details
    getBookingDetails: (bookingId) => {
        return apiCall(`/flights/booking/${bookingId}`);
    },

    // Cancel booking
    cancelBooking: (bookingId) => {
        return apiCall(`/flights/booking/${bookingId}/cancel`, {
            method: 'PUT',
        });
    },

    // Delete booking
    deleteBooking: (bookingId) => {
        return apiCall(`/flights/booking/${bookingId}`, {
            method: 'DELETE',
        });
    },

    // Bangladesh airports
    getBangladeshAirports: () => {
        return apiCall('/flights/airports/bangladesh');
    },


};

// Saved Cards API functions
export const savedCardsAPI = {
    // Get user's saved cards
    getSavedCards: (userId) => {
        return apiCall(`/saved-cards/${userId}`);
    },

    // Save a new card
    saveCard: (cardData) => {
        return apiCall('/saved-cards', {
            method: 'POST',
            body: JSON.stringify(cardData),
        });
    },

    // Update saved card
    updateCard: (cardId, cardData) => {
        return apiCall(`/saved-cards/${cardId}`, {
            method: 'PUT',
            body: JSON.stringify(cardData),
        });
    },

    // Delete saved card
    deleteCard: (cardId) => {
        return apiCall(`/saved-cards/${cardId}`, {
            method: 'DELETE',
        });
    },

    // Set card as default
    setDefaultCard: (cardId) => {
        return apiCall(`/saved-cards/${cardId}/set-default`, {
            method: 'PUT',
        });
    },

    // Update last used timestamp
    updateLastUsed: (cardId) => {
        return apiCall(`/saved-cards/${cardId}/update-last-used`, {
            method: 'PUT',
        });
    },
};

// Payment API functions
export const paymentAPI = {
    // Add payment method
    addPaymentMethod: (paymentData) => {
        return apiCall('/payment/add', {
            method: 'POST',
            body: JSON.stringify(paymentData),
        });
    },

    // Get user's payment methods
    getPaymentMethods: () => {
        return apiCall('/payment/methods');
    },

    // Set payment method as default
    setDefaultPaymentMethod: (paymentId) => {
        return apiCall(`/payment/${paymentId}/default`, {
            method: 'PUT',
        });
    },

    // Delete payment method
    deletePaymentMethod: (paymentId) => {
        return apiCall(`/payment/${paymentId}`, {
            method: 'DELETE',
        });
    },
};

// Authentication helpers
export const auth = {
    // Save user data to localStorage
    saveUserData: (token, user) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
    },

    // Get user data from localStorage
    getUserData: () => {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        return {
            token,
            user: user ? JSON.parse(user) : null,
        };
    },

    // Check if user is authenticated
    isAuthenticated: () => {
        const token = localStorage.getItem('token');
        return !!token;
    },

    // Logout user
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },
};

export default apiCall;