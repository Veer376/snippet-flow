import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null); // Load token from localStorage

  useEffect(() => {
    // Load user data from localStorage on initial load
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
        // Handle the error appropriately, e.g., clear the invalid data
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
      }
    }
  }, []);

  // Save token to localStorage whenever it changes
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  // Save user to localStorage whenever it changes
    useEffect(() => {
        if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        } else {
        localStorage.removeItem('user');
        }
    }, [user]);

  const login = async (username, password) => {
    try {
      const response = await fetch('/auth/login', { // Replace with your actual login endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded', // Or 'application/json' if your API expects JSON
        },
        body: new URLSearchParams({
          username: username,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setToken(data.access_token);
        // Fetch user data after login
        const userResponse = await fetch('/auth/me', { // Replace with your actual get user endpoint
          headers: {
            'Authorization': `Bearer ${data.access_token}`,
          },
        });
        const userData = await userResponse.json();
        setUser(userData);
        return true; // Indicate successful login
      } else {
        console.error('Login failed:', data.detail);
        return false; // Indicate failed login
      }
    } catch (error) {
      console.error('Login error:', error);
      return false; // Indicate failed login
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await fetch('/auth/register', { // Replace with your actual register endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          email: email,
          hashed_password: password, // Make sure to hash the password on the backend
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Optionally, log the user in immediately after registration
        // For simplicity, we'll just return true for now
        return true;
      } else {
        console.error('Registration failed:', data.detail);
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};