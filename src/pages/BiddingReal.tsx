/**
 * Real Bidding Management Page - Connected to Backend API
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
  Dialog, DialogContent, DialogDescription, 
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, Search, RefreshCw, Calendar, 
  IndianRupee, Users, Clock, CheckCircle, 
  XCircle, AlertCircle, Eye, Edit, Trash2,
  TrendingDown, Award, BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { 
  useBidding, 
  useBiddingMutations, 
  useBiddingStats,
  getBidStatusColor, 
  getBidStatusIcon,
  formatCurrency 
} from "@/hooks/useBidding";
import { useSuppliers } from "@/hooks/useSuppliers";
import { BidRequest } from "@/lib/api";

// Create Bid Request Dialog Component
function CreateBidRequestDialog({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    quantity: 0,
    estimated_value: 0,
    deadline: '',
    items: [] as any[]
  });

  const { createBidRequest, isCreatingBidRequest } = useBiddingMutations();

  const handleSubmit = () => {
    if (!formData.title || !formData.category || formData.quantity <= 0) return;

    createBidRequest({
      ...formData,
      items: [{ name: formData.title, quantity: formData.quantity }], // Simplified for now
    });

    // Reset form and close
    setFormData({
      title: '',
      description: '',
      category: '',
      quantity: 0,
      estimated_value: 0,
      deadline: '',
      items: []
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Bid Request</DialogTitle>
          <DialogDescription>
            Create a new bid request to send to suppliers for competitive pricing.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="col-span-3"
              placeholder="e.g., Pain Relief Medications"
              required
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Category
            </Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pain Relief">Pain Relief</SelectItem>
                <SelectItem value="Antibiotics">Antibiotics</SelectItem>
                <SelectItem value="Diabetes">Diabetes</SelectItem>
                <SelectItem value="Cardiovascular">Cardiovascular</SelectItem>
                <SelectItem value="Emergency">Emergency</SelectItem>
                <SelectItem value="Surgical">Surgical</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="quantity" className="text-right">
              Quantity
            </Label>
            <Input
              id="quantity"
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
              className="col-span-3"
              min="1"
              required
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="estimated_value" className="text-right">
              Est. Value ($)
            </Label>
            <Input
              id="estimated_value"
              type="number"
              value={formData.estimated_value}
              onChange={(e) => setFormData(prev => ({ ...prev, estimated_value: parseFloat(e.target.value) || 0 }))}
              className="col-span-3"
              min="0"
              step="0.01"
              required
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="deadline" className="text-right">
              Deadline
            </Label>
            <Input
              id="deadline"
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
              className="col-span-3"
              required
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="col-span-3"
              placeholder="Describe the procurement requirements..."
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isCreatingBidRequest}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!formData.title || !formData.category || formData.quantity <= 0 || isCreatingBidRequest}
          >
            {isCreatingBidRequest ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Create Request
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function Bidding() {
  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("requests");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // API integration
  const { requests, total, isLoading, error, refetch } = useBidding({
    status: selectedStatus !== "all" ? selectedStatus : undefined,
  });

  const { suppliers } = useSuppliers({ active_only: true });
  const stats = useBiddingStats();

  // Filter requests based on search
  const filteredRequests = requests.filter(request =>
    request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Status options
  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "draft", label: "Draft" },
    { value: "active", label: "Active" },
    { value: "closed", label: "Closed" },
    { value: "awarded", label: "Awarded" }
  ];

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Get status display
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'draft':
        return { label: 'Draft', variant: 'secondary' as const };
      case 'active':
        return { label: 'Active', variant: 'default' as const };
      case 'closed':
        return { label: 'Closed', variant: 'outline' as const };
      case 'awarded':
        return { label: 'Awarded', variant: 'destructive' as const };
      default:
        return { label: status, variant: 'secondary' as const };
    }
  };

  if (error) {
    return (
      <AppLayout>
        <div className="container mx-auto py-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center space-x-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <span>Error loading bidding data: {error.message}</span>
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
            <h1 className="text-2xl font-bold tracking-tight">Automated Supplier Bidding</h1>
            <p className="text-muted-foreground">
              Streamline procurement through automated supplier bidding and selection
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => refetch()}>
              <RefreshCw className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")} />
              Refresh
            </Button>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Bid Request
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Requests"
            value={stats.totalRequests.toString()}
            description="All bid requests"
            icon={BarChart3}
          />
          <StatsCard
            title="Active Bidding"
            value={stats.activeRequests.toString()}
            description="Currently open requests"
            icon={Clock}
          />
          <StatsCard
            title="Total Value"
            value={formatCurrency(stats.totalValue)}
            description="Combined request value"
            icon={IndianRupee}
          />
          <StatsCard
            title="Active Suppliers"
            value={suppliers.length.toString()}
            description="Registered suppliers"
            icon={Users}
          />
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="requests">Bid Requests</TabsTrigger>
            <TabsTrigger value="suppliers">Supplier Directory</TabsTrigger>
          </TabsList>

          {/* Bid Requests Tab */}
          <TabsContent value="requests" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Bid Requests</CardTitle>
                <CardDescription>
                  Showing {filteredRequests.length} of {total} bid requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search bid requests..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  
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

                {/* Requests Table */}
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Request</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Est. Value</TableHead>
                        <TableHead>Deadline</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center">
                            <RefreshCw className="mx-auto h-4 w-4 animate-spin" />
                            <p className="mt-2 text-sm text-muted-foreground">Loading requests...</p>
                          </TableCell>
                        </TableRow>
                      ) : filteredRequests.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center">
                            <BarChart3 className="mx-auto h-4 w-4 text-muted-foreground" />
                            <p className="mt-2 text-sm text-muted-foreground">No bid requests found</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredRequests.map((request) => {
                          const statusDisplay = getStatusDisplay(request.status);
                          return (
                            <TableRow key={request.id}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{request.title}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {request.description || 'No description'}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{request.category}</Badge>
                              </TableCell>
                              <TableCell>{request.quantity.toLocaleString()}</TableCell>
                              <TableCell>{formatCurrency(request.estimated_value)}</TableCell>
                              <TableCell>{formatDate(request.deadline)}</TableCell>
                              <TableCell>
                                <Badge variant={statusDisplay.variant}>
                                  {getBidStatusIcon(request.status)} {statusDisplay.label}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  <Button variant="ghost" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Suppliers Tab */}
          <TabsContent value="suppliers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Suppliers</CardTitle>
                <CardDescription>
                  {suppliers.length} suppliers ready to receive bid requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {suppliers.map((supplier) => (
                    <Card key={supplier.id}>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="font-medium">{supplier.name}</div>
                          <div className="text-sm text-muted-foreground">{supplier.email}</div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Rating:</span>
                            <div className="flex items-center">
                              <span className="text-sm font-medium">{supplier.rating.toFixed(1)}/5.0</span>
                              <Badge variant="outline" className="ml-2">
                                {supplier.response_time_hours}h response
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create Bid Request Dialog */}
        <CreateBidRequestDialog
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
        />
      </div>
    </AppLayout>
  );
}