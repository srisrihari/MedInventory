/**
 * Real Equipment & Maintenance Page - Connected to Backend API
 * Replaces mock data with actual API calls to your FastAPI backend
 */

import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { 
  Card, CardContent, CardDescription, 
  CardHeader, CardTitle 
} from "@/components/ui/card";
import { 
  Table, TableBody, TableCell, 
  TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Plus, Search, RefreshCw, Calendar, 
  Wrench, Activity, AlertTriangle, CheckCircle, 
  Clock, Zap, Settings, TrendingUp, TrendingDown,
  Battery, Thermometer, Gauge, WifiOff, Wifi,
  Edit, Eye, MoreVertical
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { 
  useEquipment, 
  useEquipmentStats,
  getEquipmentStatusColor,
  getEquipmentStatusIcon,
  getHealthScoreColor,
  getUtilizationColor,
  formatPercentage,
  isMaintenanceDueSoon,
  isMaintenanceOverdue
} from "@/hooks/useEquipment";

export default function Maintenance() {
  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("equipment");

  // API integration
  const { equipment, total, isLoading, error, refetch } = useEquipment({
    type: selectedType !== "all" ? selectedType : undefined,
    status: selectedStatus !== "all" ? selectedStatus : undefined,
  });

  const stats = useEquipmentStats();

  // Filter equipment based on search
  const filteredEquipment = equipment.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get unique types and statuses
  const types = [...new Set(equipment.map(item => item.type))];
  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "operational", label: "Operational" },
    { value: "maintenance", label: "Maintenance" },
    { value: "critical", label: "Critical" },
    { value: "offline", label: "Offline" }
  ];

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Get status display
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'operational':
        return { label: 'Operational', variant: 'default' as const };
      case 'maintenance':
        return { label: 'Maintenance', variant: 'secondary' as const };
      case 'critical':
        return { label: 'Critical', variant: 'destructive' as const };
      case 'offline':
        return { label: 'Offline', variant: 'outline' as const };
      default:
        return { label: status, variant: 'secondary' as const };
    }
  };

  // Calculate maintenance urgency
  const getMaintenanceUrgency = (nextMaintenance: string) => {
    if (isMaintenanceOverdue(nextMaintenance)) {
      return { label: 'Overdue', color: 'text-red-600', urgent: true };
    }
    if (isMaintenanceDueSoon(nextMaintenance, 7)) {
      return { label: 'Due Soon', color: 'text-orange-600', urgent: true };
    }
    if (isMaintenanceDueSoon(nextMaintenance, 30)) {
      return { label: 'Due This Month', color: 'text-yellow-600', urgent: false };
    }
    return { label: 'Scheduled', color: 'text-green-600', urgent: false };
  };

  if (error) {
    return (
      <AppLayout>
        <div className="container mx-auto py-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center space-x-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                <span>Error loading equipment data: {error.message}</span>
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
            <h1 className="text-2xl font-bold tracking-tight">Equipment & Predictive Maintenance</h1>
            <p className="text-muted-foreground">
              Monitor equipment health and predict maintenance needs using AI
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
            title="Total Equipment"
            value={stats.totalEquipment.toString()}
            description="Medical equipment monitored"
            icon={Settings}
          />
          <StatsCard
            title="Operational"
            value={stats.operational.toString()}
            description="Equipment running normally"
            icon={CheckCircle}
            trend="positive"
          />
          <StatsCard
            title="Avg Health Score"
            value={stats.avgHealthScore.toFixed(0)}
            description="Overall equipment health"
            icon={Activity}
          />
          <StatsCard
            title="Avg Utilization"
            value={formatPercentage(stats.avgUtilization)}
            description="Equipment usage rate"
            icon={Gauge}
          />
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="equipment">Equipment</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="predictions">AI Predictions</TabsTrigger>
          </TabsList>

          {/* Equipment Tab */}
          <TabsContent value="equipment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Equipment Monitoring</CardTitle>
                <CardDescription>
                  Showing {filteredEquipment.length} of {total} medical equipment
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search equipment..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Equipment Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {types.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Equipment Cards Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-20 bg-gray-200 rounded"></div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : filteredEquipment.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                      <Settings className="mx-auto h-12 w-12 text-muted-foreground" />
                      <p className="mt-4 text-lg font-medium">No equipment found</p>
                      <p className="text-muted-foreground">Try adjusting your search or filters</p>
                    </div>
                  ) : (
                    filteredEquipment.map((item) => {
                      const statusDisplay = getStatusDisplay(item.status);
                      const maintenanceUrgency = getMaintenanceUrgency(item.next_maintenance || '');
                      
                      return (
                        <Card key={item.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              {/* Header */}
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-medium">{item.name}</h3>
                                  <p className="text-sm text-muted-foreground">{item.type}</p>
                                </div>
                                <Badge variant={statusDisplay.variant}>
                                  {getEquipmentStatusIcon(item.status)} {statusDisplay.label}
                                </Badge>
                              </div>

                              {/* Location & Model */}
                              <div className="text-sm space-y-1">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Location:</span>
                                  <span>{item.location}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Model:</span>
                                  <span>{item.model || 'N/A'}</span>
                                </div>
                              </div>

                              {/* Health Score */}
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span>Health Score</span>
                                  <span className={getHealthScoreColor(item.health_score)}>
                                    {item.health_score}%
                                  </span>
                                </div>
                                <Progress value={item.health_score} className="h-2" />
                              </div>

                              {/* Utilization */}
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span>Utilization</span>
                                  <span className={getUtilizationColor(item.utilization_rate)}>
                                    {formatPercentage(item.utilization_rate)}
                                  </span>
                                </div>
                                <Progress value={item.utilization_rate} className="h-2" />
                              </div>

                              {/* Maintenance */}
                              {item.next_maintenance && (
                                <div className="text-sm">
                                  <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Next Maintenance:</span>
                                    <Badge 
                                      variant="outline" 
                                      className={cn(
                                        maintenanceUrgency.color,
                                        maintenanceUrgency.urgent && "border-current"
                                      )}
                                    >
                                      {maintenanceUrgency.label}
                                    </Badge>
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {formatDate(item.next_maintenance)}
                                  </div>
                                </div>
                              )}

                              {/* Actions */}
                              <div className="flex gap-2 pt-2">
                                <Button variant="outline" size="sm" className="flex-1">
                                  <Eye className="mr-1 h-3 w-3" />
                                  View
                                </Button>
                                <Button variant="outline" size="sm" className="flex-1">
                                  <Wrench className="mr-1 h-3 w-3" />
                                  Maintain
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Maintenance Tab */}
          <TabsContent value="maintenance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Schedule</CardTitle>
                <CardDescription>
                  Upcoming and overdue maintenance tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Wrench className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-lg font-medium">Maintenance Schedule</p>
                  <p className="text-muted-foreground">Enhanced maintenance tracking coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Predictions Tab */}
          <TabsContent value="predictions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>AI-Powered Predictions</CardTitle>
                <CardDescription>
                  Predictive analytics for equipment failures and maintenance needs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Activity className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-lg font-medium">AI Predictions</p>
                  <p className="text-muted-foreground">Machine learning predictions coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}