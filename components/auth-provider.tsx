"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { AuthService } from "@/lib/auth";
import { UserDataManager } from "@/lib/user-data";
import { apiClient } from "@/lib/api-client";

interface User {
    username: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (username: string) => Promise<boolean>;
    register: (username: string) => Promise<boolean>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            setIsLoading(true);

            const token = AuthService.getToken();
            const currentUser = AuthService.getCurrentUser();

            if (!token || !currentUser) {
                setUser(null);
                return;
            }

            // Configurar token en el cliente API
            apiClient.setToken(token);

            // Validar token con el servidor
            const isValidToken = await AuthService.validateToken();

            if (isValidToken) {
                setUser({ username: currentUser });
                // Establecer usuario actual en UserDataManager
                UserDataManager.setCurrentUser(currentUser);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error("Error checking auth status:", error);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (username: string): Promise<boolean> => {
        try {
            setIsLoading(true);

            const response = await AuthService.login(username);

            // Configurar token en el cliente API
            apiClient.setToken(response.token);

            // CORREGIDO: Usar response.user si es string, o response.user.username si es objeto
            const userString =
                typeof response.user === "string"
                    ? response.user
                    : (response.user as { username: string }).username;

            setUser({ username: userString });
            UserDataManager.setCurrentUser(userString);

            return true;
        } catch (error) {
            console.error("Login failed:", error);
            throw error; // Re-lanzar el error para manejo específico
        } finally {
            setIsLoading(false);
        }
    };

    // Define el tipo de la respuesta del registro
    type RegisterResponse = {
        token: string;
        user: string | { username: string }; // puede ser un string o un objeto con username
    };

    const register = async (username: string): Promise<boolean> => {
        try {
            setIsLoading(true);

            // Indicar el tipo de la respuesta
            const response: RegisterResponse = await AuthService.register(username);

            // Configurar token en el cliente API
            apiClient.setToken(response.token);

            // Obtener username correctamente según el tipo
            const userString = typeof response.user === 'string' ? response.user : response.user.username;

            setUser({ username: userString });
            UserDataManager.setCurrentUser(userString);

            return true;
        } catch (error) {
            console.error("Registration failed:", error);
            throw error; // Re-lanzar el error para manejo específico
        } finally {
            setIsLoading(false);
        }
    };


    const logout = () => {
        AuthService.logout();
        apiClient.clearToken();
        UserDataManager.clearCurrentUser();
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}