/**
 * Custom Hook for Equipment Management
 * Handles equipment-related API calls and state management
 */

import { useQuery } from '@tanstack/react-query';
import { apiClient, API_ENDPOINTS, Equipment } from '@/lib/api';

// Query keys for React Query
export const EQUIPMENT_QUERY_KEYS = {
  all: ['equipment'] as const,
  lists: () => [...EQUIPMENT_QUERY_KEYS.all, 'list'] as const,
  list: (filters?: any) => [...EQUIPMENT_QUERY_KEYS.lists(), filters] as const,
  details: () => [...EQUIPMENT_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...EQUIPMENT_QUERY_KEYS.details(), id] as const,
};

interface UseEquipmentFilters {
  type?: string;
  status?: string;
  location?: string;
  skip?: number;
  limit?: number;
}

export function useEquipment(filters?: UseEquipmentFilters) {
  // Fetch equipment
  const {
    data: equipmentData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: EQUIPMENT_QUERY_KEYS.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters?.type) params.append('type', filters.type);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.location) params.append('location', filters.location);
      if (filters?.skip) params.append('skip', filters.skip.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      
      const response = await apiClient.get(`${API_ENDPOINTS.equipment.list}?${params}`);
      return response.data;
    },
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false,
  });

  const equipment = equipmentData?.equipment || [];
  const total = equipmentData?.total || 0;

  return {
    equipment,
    total,
    isLoading,
    error,
    refetch,
  };
}

// Hook for getting equipment statistics
export function useEquipmentStats() {
  const { equipment } = useEquipment();
  
  const stats = {
    totalEquipment: equipment.length,
    operational: equipment.filter(e => e.status === 'operational').length,
    maintenance: equipment.filter(e => e.status === 'maintenance').length,
    critical: equipment.filter(e => e.status === 'critical').length,
    offline: equipment.filter(e => e.status === 'offline').length,
    avgHealthScore: equipment.length > 0 
      ? equipment.reduce((sum, e) => sum + e.health_score, 0) / equipment.length 
      : 0,
    avgUtilization: equipment.length > 0 
      ? equipment.reduce((sum, e) => sum + e.utilization_rate, 0) / equipment.length 
      : 0,
  };

  return stats;
}

// Helper function to get status color
export function getEquipmentStatusColor(status: string) {
  switch (status) {
    case 'operational':
      return 'text-green-600 bg-green-50';
    case 'maintenance':
      return 'text-yellow-600 bg-yellow-50';
    case 'critical':
      return 'text-red-600 bg-red-50';
    case 'offline':
      return 'text-gray-600 bg-gray-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}

// Helper function to get status icon
export function getEquipmentStatusIcon(status: string) {
  switch (status) {
    case 'operational':
      return '✅';
    case 'maintenance':
      return '🔧';
    case 'critical':
      return '⚠️';
    case 'offline':
      return '🔴';
    default:
      return '❓';
  }
}

// Helper function to get health score color
export function getHealthScoreColor(score: number) {
  if (score >= 90) return 'text-green-600';
  if (score >= 75) return 'text-yellow-600';
  if (score >= 50) return 'text-orange-600';
  return 'text-red-600';
}

// Helper function to get utilization color
export function getUtilizationColor(rate: number) {
  if (rate >= 80) return 'text-red-600';
  if (rate >= 60) return 'text-yellow-600';
  return 'text-green-600';
}

// Helper function to format percentage
export function formatPercentage(value: number) {
  return `${value.toFixed(1)}%`;
}

// Helper function to check if maintenance is due soon
export function isMaintenanceDueSoon(nextMaintenance: string, daysThreshold: number = 30) {
  const nextDate = new Date(nextMaintenance);
  const today = new Date();
  const diffTime = nextDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays <= daysThreshold && diffDays >= 0;
}

// Helper function to check if maintenance is overdue
export function isMaintenanceOverdue(nextMaintenance: string) {
  const nextDate = new Date(nextMaintenance);
  const today = new Date();
  return nextDate < today;
}