import { useState, useEffect, useRef, useCallback } from 'react';

interface UseLiveDataOptions {
    refreshInterval?: number;
    autoRefresh?: boolean;
    pauseOnInteraction?: boolean;
}

export function useLiveData<T>(
    fetchFunction: () => Promise<T>,
    initialData: T,
    options: UseLiveDataOptions = {}
) {
    const {
        refreshInterval = 10000, // Aumentado a 10 segundos
        autoRefresh = true,
        pauseOnInteraction = true
    } = options;

    const [data, setData] = useState<T>(initialData);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isPaused, setIsPaused] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const fetchFunctionRef = useRef(fetchFunction);
    const lastInteractionRef = useRef<number>(0);
    const isInitialLoadRef = useRef(true);

    // Actualizar la referencia de la función de fetch
    useEffect(() => {
        fetchFunctionRef.current = fetchFunction;
    }, [fetchFunction]);

    // Función para refrescar datos manualmente
    const refresh = useCallback(async (showLoading = false) => {
        // Solo mostrar loading en refresh manual o carga inicial
        if (showLoading || isInitialLoadRef.current) {
            setIsLoading(true);
        }
        setError(null);

        try {
            const newData = await fetchFunctionRef.current();
            setData(newData);
            isInitialLoadRef.current = false;
        } catch (err) {
            console.error('Error refreshing data:', err);
            setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
            if (showLoading || isInitialLoadRef.current) {
                setIsLoading(false);
            }
        }
    }, []);

    // Función para pausar auto-refresh
    const pauseAutoRefresh = useCallback(() => {
        setIsPaused(true);
        lastInteractionRef.current = Date.now();

        // Reanudar automáticamente después de 15 segundos de inactividad
        setTimeout(() => {
            if (Date.now() - lastInteractionRef.current >= 15000) {
                setIsPaused(false);
            }
        }, 15000);
    }, []);

    const resumeAutoRefresh = useCallback(() => {
        setIsPaused(false);
    }, []);

    // Inicializar datos
    useEffect(() => {
        refresh(true); // Mostrar loading solo en la carga inicial
    }, []);

    // Configurar auto-refresh más discreto
    useEffect(() => {
        if (!autoRefresh || isPaused) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            return;
        }

        intervalRef.current = setInterval(async () => {
            // Solo refrescar si no ha habido interacción reciente
            const timeSinceInteraction = Date.now() - lastInteractionRef.current;
            if (timeSinceInteraction > 10000) { // 10 segundos desde la última interacción
                try {
                    // Refresh silencioso - sin mostrar loading
                    const newData = await fetchFunctionRef.current();
                    setData(newData);
                } catch (err) {
                    console.error('Silent refresh failed:', err);
                }
            }
        }, refreshInterval);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [autoRefresh, refreshInterval, isPaused]);

    // Detectar interacción del usuario de forma más eficiente
    useEffect(() => {
        if (!pauseOnInteraction) return;

        const handleUserInteraction = () => {
            lastInteractionRef.current = Date.now();
            if (!isPaused) {
                pauseAutoRefresh();
            }
        };

        // Solo escuchar eventos clave
        const events = ['focus', 'click'];

        events.forEach(event => {
            document.addEventListener(event, handleUserInteraction, { passive: true });
        });

        return () => {
            events.forEach(event => {
                document.removeEventListener(event, handleUserInteraction);
            });
        };
    }, [pauseOnInteraction, isPaused, pauseAutoRefresh]);

    // Limpiar intervalo al desmontar
    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    return {
        data,
        isLoading,
        error,
        refresh: () => refresh(true), // Refresh manual siempre muestra loading
        pauseAutoRefresh,
        resumeAutoRefresh,
        isPaused
    };
}