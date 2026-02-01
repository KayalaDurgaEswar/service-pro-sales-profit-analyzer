import { createContext, useState, useEffect, useContext } from 'react';
import axios from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [selectedBusiness, setSelectedBusiness] = useState(null);

    useEffect(() => {
        const checkUserLoggedIn = async () => {
            try {
                const { data } = await axios.get('/auth/me');
                if (data.success) {
                    setUser(data.data);
                }
            } catch (error) {
                // Not logged in
                setUser(null);
            }
        };

        checkUserLoggedIn();

        const storedBusiness = JSON.parse(localStorage.getItem('selectedBusiness'));
        if (storedBusiness) {
            setSelectedBusiness(storedBusiness);
        }
    }, []);

    const login = async (formData) => {
        const { data } = await axios.post('/auth/login', formData);
        // localStorage.setItem('user', JSON.stringify(data)); // No longer storing user/token in LS
        setUser(data); // data contains { _id, name, email } but no token
        return data;
    };

    const register = async (formData) => {
        const { data } = await axios.post('/auth/register', formData);
        // localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
        return data;
    };

    const logout = async () => {
        try {
            await axios.get('/auth/logout');
        } catch (error) {
            console.error('Logout failed', error);
        }
        localStorage.removeItem('user'); // Clean up just in case
        localStorage.removeItem('selectedBusiness');
        setUser(null);
        setSelectedBusiness(null);
    };

    const selectBusiness = (business) => {
        localStorage.setItem('selectedBusiness', JSON.stringify(business));
        setSelectedBusiness(business);
    };

    return (
        <AuthContext.Provider value={{ user, selectedBusiness, setSelectedBusiness: selectBusiness, login, register, logout, selectBusiness }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
