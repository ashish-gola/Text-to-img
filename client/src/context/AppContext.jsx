import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";

const AppContext = createContext();

export { AppContext };

const AppContextProvider = ( props ) => {
    const [user, setUser] = useState(null);
    const [showLogin, setShowLogin] = useState(false);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [credit, setCredit] = useState(0);
    const [loading, setLoading] = useState(false);

    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

    // Configure axios defaults
    axios.defaults.baseURL = backendUrl;

    // Set up axios interceptors for automatic token handling
    useEffect(() => {
        const requestInterceptor = axios.interceptors.request.use(
            (config) => {
                if (token) {
                    config.headers.token = token;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        const responseInterceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    // Token expired or invalid
                    logout();
                    toast.error("Session expired. Please login again.");
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.request.eject(requestInterceptor);
            axios.interceptors.response.eject(responseInterceptor);
        };
    }, [token]);

    const loadCreditsData = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('/api/user/credits');
            
            if (data.success) {
                setCredit(data.creditBalance);
                setUser(data.user);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error("Error loading credits:", error);
            const errorMessage = error.response?.data?.message || "Failed to load credits";
            toast.error(errorMessage);
            
            // If unauthorized, logout
            if (error.response?.status === 401) {
                logout();
            }
        } finally {
            setLoading(false);
        }
    }

    const getUserProfile = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('/api/user/profile');
            
            if (data.success) {
                setUser(data.user);
                setCredit(data.user.creditBalance);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error("Error loading profile:", error);
            const errorMessage = error.response?.data?.message || "Failed to load profile";
            toast.error(errorMessage);
            
            if (error.response?.status === 401) {
                logout();
            }
        } finally {
            setLoading(false);
        }
    }

    const login = async (email, password) => {
        try {
            setLoading(true);
            const { data } = await axios.post('/api/user/login', { 
                email: email.trim(), 
                password 
            });

            if (data.success) {
                setToken(data.token);
                setUser(data.user);
                setCredit(data.user.creditBalance);
                localStorage.setItem('token', data.token);
                toast.success(data.message || "Login successful!");
                setShowLogin(false);
                return { success: true };
            } else {
                toast.error(data.message);
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error("Login error:", error);
            const errorMessage = error.response?.data?.message || "Login failed";
            toast.error(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    }

    const register = async (name, email, password) => {
        try {
            setLoading(true);
            const { data } = await axios.post('/api/user/register', { 
                name: name.trim(), 
                email: email.trim(), 
                password 
            });

            if (data.success) {
                setToken(data.token);
                setUser(data.user);
                setCredit(data.user.creditBalance);
                localStorage.setItem('token', data.token);
                toast.success(data.message || "Registration successful!");
                setShowLogin(false);
                return { success: true };
            } else {
                toast.error(data.message);
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error("Registration error:", error);
            const errorMessage = error.response?.data?.message || "Registration failed";
            toast.error(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    }

    const logout = () => {
        localStorage.removeItem('token');
        setToken('');
        setUser(null);
        setCredit(0);
        toast.info("Logged out successfully");
    }

    const updateCredits = (newCredits) => {
        setCredit(newCredits);
        if (user) {
            setUser(prev => ({ ...prev, creditBalance: newCredits }));
        }
    }

    // Load user data when token exists
    useEffect(() => {
        if (token) {
            getUserProfile();
        }
    }, [token]);

    const value = {
        user, 
        setUser, 
        showLogin, 
        setShowLogin,
        backendUrl, 
        token, 
        setToken, 
        credit, 
        setCredit,
        loading,
        loadCreditsData, 
        getUserProfile,
        login,
        register,
        logout,
        updateCredits
    };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};

export default AppContextProvider;