import { toast } from '@/components/ui/use-toast';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiClient {
    private token: string | null = null;

    setToken(token: string) {
        this.token = token;
        if (typeof window !== 'undefined') {
            localStorage.setItem('authToken', token);
        }
    }

    getToken(): string | null {
        if (!this.token && typeof window !== 'undefined') {
            this.token = localStorage.getItem('authToken');
        }
        return this.token;
    }

    clearToken() {
        this.token = null;
        if (typeof window !== 'undefined') {
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            localStorage.removeItem('clockAppUser');
        }
    }

    private async request(endpoint: string, options: RequestInit = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const token = this.getToken();

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string>),
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            console.log(`API Request: ${options.method || 'GET'} ${url}`, options.body ? JSON.parse(options.body as string) : null);
            console.log('Headers:', headers); // ← log agregado

            const response = await fetch(url, {
                ...options,
                headers,
            });

            console.log('API Response Status:', response.status); // ← log agregado

            if (!response.ok) {
                // Obtener más información del error
                let errorDetails = '';
                try {
                    const errorData = await response.json();
                    errorDetails = errorData.message || errorData.error || `Status: ${response.status}`;
                } catch {
                    errorDetails = `HTTP ${response.status}: ${response.statusText}`;
                }

                console.error('API Error Details:', errorDetails);

                if (response.status === 401) {
                    this.clearToken();
                    window.location.reload();
                    return;
                }

                throw new Error(errorDetails);
            }

            const data = await response.json();
            console.log('API Response:', data);
            return data;

        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Auth methods
    async register(username: string) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username }),
        });
    }

    async login(username: string) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username }),
        });
    }

    // Items methods
    async getItems(kind?: string) {
        const endpoint = kind ? `/api/items?kind=${kind}` : '/api/items';
        return this.request(endpoint);
    }

    async createItem(kind: string, data: any) {
        return this.request('/api/items', {
            method: 'POST',
            body: JSON.stringify({ kind, data }),
        });
    }

    async updateItem(id: number, data: any) {
        return this.request(`/api/items/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ data }),
        });
    }

    async deleteItem(id: number) {
        return this.request(`/api/items/${id}`, {
            method: 'DELETE',
        });
    }

    async syncChanges(since: string) {
        return this.request(`/api/items/sync/changes?since=${since}`);
    }
}

export const apiClient = new ApiClient();
