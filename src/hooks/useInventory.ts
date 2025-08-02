/**
 * Custom Hook for Inventory Management
 * Handles all inventory-related API calls and state management
 */

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, API_ENDPOINTS, InventoryItem, InventoryItemsResponse } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

// Query keys for React Query
export const INVENTORY_QUERY_KEYS = {
  all: ['inventory'] as const,
  lists: () => [...INVENTORY_QUERY_KEYS.all, 'list'] as const,
  list: (filters?: any) => [...INVENTORY_QUERY_KEYS.lists(), filters] as const,
  details: () => [...INVENTORY_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...INVENTORY_QUERY_KEYS.details(), id] as const,
  transactions: (id: string) => [...INVENTORY_QUERY_KEYS.all, 'transactions', id] as const,
};

interface UseInventoryFilters {
  category?: string;
  status?: string;
  search?: string;
  skip?: number;
  limit?: number;
}

export function useInventory(filters?: UseInventoryFilters) {
  const { toast } = useToast();
  
  // Fetch inventory items
  const {
    data: inventoryData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: INVENTORY_QUERY_KEYS.list(filters),
    queryFn: async (): Promise<InventoryItemsResponse> => {
      const params = new URLSearchParams();
      
      if (filters?.category) params.append('category', filters.category);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.skip) params.append('skip', filters.skip.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      
      const response = await apiClient.get(`${API_ENDPOINTS.inventory.list}?${params}`);
      return response.data;
    },
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
  });

  const items = inventoryData?.items || [];
  const total = inventoryData?.total || 0;

  return {
    items,
    total,
    isLoading,
    error,
    refetch,
  };
}

export function useInventoryMutations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Add stock mutation (your priority feature)
  const addStockMutation = useMutation({
    mutationFn: async ({ itemId, quantity, referenceType, notes }: {
      itemId: string;
      quantity: number;
      referenceType?: string;
      notes?: string;
    }) => {
      const params = new URLSearchParams({
        quantity: quantity.toString(),
      });
      
      if (referenceType) params.append('reference_type', referenceType);
      if (notes) params.append('notes', notes);
      
      const response = await apiClient.post(`${API_ENDPOINTS.inventory.addStock(itemId)}?${params}`);
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch inventory lists
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEYS.lists() });
      
      toast({
        title: "Stock Added Successfully",
        description: `Added ${variables.quantity} units to inventory. New quantity: ${data.quantity}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Add Stock",
        description: error.response?.data?.detail || "An error occurred while adding stock",
        variant: "destructive",
      });
    },
  });

  // Subtract stock mutation (your priority feature)
  const subtractStockMutation = useMutation({
    mutationFn: async ({ itemId, quantity, referenceType, notes, allowNegative = false }: {
      itemId: string;
      quantity: number;
      referenceType?: string;
      notes?: string;
      allowNegative?: boolean;
    }) => {
      const params = new URLSearchParams({
        quantity: quantity.toString(),
        allow_negative: allowNegative.toString(),
      });
      
      if (referenceType) params.append('reference_type', referenceType);
      if (notes) params.append('notes', notes);
      
      const response = await apiClient.post(`${API_ENDPOINTS.inventory.subtractStock(itemId)}?${params}`);
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch inventory lists
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEYS.lists() });
      
      toast({
        title: "Stock Updated Successfully",
        description: `Subtracted ${variables.quantity} units from inventory. New quantity: ${data.quantity}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Subtract Stock",
        description: error.response?.data?.detail || "An error occurred while subtracting stock",
        variant: "destructive",
      });
    },
  });

  // Create item mutation
  const createItemMutation = useMutation({
    mutationFn: async (itemData: Partial<InventoryItem>) => {
      const response = await apiClient.post(API_ENDPOINTS.inventory.create, itemData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEYS.lists() });
      toast({
        title: "Item Created",
        description: "New inventory item has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Create Item",
        description: error.response?.data?.detail || "An error occurred while creating the item",
        variant: "destructive",
      });
    },
  });

  // Update item mutation
  const updateItemMutation = useMutation({
    mutationFn: async ({ id, ...itemData }: Partial<InventoryItem> & { id: string }) => {
      const response = await apiClient.put(API_ENDPOINTS.inventory.update(id), itemData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEYS.lists() });
      toast({
        title: "Item Updated",
        description: "Inventory item has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Update Item",
        description: error.response?.data?.detail || "An error occurred while updating the item",
        variant: "destructive",
      });
    },
  });

  // Delete item mutation
  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const response = await apiClient.delete(API_ENDPOINTS.inventory.delete(itemId));
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEYS.lists() });
      toast({
        title: "Item Deleted",
        description: "Inventory item has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Delete Item",
        description: error.response?.data?.detail || "An error occurred while deleting the item",
        variant: "destructive",
      });
    },
  });

  return {
    addStock: addStockMutation.mutate,
    subtractStock: subtractStockMutation.mutate,
    createItem: createItemMutation.mutate,
    updateItem: updateItemMutation.mutate,
    deleteItem: deleteItemMutation.mutate,
    
    // Loading states
    isAddingStock: addStockMutation.isPending,
    isSubtractingStock: subtractStockMutation.isPending,
    isCreatingItem: createItemMutation.isPending,
    isUpdatingItem: updateItemMutation.isPending,
    isDeletingItem: deleteItemMutation.isPending,
  };
}

// Hook for getting categories and stats
export function useInventoryStats() {
  const { data, isLoading } = useQuery({
    queryKey: ['inventory-stats'],
    queryFn: async () => {
      const response = await apiClient.get(API_ENDPOINTS.inventory.overview);
      return response.data;
    },
    staleTime: 60000, // 1 minute
  });

  return {
    stats: data?.stats,
    categories: data?.categories || [],
    isLoading,
  };
}

// Helper function to get status color
export function getStatusColor(status: string) {
  switch (status) {
    case 'in_stock':
      return 'text-green-600 bg-green-50';
    case 'low_stock':
      return 'text-yellow-600 bg-yellow-50';
    case 'out_of_stock':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}

// Helper function to get status icon
export function getStatusIcon(status: string) {
  switch (status) {
    case 'in_stock':
      return '✅';
    case 'low_stock':
      return '⚠️';
    case 'out_of_stock':
      return '❌';
    default:
      return '❓';
  }
}