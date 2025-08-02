import { useState, useEffect } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, Search, Filter, Calendar, 
  IndianRupee, Users, Clock, CheckCircle, 
  XCircle, AlertCircle, Eye, Edit, Trash2,
  TrendingDown, Award, BarChart3
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";

interface BidRequest {
  id: string;
  title: string;
  category: string;
  items: string[];
  quantity: number;
  estimatedValue: number;
  deadline: string;
  status: "draft" | "active" | "closed" | "awarded";
  bidsReceived: number;
  createdDate: string;
  description: string;
}

interface Bid {
  id: string;
  requestId: string;
  supplierName: string;
  supplierRating: number;
  totalAmount: number;
  deliveryTime: string;
  status: "pending" | "accepted" | "rejected";
  submittedDate: string;
  validUntil: string;
  notes: string;
}

const mockBidRequests: BidRequest[] = [
  {
    id: "BR001",
    title: "Surgical Instruments Q1 2024",
    category: "Medical Equipment",
    items: ["Surgical Scissors", "Forceps", "Scalpels"],
    quantity: 250,
    estimatedValue: 125000,
    deadline: "2024-02-15",
    status: "active",
    bidsReceived: 8,
    createdDate: "2024-01-10",
    description: "Quarterly procurement for surgical instruments"
  },
  {
    id: "BR002", 
    title: "Antibiotics Bulk Order",
    category: "Pharmaceuticals",
    items: ["Amoxicillin", "Ciprofloxacin", "Azithromycin"],
    quantity: 5000,
    estimatedValue: 250000,
    deadline: "2024-02-20",
    status: "active", 
    bidsReceived: 12,
    createdDate: "2024-01-15",
    description: "Monthly antibiotic stock replenishment"
  },
  {
    id: "BR003",
    title: "MRI Maintenance Contract",
    category: "Service Contract",
    items: ["Annual Maintenance", "Emergency Support"],
    quantity: 1,
    estimatedValue: 500000,
    deadline: "2024-01-30",
    status: "closed",
    bidsReceived: 5,
    createdDate: "2024-01-05",
    description: "Annual maintenance contract for MRI equipment"
  }
];

const mockBids: Bid[] = [
  {
    id: "BID001",
    requestId: "BR001",
    supplierName: "MediTech Pharmaceuticals",
    supplierRating: 4.8,
    totalAmount: 118000,
    deliveryTime: "14 days",
    status: "pending",
    submittedDate: "2024-01-20",
    validUntil: "2024-02-10",
    notes: "Includes free delivery and 6-month warranty"
  },
  {
    id: "BID002",
    requestId: "BR001", 
    supplierName: "Global Health Supplies",
    supplierRating: 4.5,
    totalAmount: 122000,
    deliveryTime: "10 days",
    status: "pending",
    submittedDate: "2024-01-22",
    validUntil: "2024-02-12",
    notes: "Express delivery available, 12-month warranty"
  },
  {
    id: "BID003",
    requestId: "BR002",
    supplierName: "PharmaPlus Inc.",
    supplierRating: 4.2,
    totalAmount: 235000,
    deliveryTime: "7 days",
    status: "accepted",
    submittedDate: "2024-01-18",
    validUntil: "2024-02-15",
    notes: "Best price guarantee and bulk discount applied"
  }
];

