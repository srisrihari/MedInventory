/**
 * Custom Hook for Supplier Management
 * Handles supplier-related API calls and state management
 */

import { useQuery } from '@tanstack/react-query';
import { apiClient, API_ENDPOINTS, Supplier } from '@/lib/api';

// Query keys for React Query
export const SUPPLIER_QUERY_KEYS = {
  all: ['suppliers'] as const,
  lists: () => [...SUPPLIER_QUERY_KEYS.all, 'list'] as const,
  list: (filters?: any) => [...SUPPLIER_QUERY_KEYS.lists(), filters] as const,
};

interface UseSuppliersFilters {
  active_only?: boolean;
}

export function useSuppliers(filters?: UseSuppliersFilters) {
  // Fetch suppliers
  const {
    data: suppliersData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: SUPPLIER_QUERY_KEYS.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters?.active_only !== undefined) {
        params.append('active_only', filters.active_only.toString());
      }
      
      const response = await apiClient.get(`${API_ENDPOINTS.bidding.suppliers}?${params}`);
      return response.data;
    },
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false,
  });

  const suppliers = suppliersData?.suppliers || [];
  const total = suppliersData?.total || suppliers.length;

  return {
    suppliers,
    total,
    isLoading,
    error,
    refetch,
  };
}

// Helper function to get rating stars
export function getRatingStars(rating: number) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  return {
    full: fullStars,
    half: hasHalfStar,
    empty: emptyStars,
    display: '⭐'.repeat(fullStars) + (hasHalfStar ? '⭐' : '') + '☆'.repeat(emptyStars)
  };
}

// Helper function to get performance color
export function getPerformanceColor(performance: string) {
  switch (performance.toLowerCase()) {
    case 'excellent':
      return 'text-green-600 bg-green-50';
    case 'good':
      return 'text-blue-600 bg-blue-50';
    case 'average':
      return 'text-yellow-600 bg-yellow-50';
    case 'poor':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}

// Helper function to get price competitiveness color
export function getPriceCompetitivenessColor(competitiveness: string) {
  switch (competitiveness.toLowerCase()) {
    case 'high':
      return 'text-green-600 bg-green-50'; // High competitiveness is good
    case 'medium':
      return 'text-blue-600 bg-blue-50';
    case 'low':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}