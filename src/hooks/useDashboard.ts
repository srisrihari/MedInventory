import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface DashboardStats {
  totalInventory: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  expiringCount: number;
  totalSuppliers: number;
  activeBids: number;
  equipmentCount: number;
  maintenanceDue: number;
  percentageChange: number;
}

export interface DashboardData {
  stats: DashboardStats;
  isLoading: boolean;
  error: Error | null;
}

export function useDashboard(): DashboardData {
  // Fetch inventory statistics
  const { data: inventoryData, isLoading: inventoryLoading, error: inventoryError } = useQuery({
    queryKey: ['inventory-stats'],
    queryFn: async () => {
      const response = await api.get('/api/inventory/items?limit=100');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch supplier statistics
  const { data: supplierData, isLoading: supplierLoading, error: supplierError } = useQuery({
    queryKey: ['supplier-stats'],
    queryFn: async () => {
      const response = await api.get('/api/bidding/suppliers?active_only=true');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch bidding statistics
  const { data: biddingData, isLoading: biddingLoading, error: biddingError } = useQuery({
    queryKey: ['bidding-stats'],
    queryFn: async () => {
      const response = await api.get('/api/bidding/requests');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch equipment statistics
  const { data: equipmentData, isLoading: equipmentLoading, error: equipmentError } = useQuery({
    queryKey: ['equipment-stats'],
    queryFn: async () => {
      const response = await api.get('/api/equipment/');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Calculate statistics from the fetched data
  const calculateStats = (): DashboardStats => {
    // Handle different response structures
    const inventory = inventoryData?.items || inventoryData?.data || [];
    const suppliers = supplierData?.suppliers || supplierData?.data || [];
    const bids = biddingData?.requests || biddingData?.data || [];
    const equipment = equipmentData?.equipment || equipmentData?.data || [];

    // Calculate inventory statistics
    const totalInventory = inventory.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
    const totalValue = inventory.reduce((sum: number, item: any) => sum + ((item.price || 0) * (item.quantity || 0)), 0);
    const lowStockCount = inventory.filter((item: any) => item.status === 'low_stock').length;
    const outOfStockCount = inventory.filter((item: any) => item.status === 'out_of_stock').length;
    
    // Calculate expiring items (within 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const expiringCount = inventory.filter((item: any) => {
      if (!item.expiry_date) return false;
      const expiryDate = new Date(item.expiry_date);
      return expiryDate <= thirtyDaysFromNow && expiryDate > new Date();
    }).length;

    // Calculate other statistics
    const totalSuppliers = suppliers.length;
    const activeBids = bids.filter((bid: any) => bid.status === 'active').length;
    const equipmentCount = equipment.length;
    const maintenanceDue = equipment.filter((item: any) => {
      if (!item.next_maintenance) return false;
      const maintenanceDate = new Date(item.next_maintenance);
      return maintenanceDate <= thirtyDaysFromNow;
    }).length;

    // Calculate percentage change (mock for now, could be enhanced with historical data)
    const percentageChange = 7.2; // This could be calculated from historical data

    return {
      totalInventory,
      totalValue,
      lowStockCount,
      outOfStockCount,
      expiringCount,
      totalSuppliers,
      activeBids,
      equipmentCount,
      maintenanceDue,
      percentageChange,
    };
  };

  const isLoading = inventoryLoading || supplierLoading || biddingLoading || equipmentLoading;
  const error = inventoryError || supplierError || biddingError || equipmentError;

  return {
    stats: calculateStats(),
    isLoading,
    error,
  };
}

// Hook for top in-demand items
export function useTopInDemand() {
  return useQuery({
    queryKey: ['top-in-demand'],
    queryFn: async () => {
      try {
        // Try to get AI forecast data first
        const forecastResponse = await api.get('/api/ai/forecast/demand?forecast_period=30d');
        const forecastData = forecastResponse.data;
        
        if (forecastData?.forecasts && forecastData.forecasts.length > 0) {
          // Use AI forecast data
          return forecastData.forecasts
            .sort((a: any, b: any) => (b.predicted_demand || 0) - (a.predicted_demand || 0))
            .slice(0, 5)
            .map((forecast: any) => ({
              name: forecast.item_name,
              category: forecast.item_category,
              quantity: forecast.predicted_demand || 0,
              current_stock: forecast.current_stock || 0,
              status: forecast.risk_level,
              recommendation: forecast.recommendation,
              confidence: forecast.confidence_score,
              isAI: true
            }));
        }
      } catch (error) {
        console.warn('AI forecast not available, falling back to inventory data');
      }
      
      // Fallback to inventory data
      const response = await api.get('/api/inventory/items?limit=10');
      const items = response.data?.items || response.data?.data || [];
      
      // Sort by quantity (lower quantity = higher demand)
      return items
        .sort((a: any, b: any) => (a.quantity || 0) - (b.quantity || 0))
        .slice(0, 5)
        .map((item: any) => ({
          name: item.name,
          category: item.category,
          quantity: item.quantity || 0,
          current_stock: item.quantity || 0,
          status: item.status,
          recommendation: item.quantity < 100 ? 'Low stock - reorder needed' : 'Stock adequate',
          confidence: 75, // Default confidence for inventory-based data
          isAI: false
        }));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for expiring items
export function useExpiringItems(threshold: number = 10) {
  return useQuery({
    queryKey: ['expiring-items', threshold],
    queryFn: async () => {
      const response = await api.get('/api/inventory/items?limit=100');
      const items = response.data?.items || response.data?.data || [];
      
      const thresholdDate = new Date();
      thresholdDate.setDate(thresholdDate.getDate() + threshold);
      
      return items
        .filter((item: any) => {
          if (!item.expiry_date) return false;
          const expiryDate = new Date(item.expiry_date);
          return expiryDate <= thresholdDate && expiryDate > new Date();
        })
        .sort((a: any, b: any) => new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime())
        .slice(0, 10)
        .map((item: any) => ({
          name: item.name,
          category: item.category,
          quantity: item.quantity || 0,
          expiry_date: item.expiry_date,
          daysUntilExpiry: Math.ceil((new Date(item.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
        }));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for delivery status
export function useDeliveryStatus() {
  return useQuery({
    queryKey: ['delivery-status'],
    queryFn: async () => {
      // Mock delivery status data for now
      // This could be enhanced with real delivery tracking data
      return {
        pending: 12,
        inTransit: 8,
        delivered: 45,
        delayed: 3,
        total: 68,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
} 