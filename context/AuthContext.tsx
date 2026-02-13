"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";

interface User {
    id: number;
    username: string;
    email: string;
    role?: {
        type: string; // 'authenticated' vs
    };
    company_profile?: {
        type: "customer" | "supplier";
        company_name: string;
    };
}

interface AuthContextType {
    user: User | null;
    login: (token: string, userData: User) => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    login: () => { },
    logout: () => { },
    isLoading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callback");

    useEffect(() => {
        // Sayfa yenilendiğinde LocalStorage'dan oturumu kurtar
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (token && storedUser) {
            setUser(JSON.parse(storedUser));
            api.defaults.headers.Authorization = `Bearer ${token}`;
        }
        setIsLoading(false);
    }, []);

    const login = (token: string, userData: User) => {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        api.defaults.headers.Authorization = `Bearer ${token}`;
        setUser(userData);
        setTimeout(() => {
            if (userData?.company_profile?.type === 'supplier') {
                const destination = callbackUrl ? decodeURIComponent(callbackUrl) : "/supplier/dashboard";
                router.push(destination);
            } else {
                //router.push("/dashboard");
                const destination = callbackUrl ? decodeURIComponent(callbackUrl) : "/dashboard";
                router.push(destination);
            }
        }, 500);
        const destination = callbackUrl ? decodeURIComponent(callbackUrl) : "/";
        router.push(destination);
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        delete api.defaults.headers.Authorization;
        router.push("/auth/login");
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);