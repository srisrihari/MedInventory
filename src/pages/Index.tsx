
import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { InventoryLevelChart } from "@/components/dashboard/InventoryLevelChart";
import { SupplierRankingTable } from "@/components/dashboard/SupplierRankingTable";
import { ExpiryTrackingList } from "@/components/dashboard/ExpiryTrackingList";
import { ForecastingPanel } from "@/components/dashboard/ForecastingPanel";
import { DeliveryStatusCard } from "@/components/dashboard/DeliveryStatusCard";
import { TopInDemandList } from "@/components/dashboard/TopInDemandList";
import { Package, Users, Gavel, Wrench, AlertTriangle, IndianRupee } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useDashboard } from "@/hooks/useDashboard";
import { cn } from "@/lib/utils";

export default function Index() {
  const [expiryThreshold, setExpiryThreshold] = useState(10);
  const { stats, isLoading, error } = useDashboard();

  const handleExpiryThresholdChange = (value: string) => {
    setExpiryThreshold(parseInt(value));
  };

  // Format large numbers with commas
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <AppLayout>
      <div className="space-y-4 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Your hospital inventory management system at a glance.
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, idx) => (
              <div 
                key={idx} 
                className="h-32 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800"
              ></div>
            ))}
          </div>
        ) : error ? (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            <div className="col-span-full p-6 text-center">
              <p className="text-muted-foreground">Failed to load dashboard data</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Total Inventory"
              value={formatNumber(stats.totalInventory)}
              description="vs last month"
              percentageChange={stats.percentageChange}
              icon={Package}
              className="hover-scale"
            />
            <StatsCard
              title="Total Value"
              value={formatCurrency(stats.totalValue)}
              description="inventory worth"
              percentageChange={stats.percentageChange}
              icon={IndianRupee}
              className="hover-scale"
            />
            <StatsCard
              title="Active Suppliers"
              value={formatNumber(stats.totalSuppliers)}
              description="active partnerships"
              percentageChange={5.2}
              icon={Users}
              className="hover-scale"
            />
            <StatsCard
              title="Active Bids"
              value={formatNumber(stats.activeBids)}
              description="ongoing procurement"
              percentageChange={12.8}
              icon={Gavel}
              className="hover-scale"
            />
          </div>
        )}

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <TopInDemandList />
          </div>
          <div className="lg:col-span-1">
            <DeliveryStatusCard />
          </div>
        </div>

        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <InventoryLevelChart />
          </div>
          <div className="xl:col-span-1">
            <div className="flex flex-col h-full space-y-4">
              <div className="h-1/2">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Expiry Tracking</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Show items expiring within:</span>
                    <Select
                      value={expiryThreshold.toString()}
                      onValueChange={handleExpiryThresholdChange}
                    >
                      <SelectTrigger className="w-[100px] h-8">
                        <SelectValue placeholder="10 days" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 days</SelectItem>
                        <SelectItem value="5">5 days</SelectItem>
                        <SelectItem value="7">7 days</SelectItem>
                        <SelectItem value="10">10 days</SelectItem>
                        <SelectItem value="14">14 days</SelectItem>
                        <SelectItem value="30">30 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <ExpiryTrackingList threshold={expiryThreshold} />
              </div>
              <div className="h-1/2">
                {/* Additional stats cards */}
                <div className="grid gap-3 grid-cols-2">
                  <div className={cn(
                    "p-4 rounded-lg border bg-card",
                    stats.lowStockCount > 0 ? "border-orange-200 bg-orange-50 dark:bg-orange-950/20" : "border-green-200 bg-green-50 dark:bg-green-950/20"
                  )}>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className={cn(
                        "h-4 w-4",
                        stats.lowStockCount > 0 ? "text-orange-600" : "text-green-600"
                      )} />
                      <span className="text-sm font-medium">Low Stock</span>
                    </div>
                    <p className="text-2xl font-bold mt-1">{stats.lowStockCount}</p>
                    <p className="text-xs text-muted-foreground">items need restocking</p>
                  </div>
                  <div className={cn(
                    "p-4 rounded-lg border bg-card",
                    stats.maintenanceDue > 0 ? "border-blue-200 bg-blue-50 dark:bg-blue-950/20" : "border-green-200 bg-green-50 dark:bg-green-950/20"
                  )}>
                    <div className="flex items-center gap-2">
                      <Wrench className={cn(
                        "h-4 w-4",
                        stats.maintenanceDue > 0 ? "text-blue-600" : "text-green-600"
                      )} />
                      <span className="text-sm font-medium">Maintenance</span>
                    </div>
                    <p className="text-2xl font-bold mt-1">{stats.maintenanceDue}</p>
                    <p className="text-xs text-muted-foreground">equipment due</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 grid-cols-1 xl:grid-cols-2">
          <div className="space-y-4">
            <ForecastingPanel />
          </div>
          <SupplierRankingTable />
        </div>
      </div>
    </AppLayout>
  );
}
