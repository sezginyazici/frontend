// src/lib/api.ts
import axios from 'axios';

export const getStrapiURL = (path = "") => {
    return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:1337"}${path}`;
};

export const getMediaURL = (url: string) => {
    if (!url) return null;
    if (url.startsWith("http") || url.startsWith("//")) return url;
    return `${process.env.NEXT_PUBLIC_STRAPI_MEDIA_URL || "http://localhost:1337"}${url}`;
};

const api = axios.create({
    baseURL: getStrapiURL("/api"),
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    // Sunucu tarafında mı yoksa tarayıcıda mı olduğumuzu kontrol ediyoruz
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        // window kontrolü burada da önemli çünkü sunucu tarafında redirect yapılamaz
        if (error.response?.status === 401 && typeof window !== 'undefined') {
            localStorage.removeItem('token');
            window.location.href = '/auth/login';
        }
        return Promise.reject(error);
    }
);

export default api;




