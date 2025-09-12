import { useState, useCallback } from 'react';

export function useDataRefresh() {
    const [refreshKey, setRefreshKey] = useState(0);

    const refresh = useCallback(() => {
        setRefreshKey(prev => prev + 1);
    }, []);

    return {
        refreshKey,
        refresh
    };
}