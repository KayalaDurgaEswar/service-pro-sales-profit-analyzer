import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://localhost:5001/api',
    withCredentials: true, // Send cookies with requests
});

// Response interceptor to handle 401s (optional auto-logout)
instance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            // Optional: Dispatch logout action or redirect
            // window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);

export default instance;
