import { apiClient } from './api-client';

export class AuthService {
    static async register(username: string): Promise<{ user: string; token: string }> {
        try {
            const response = await apiClient.register(username);

            // Guardar solo token y usuario actual
            if (typeof window !== 'undefined') {
                localStorage.setItem('authToken', response.token);
                localStorage.setItem('currentUser', response.user.username);
            }

            return response;
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    }

    static async login(username: string): Promise<{ user: string; token: string }> {
        try {
            const response = await apiClient.login(username);

            // Guardar solo token y usuario actual
            if (typeof window !== 'undefined') {
                localStorage.setItem('authToken', response.token);
                localStorage.setItem('currentUser', response.user.username);
            }

            return response;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    }

    static logout(): void {
        if (typeof window !== 'undefined') {
            // Limpiar solo datos de autenticación
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
        }

        // Recargar para limpiar el estado
        if (typeof window !== 'undefined') {
            window.location.href = '/';
        }
    }

    static getCurrentUser(): string | null {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('currentUser');
    }

    static getToken(): string | null {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('authToken');
    }

    static isAuthenticated(): boolean {
        return !!this.getToken() && !!this.getCurrentUser();
    }

    static async validateToken(): Promise<boolean> {
        const token = this.getToken();
        if (!token) return false;

        try {
            // Intentar una solicitud simple para validar el token
            await apiClient.getItems();
            return true;
        } catch (error) {
            // Token inválido, limpiar
            this.logout();
            return false;
        }
    }
}