import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import api from '../services/api';
import { useToast } from './useToast';
import { getErrorMessage } from '../utils/errors';
import type { Product } from '../types';

export const useProductsLoader = (endpoint: string, fallbackMessage: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchProducts = useCallback(
    async (signal?: AbortSignal) => {
      try {
        setLoading(true);
        const response = await api.get<Product[]>(endpoint, { signal });
        setProducts(response.data);
      } catch (error) {
        if (axios.isAxiosError(error) && error.code === 'ERR_CANCELED') {
          return;
        }
        setProducts([]);
        showToast(getErrorMessage(error, fallbackMessage), 'error');
      } finally {
        setLoading(false);
      }
    },
    [endpoint, fallbackMessage, showToast],
  );

  useEffect(() => {
    const controller = new AbortController();
    
    void fetchProducts(controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchProducts]);

  return { products, loading, refetch: fetchProducts };
};
