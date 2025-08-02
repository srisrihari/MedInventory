/**
 * Custom Hook for Bidding System Management  
 * Handles bidding-related API calls and state management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, API_ENDPOINTS, BidRequest } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

// Query keys for React Query
export const BIDDING_QUERY_KEYS = {
  all: ['bidding'] as const,
  requests: () => [...BIDDING_QUERY_KEYS.all, 'requests'] as const,
  request: (id: string) => [...BIDDING_QUERY_KEYS.requests(), id] as const,
  bids: (requestId: string) => [...BIDDING_QUERY_KEYS.all, 'bids', requestId] as const,
  suppliers: () => [...BIDDING_QUERY_KEYS.all, 'suppliers'] as const,
};

interface UseBiddingFilters {
  status?: string;
  category?: string;
  skip?: number;
  limit?: number;
}

export function useBidding(filters?: UseBiddingFilters) {
  // Fetch bid requests
  const {
    data: biddingData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: BIDDING_QUERY_KEYS.requests(),
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters?.status) params.append('status', filters.status);
      if (filters?.category) params.append('category', filters.category);
      if (filters?.skip) params.append('skip', filters.skip.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      
      const response = await apiClient.get(`${API_ENDPOINTS.bidding.requests}?${params}`);
      return response.data;
    },
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false,
  });

  const requests = biddingData?.requests || [];
  const total = biddingData?.total || 0;

  return {
    requests,
    total,
    isLoading,
    error,
    refetch,
  };
}

export function useBiddingMutations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Create bid request mutation
  const createBidRequestMutation = useMutation({
    mutationFn: async (requestData: Partial<BidRequest>) => {
      const response = await apiClient.post(API_ENDPOINTS.bidding.createRequest, requestData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BIDDING_QUERY_KEYS.requests() });
      toast({
        title: "Bid Request Created",
        description: "New bid request has been created and sent to suppliers.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Create Bid Request",
        description: error.response?.data?.detail || "An error occurred while creating the bid request",
        variant: "destructive",
      });
    },
  });

  // Decide on bid mutation (approve/reject)
  const decideBidMutation = useMutation({
    mutationFn: async ({ bidId, decision, notes }: {
      bidId: string;
      decision: 'approve' | 'reject';
      notes?: string;
    }) => {
      const response = await apiClient.post(API_ENDPOINTS.bidding.decideBid(bidId), {
        decision,
        notes
      });
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: BIDDING_QUERY_KEYS.requests() });
      toast({
        title: `Bid ${variables.decision === 'approve' ? 'Approved' : 'Rejected'}`,
        description: `The bid has been ${variables.decision}d successfully.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Process Bid",
        description: error.response?.data?.detail || "An error occurred while processing the bid",
        variant: "destructive",
      });
    },
  });

  return {
    createBidRequest: createBidRequestMutation.mutate,
    decideBid: decideBidMutation.mutate,
    
    // Loading states
    isCreatingBidRequest: createBidRequestMutation.isPending,
    isDecidingBid: decideBidMutation.isPending,
  };
}

// Hook for getting bid statistics
export function useBiddingStats() {
  const { requests } = useBidding();
  
  const stats = {
    totalRequests: requests.length,
    activeRequests: requests.filter(r => r.status === 'active').length,
    draftRequests: requests.filter(r => r.status === 'draft').length,
    completedRequests: requests.filter(r => r.status === 'closed' || r.status === 'awarded').length,
    totalValue: requests.reduce((sum, r) => sum + r.estimated_value, 0),
  };

  return stats;
}

// Helper function to get status color
export function getBidStatusColor(status: string) {
  switch (status) {
    case 'draft':
      return 'text-gray-600 bg-gray-50';
    case 'active':
      return 'text-blue-600 bg-blue-50';
    case 'closed':
      return 'text-green-600 bg-green-50';
    case 'awarded':
      return 'text-purple-600 bg-purple-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}

// Helper function to get status icon
export function getBidStatusIcon(status: string) {
  switch (status) {
    case 'draft':
      return '📝';
    case 'active':
      return '🔵';
    case 'closed':
      return '✅';
    case 'awarded':
      return '🏆';
    default:
      return '❓';
  }
}

// Helper function to format currency
export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
}