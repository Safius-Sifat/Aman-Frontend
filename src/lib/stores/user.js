import { writable } from 'svelte/store';

/**
 * User store for managing authentication state
 */
function createUserStore() {
  const { subscribe, set, update } = writable(null);

  return {
    subscribe,
    set,
    update,
    
    /**
     * Set user data
     * @param {Object|null} userData - User data or null to clear
     */
    setUser: (userData) => {
      set(userData);
      
      // Store in localStorage for persistence
      if (userData) {
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        localStorage.removeItem('user');
      }
    },
    
    /**
     * Update user data
     * @param {Object} updates - Updates to apply
     */
    updateUser: (updates) => {
      update(currentUser => {
        if (!currentUser) return null;
        
        const updatedUser = { ...currentUser, ...updates };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return updatedUser;
      });
    },
    
    /**
     * Clear user data (logout)
     */
    clear: () => {
      set(null);
      localStorage.removeItem('user');
    },
    
    /**
     * Load user from localStorage
     */
    loadFromStorage: () => {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem('user');
        if (stored) {
          try {
            const userData = JSON.parse(stored);
            set(userData);
            return userData;
          } catch (error) {
            console.error('Failed to parse stored user data:', error);
            localStorage.removeItem('user');
          }
        }
      }
      return null;
    },
    
    /**
     * Check if user is authenticated
     * @returns {boolean} Authentication status
     */
    isAuthenticated: () => {
      let isAuth = false;
      subscribe(user => {
        isAuth = !!user;
      })();
      return isAuth;
    },
    
    /**
     * Get current user data
     * @returns {Object|null} Current user data
     */
    getCurrentUser: () => {
      let currentUser = null;
      subscribe(user => {
        currentUser = user;
      })();
      return currentUser;
    }
  };
}

export const user = createUserStore();

/**
 * Authentication helper functions
 */
export const auth = {
  /**
   * Login with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Login result
   */
  async login(email, password) {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        user.setUser(data.user);
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Connection error' };
    }
  },

  /**
   * Register new user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Registration result
   */
  async register(email, password) {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        user.setUser(data.user);
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.error || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Connection error' };
    }
  },

  /**
   * Logout user
   */
  async logout() {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      user.clear();
    }
  },

  /**
   * Refresh user session
   * @returns {Promise<Object>} Refresh result
   */
  async refreshSession() {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        user.setUser(data.user);
        return { success: true, user: data.user };
      } else {
        user.clear();
        return { success: false, error: data.error || 'Session expired' };
      }
    } catch (error) {
      console.error('Session refresh error:', error);
      user.clear();
      return { success: false, error: 'Connection error' };
    }
  },

  /**
   * Update user profile
   * @param {Object} updates - Profile updates
   * @returns {Promise<Object>} Update result
   */
  async updateProfile(updates) {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (response.ok) {
        user.updateUser(data.user);
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.error || 'Update failed' };
      }
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: 'Connection error' };
    }
  }
};

export default user;
