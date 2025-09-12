// hooks/use-auto-refresh.ts
import { useEffect, useCallback, useRef } from 'react';

export function useAutoRefresh(callback: () => Promise<void>, intervalMs: number = 30000) {
    const callbackRef = useRef(callback);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Actualizar la referencia del callback
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    const startPolling = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        intervalRef.current = setInterval(async () => {
            try {
                await callbackRef.current();
            } catch (error) {
                console.error('Error in auto-refresh:', error);
            }
        }, intervalMs);
    }, [intervalMs]);

    const stopPolling = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    useEffect(() => {
        startPolling();
        return stopPolling;
    }, [startPolling, stopPolling]);

    return { startPolling, stopPolling };
}