import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import ProductCard from '../features/products/ProductCard';
import type { Product } from '../types';
import { AuthContext, type AuthContextType } from '../context/auth';
import { ToastProvider } from '../context/ToastContext';

const mockProduct: Product = {
  id: 1,
  title: "PS5 Slim God of War",
  description: "En perfecto estado",
  price: 450,
  category: "videogames",
  condition: "LIKE_NEW",
  username: "juanpro",
  createdAt: "2026-04-01",
};

describe('ProductCard', () => {
  it('muestra el título y precio correctamente', () => {
    const authValue: AuthContextType = {
      user: null,
      token: null,
      login: vi.fn(),
      logout: vi.fn(),
      isAuthenticated: false,
    };

    render(
      <AuthContext.Provider value={authValue}>
        <ToastProvider>
          <BrowserRouter>
            <ProductCard product={mockProduct} />
          </BrowserRouter>
        </ToastProvider>
      </AuthContext.Provider>
    );

    expect(screen.getByText('PS5 Slim God of War')).toBeTruthy();
    expect(screen.getByText('450.00 €')).toBeTruthy();
  });
});