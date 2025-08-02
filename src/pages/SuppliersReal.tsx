/**
 * Real Suppliers Management Page - Connected to Backend API
 * Displays actual supplier data from your FastAPI backend
 */

import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  RefreshCw, 
  Users, 
  Mail, 
  Phone, 
  Star,
  Building,
  AlertCircle,
  Clock,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { 
  useSuppliers, 
  getRatingStars, 
  getPerformanceColor, 
  getPriceCompetitivenessColor 
} from "@/hooks/useSuppliers";

export default function Suppliers() {
  const [searchTerm, setSearchTerm] = useState("");
  
  // API integration
  const { suppliers, total, isLoading, error, refetch } = useSuppliers({
    active_only: true
  });

  // Filter suppliers based on search
  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate statistics
  const calculateStats = () => {
    const avgRating = suppliers.length > 0 
      ? suppliers.reduce((sum, s) => sum + s.rating, 0) / suppliers.length 
      : 0;
    
    const excellentSuppliers = suppliers.filter(s => s.delivery_performance === 'excellent').length;
    const fastResponseSuppliers = suppliers.filter(s => s.response_time_hours <= 24).length;
    const highCompetitiveSuppliers = suppliers.filter(s => s.price_competitiveness === 'high').length;

    return {
      avgRating,
      excellentSuppliers,
      fastResponseSuppliers,
      highCompetitiveSuppliers
    };
  };

  const stats = calculateStats();

  // Format rating
  const formatRating = (rating: number) => {
    return `${rating.toFixed(1)}/5.0`;
  };

  // Format delivery rate
  const formatDeliveryRate = (rate: number) => {
    return `${rate.toFixed(1)}%`;
  };

  if (error) {
    return (
      <AppLayout>
        <div className="container mx-auto py-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center space-x-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <span>Error loading suppliers: {error.message}</span>
              </div>
              <Button onClick={() => refetch()} className="mt-4">
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Medical Suppliers</h1>
            <p className="text-muted-foreground">
              Manage supplier relationships and performance metrics
            </p>
          </div>
          <Button onClick={() => refetch()}>
            <RefreshCw className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")} />
            Refresh
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Suppliers"
            value={total.toString()}
            description="Active medical suppliers"
            icon={<Users className="h-4 w-4" />}
          />
          <StatsCard
            title="Average Rating"
            value={stats.avgRating.toFixed(1)}
            description="Supplier performance rating"
            icon={<Star className="h-4 w-4" />}
          />
          <StatsCard
            title="Excellent Suppliers"
            value={stats.excellentSuppliers.toString()}
            description="Top performing suppliers"
            icon={<TrendingUp className="h-4 w-4" />}
          />
          <StatsCard
            title="Fast Response"
            value={stats.fastResponseSuppliers.toString()}
            description="Respond within 24 hours"
            icon={<Clock className="h-4 w-4" />}
          />
        </div>

        {/* Suppliers Table */}
        <Card>
          <CardHeader>
            <CardTitle>Supplier Directory</CardTitle>
            <CardDescription>
              Showing {filteredSuppliers.length} of {total} active suppliers
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search suppliers by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
            </div>

            {/* Suppliers Table */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Response Time</TableHead>
                    <TableHead>Delivery Performance</TableHead>
                    <TableHead>Price Competitiveness</TableHead>
                    <TableHead>On-Time Delivery</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        <RefreshCw className="mx-auto h-4 w-4 animate-spin" />
                        <p className="mt-2 text-sm text-muted-foreground">Loading suppliers...</p>
                      </TableCell>
                    </TableRow>
                  ) : filteredSuppliers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        <Building className="mx-auto h-4 w-4 text-muted-foreground" />
                        <p className="mt-2 text-sm text-muted-foreground">No suppliers found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSuppliers.map((supplier) => (
                      <TableRow key={supplier.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{supplier.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {supplier.address || 'Address not provided'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center text-sm">
                              <Mail className="mr-1 h-3 w-3" />
                              {supplier.email}
                            </div>
                            {supplier.phone && (
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Phone className="mr-1 h-3 w-3" />
                                {supplier.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{formatRating(supplier.rating)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={supplier.response_time_hours <= 24 ? "default" : "secondary"}>
                            {supplier.response_time_hours}h
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={getPerformanceColor(supplier.delivery_performance)}
                          >
                            {supplier.delivery_performance}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline"
                            className={getPriceCompetitivenessColor(supplier.price_competitiveness)}
                          >
                            {supplier.price_competitiveness}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className={cn(
                              "w-2 h-2 rounded-full",
                              supplier.on_time_delivery_rate >= 95 ? "bg-green-500" :
                              supplier.on_time_delivery_rate >= 85 ? "bg-yellow-500" : "bg-red-500"
                            )} />
                            <span className="text-sm font-medium">
                              {formatDeliveryRate(supplier.on_time_delivery_rate)}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}