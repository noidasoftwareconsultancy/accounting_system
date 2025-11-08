import { useState, useEffect, useCallback } from 'react';

const useAdvancedFilters = (initialFilters = {}) => {
  const [filters, setFilters] = useState(() => {
    // Try to load from localStorage
    const saved = localStorage.getItem('inventoryFilters');
    return saved ? JSON.parse(saved) : initialFilters;
  });

  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  // Debounce filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 300);

    return () => clearTimeout(timer);
  }, [filters]);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('inventoryFilters', JSON.stringify(filters));
  }, [filters]);

  const updateFilter = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const buildQueryParams = useCallback(() => {
    const params = {};
    Object.keys(debouncedFilters).forEach(key => {
      const value = debouncedFilters[key];
      if (value !== null && value !== undefined && value !== '') {
        if (value instanceof Date) {
          params[key] = value.toISOString().split('T')[0];
        } else {
          params[key] = value;
        }
      }
    });
    return params;
  }, [debouncedFilters]);

  return {
    filters,
    debouncedFilters,
    updateFilter,
    clearFilters,
    buildQueryParams
  };
};

export default useAdvancedFilters;
