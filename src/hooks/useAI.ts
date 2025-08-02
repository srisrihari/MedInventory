import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

// Enhanced types for comprehensive forecast data
export interface AIForecastItem {
  item_name: string;
  item_category: string;
  current_stock: number;
  predicted_demand: number;
  confidence_score: number;
  risk_level: 'low' | 'medium' | 'high';
  recommendation: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  difference: number;
}

export interface AIInsight {
  type: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  action_required: boolean;
  action_description?: string;
}

export interface ChartData {
  demand_overview: Array<{
    name: string;
    forecast: number;
    actual: number;
  }>;
  accuracy_trend: Array<{
    month: string;
    accuracy: number;
  }>;
  seasonal_pattern: Array<{
    month: string;
    demand: number;
  }>;
}

export interface StockAlerts {
  critical_items: number;
  high_risk_items: number;
  total_alerts: number;
  immediate_actions: string[];
}

export interface DemandForecastResponse {
  forecast_id?: string;
  forecast_date: string;
  forecast_period: string;
  category_filter?: string;
  overall_accuracy: number;
  total_items_forecasted: number;
  ai_model_version: string;
  created_at: string;
  forecasts: AIForecastItem[];
  insights: AIInsight[];
  chart_data: ChartData;
  stock_alerts: StockAlerts;
}

export interface AIHealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  ai_service: 'operational' | 'unavailable' | 'error';
  model: string;
  message: string;
}

export interface ForecastHistoryItem {
  id: string;
  forecast_date: string;
  forecast_period: string;
  overall_accuracy: number;
  total_items_forecasted: number;
  items_count: number;
  insights_count: number;
  created_at: string;
}

// Hook for AI demand forecasting with parameters
export const useAIDemandForecast = (
  forecastPeriod: string = '30d',
  categoryFilter?: string,
  forceRegenerate: boolean = false
) => {
  return useQuery({
    queryKey: ['ai-demand-forecast', forecastPeriod, categoryFilter, forceRegenerate],
    queryFn: async (): Promise<DemandForecastResponse> => {
      const params = new URLSearchParams({
        forecast_period: forecastPeriod,
        force_regenerate: forceRegenerate.toString(),
      });
      
      if (categoryFilter && categoryFilter !== 'All Categories') {
        params.append('category_filter', categoryFilter);
      }
      
      const response = await api.get(`/api/ai/forecast/demand?${params.toString()}`);
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    enabled: !forceRegenerate, // Disable automatic refetch when forcing regeneration
  });
};

// Hook for forcing forecast regeneration
export const useRegenerateForecast = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      forecastPeriod, 
      categoryFilter 
    }: { 
      forecastPeriod: string; 
      categoryFilter?: string; 
    }) => {
      const params = new URLSearchParams({
        forecast_period: forecastPeriod,
      });
      
      if (categoryFilter && categoryFilter !== 'All Categories') {
        params.append('category_filter', categoryFilter);
      }
      
      const response = await api.post(`/api/ai/forecast/regenerate?${params.toString()}`);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch forecast data
      queryClient.invalidateQueries({ queryKey: ['ai-demand-forecast'] });
    },
  });
};

// Hook for forecast history
export const useForecastHistory = (days: number = 30) => {
  return useQuery({
    queryKey: ['forecast-history', days],
    queryFn: async () => {
      const response = await api.get(`/api/ai/forecast/history?days=${days}`);
      return response.data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 1,
  });
};

// Hook for AI health check
export const useAIHealth = () => {
  return useQuery({
    queryKey: ['ai-health'],
    queryFn: async (): Promise<AIHealthResponse> => {
      const response = await api.get('/api/ai/health');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

// Hook for generating bid request emails
export const useGenerateBidEmail = () => {
  return useMutation({
    mutationFn: async ({ 
      bidRequest, 
      supplier 
    }: { 
      bidRequest: any; 
      supplier: any; 
    }) => {
      const response = await api.post('/api/ai/email/bid-request', {
        bid_request: bidRequest,
        supplier: supplier,
      });
      return response.data;
    },
  });
};

// Hook for parsing supplier responses
export const useParseSupplierResponse = () => {
  return useMutation({
    mutationFn: async ({ 
      emailContent, 
      bidRequestId 
    }: { 
      emailContent: string; 
      bidRequestId: string; 
    }) => {
      const response = await api.post('/api/ai/email/parse-response', {
        email_content: emailContent,
        bid_request_id: bidRequestId,
      });
      return response.data;
    },
  });
}; 