export default function Bidding() {
  const { toast } = useToast();
  const [bidRequests, setBidRequests] = useState<BidRequest[]>(mockBidRequests);
  const [bids, setBids] = useState<Bid[]>(mockBids);
  const [activeTab, setActiveTab] = useState("requests");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<BidRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const getStatusBadge = (status: BidRequest["status"]) => {
    switch (status) {
      case "active":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">Active</Badge>;
      case "closed":
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800">Closed</Badge>;
      case "awarded":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">Awarded</Badge>;
      case "draft":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800">Draft</Badge>;
      default:
        return null;
    }
  };

  const getBidStatusBadge = (status: Bid["status"]) => {
    switch (status) {
      case "accepted":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">Accepted</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">Rejected</Badge>;
      case "pending":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800">Pending</Badge>;
      default:
        return null;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };

  const filteredRequests = bidRequests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || request.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const totalBidValue = bidRequests.reduce((sum, request) => sum + request.estimatedValue, 0);
  const activeBids = bidRequests.filter(request => request.status === "active").length;
  const avgBidsPerRequest = bidRequests.length > 0 ? 
    Math.round(bidRequests.reduce((sum, request) => sum + request.bidsReceived, 0) / bidRequests.length) : 0;

  const handleCreateBidRequest = () => {
    toast({
      title: "Bid Request Created",
      description: "New bid request has been published successfully.",
    });
    setIsCreateDialogOpen(false);
  };

  const handleAcceptBid = (bidId: string) => {
    setBids(bids.map(bid => 
      bid.id === bidId ? { ...bid, status: "accepted" as const } : bid
    ));
    toast({
      title: "Bid Accepted",
      description: "The selected bid has been accepted successfully.",
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Automated Supplier Bidding</h1>
            <p className="text-muted-foreground">
              Streamline procurement through automated supplier bidding and selection.
            </p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center">
                <Plus className="mr-2 h-4 w-4" />
                Create Bid Request
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Create New Bid Request</DialogTitle>
                <DialogDescription>
                  Create a new bid request to invite suppliers for competitive bidding.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">Request Title</label>
                  <Input id="title" placeholder="e.g., Surgical Instruments Q1 2024" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="category" className="text-sm font-medium">Category</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pharmaceuticals">Pharmaceuticals</SelectItem>
                        <SelectItem value="medical-equipment">Medical Equipment</SelectItem>
                        <SelectItem value="surgical-instruments">Surgical Instruments</SelectItem>
                        <SelectItem value="service-contract">Service Contract</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="estimated-value" className="text-sm font-medium">Estimated Value</label>
                    <Input id="estimated-value" type="number" placeholder="₹0" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="quantity" className="text-sm font-medium">Quantity</label>
                    <Input id="quantity" type="number" placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="deadline" className="text-sm font-medium">Bid Deadline</label>
                    <Input id="deadline" type="date" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">Description</label>
                  <Input id="description" placeholder="Brief description of requirements" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateBidRequest}>Create Request</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
          <StatsCard
            title="Total Bid Value"
            value={formatCurrency(totalBidValue)}
            description="across all requests"
            icon={IndianRupee}
            className="hover-scale"
          />
          <StatsCard
            title="Active Bids"
            value={activeBids.toString()}
            description="currently open"
            icon={Clock}
            className="hover-scale"
            percentageChange={12.5}
          />
          <StatsCard
            title="Avg Bids/Request"
            value={avgBidsPerRequest.toString()}
            description="supplier participation"
            icon={Users}
            className="hover-scale"
          />
          <StatsCard
            title="Cost Savings"
            value="18.2%"
            description="vs manual procurement"
            icon={TrendingDown}
            className="hover-scale"
            percentageChange={5.3}
          />
        </div>

        <Card>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <CardHeader className="pb-2">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-2 md:space-y-0">
                <div>
                  <CardTitle className="text-lg font-semibold">Bidding Management</CardTitle>
                  <CardDescription>Manage bid requests and supplier responses</CardDescription>
                </div>
                <TabsList>
                  <TabsTrigger value="requests">Bid Requests</TabsTrigger>
                  <TabsTrigger value="bids">Received Bids</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>
              </div>
            </CardHeader>

            <CardContent>
              <TabsContent value="requests" className="mt-0">
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 gap-3">
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search bid requests..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="w-full sm:w-40">
                        <div className="flex items-center">
                          <Filter className="mr-2 h-4 w-4" />
                          <span>Status</span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                        <SelectItem value="awarded">Awarded</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {isLoading ? (
                    <div className="h-64 flex items-center justify-center">
                      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <div className="rounded-md border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Request Details</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Estimated Value</TableHead>
                            <TableHead>Deadline</TableHead>
                            <TableHead>Bids Received</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredRequests.map((request) => (
                            <TableRow key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                              <TableCell>
                                <div>
                                  <div className="font-medium">{request.title}</div>
                                  <div className="text-sm text-muted-foreground">
                                    ID: {request.id} • Qty: {request.quantity}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary">{request.category}</Badge>
                              </TableCell>
                              <TableCell className="font-medium">
                                {formatCurrency(request.estimatedValue)}
                              </TableCell>
                              <TableCell>{formatDate(request.deadline)}</TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                                  {request.bidsReceived}
                                </div>
                              </TableCell>
                              <TableCell>{getStatusBadge(request.status)}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end space-x-2">
                                  <Button variant="ghost" size="icon">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="bids" className="mt-0">
                <div className="space-y-4">
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Supplier</TableHead>
                          <TableHead>Request ID</TableHead>
                          <TableHead>Total Amount</TableHead>
                          <TableHead>Delivery Time</TableHead>
                          <TableHead>Valid Until</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bids.map((bid) => (
                          <TableRow key={bid.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                            <TableCell>
                              <div>
                                <div className="font-medium">{bid.supplierName}</div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <Award className="h-3 w-3 mr-1" />
                                  {bid.supplierRating}/5.0
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{bid.requestId}</TableCell>
                            <TableCell className="font-medium">
                              {formatCurrency(bid.totalAmount)}
                            </TableCell>
                            <TableCell>{bid.deliveryTime}</TableCell>
                            <TableCell>{formatDate(bid.validUntil)}</TableCell>
                            <TableCell>{getBidStatusBadge(bid.status)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end space-x-2">
                                {bid.status === "pending" && (
                                  <>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => handleAcceptBid(bid.id)}
                                      className="text-green-600 hover:text-green-700"
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <XCircle className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                                <Button variant="ghost" size="icon">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="mt-0">
                <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Procurement Savings</CardTitle>
                      <CardDescription>Cost savings through automated bidding</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Manual Procurement</span>
                          <span className="font-medium">₹15.2L</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Automated Bidding</span>
                          <span className="font-medium text-green-600">₹12.4L</span>
                        </div>
                        <div className="border-t pt-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Total Savings</span>
                            <span className="font-bold text-green-600">₹2.8L (18.2%)</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Supplier Participation</CardTitle>
                      <CardDescription>Average bids per request category</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Pharmaceuticals</span>
                          <span className="font-medium">12 bids</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Medical Equipment</span>
                          <span className="font-medium">8 bids</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Service Contracts</span>
                          <span className="font-medium">5 bids</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Surgical Instruments</span>
                          <span className="font-medium">6 bids</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </AppLayout>
  );
}