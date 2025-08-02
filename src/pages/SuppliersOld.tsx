import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SupplierActions } from "@/components/suppliers/SupplierActions";
import { EditPerformanceDialog } from "@/components/suppliers/EditPerformanceDialog";
import { AddSupplierDialog } from "@/components/suppliers/AddSupplierDialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, Star, Search, ArrowUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Supplier {
  id: string;
  name: string;
  rating: number;
  responseTime: string;
  deliveryPerformance: string;
  priceCompetitiveness: string;
  onTimeDelivery: number;
  status: string;
}

const mockSuppliers: Supplier[] = [
  {
    id: "1",
    name: "MediTech Pharmaceuticals",
    rating: 4.8,
    responseTime: "24h",
    deliveryPerformance: "Excellent",
    priceCompetitiveness: "High",
    onTimeDelivery: 98.5,
    status: "Active",
  },
  {
    id: "2",
    name: "Global Health Supplies",
    rating: 4.5,
    responseTime: "48h",
    deliveryPerformance: "Good",
    priceCompetitiveness: "Medium",
    onTimeDelivery: 92.7,
    status: "Active",
  },
  {
    id: "3",
    name: "PharmaPlus Inc.",
    rating: 4.2,
    responseTime: "36h",
    deliveryPerformance: "Good",
    priceCompetitiveness: "Medium",
    onTimeDelivery: 90.2,
    status: "Active",
  },
  {
    id: "4",
    name: "MedEquip Solutions",
    rating: 3.9,
    responseTime: "72h",
    deliveryPerformance: "Average",
    priceCompetitiveness: "Low",
    onTimeDelivery: 85.4,
    status: "Under Review",
  },
  {
    id: "5",
    name: "Healthcare Products Co.",
    rating: 4.7,
    responseTime: "24h",
    deliveryPerformance: "Excellent",
    priceCompetitiveness: "High",
    onTimeDelivery: 97.8,
    status: "Active",
  }
];

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof Supplier>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddSupplierDialogOpen, setIsAddSupplierDialogOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSuppliers(mockSuppliers);
      setFilteredSuppliers(mockSuppliers);
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let filtered = suppliers;
    
    if (searchTerm) {
      filtered = filtered.filter(supplier => 
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (activeTab !== "all") {
      filtered = filtered.filter(supplier => 
        activeTab === "active" ? supplier.status === "Active" :
        activeTab === "under-review" ? supplier.status === "Under Review" :
        activeTab === "inactive" ? supplier.status === "Inactive" : true
      );
    }
    
    filtered = [...filtered].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }
      
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc" 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      
      return 0;
    });
    
    setFilteredSuppliers(filtered);
  }, [suppliers, searchTerm, activeTab, sortField, sortDirection]);

  const handleSort = (field: keyof Supplier) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleEditPerformance = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsEditDialogOpen(true);
  };

  const handleSavePerformance = (updatedData: Partial<Supplier>) => {
    setSuppliers(suppliers.map(supplier => 
      supplier.id === selectedSupplier?.id
        ? { ...supplier, ...updatedData }
        : supplier
    ));
  };

  const handleAddSupplier = (newSupplier: Supplier) => {
    setSuppliers([newSupplier, ...suppliers]);
  };

  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            size={14}
            className={cn(
              "mr-0.5",
              index < Math.floor(rating) 
                ? "text-yellow-400 fill-yellow-400" 
                : index < rating 
                  ? "text-yellow-400 fill-yellow-400 opacity-50" 
                  : "text-gray-300"
            )}
          />
        ))}
        <span className="ml-1.5 text-sm font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge variant="outline" className="border-green-500 text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-400">Active</Badge>;
      case "Inactive":
        return <Badge variant="outline" className="border-gray-500 text-gray-600 bg-gray-50 dark:bg-gray-950 dark:text-gray-400">Inactive</Badge>;
      case "Under Review":
        return <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-950 dark:text-amber-400">Under Review</Badge>;
      default:
        return null;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Suppliers</h1>
            <p className="text-muted-foreground">
              Manage supplier information and performance metrics.
            </p>
          </div>
          
          <Button onClick={() => setIsAddSupplierDialogOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add Supplier
          </Button>
        </div>
        
        <SupplierActions />
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Supplier Overview</CardTitle>
            <CardDescription>View and manage your suppliers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search suppliers..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                <TabsList className="grid grid-cols-3 w-full sm:w-auto">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="under-review">Under Review</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            {isLoading ? (
              <div className="h-48 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredSuppliers.length === 0 ? (
              <div className="text-center py-8 border rounded-md">
                <Search className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium mb-1">No suppliers found</h3>
                <p className="text-muted-foreground">Try adjusting your search terms.</p>
              </div>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[220px]">
                        <button 
                          className="flex items-center space-x-1"
                          onClick={() => handleSort("name")}
                        >
                          <span>Supplier</span>
                          <ArrowUpDown size={14} className="ml-1" />
                        </button>
                      </TableHead>
                      <TableHead className="w-[120px]">
                        <button 
                          className="flex items-center space-x-1"
                          onClick={() => handleSort("rating")}
                        >
                          <span>Rating</span>
                          <ArrowUpDown size={14} className="ml-1" />
                        </button>
                      </TableHead>
                      <TableHead className="text-center w-[100px]">Response Time</TableHead>
                      <TableHead className="text-center">Delivery</TableHead>
                      <TableHead className="text-center">Price</TableHead>
                      <TableHead className="text-center">
                        <button 
                          className="flex items-center justify-center space-x-1 mx-auto"
                          onClick={() => handleSort("onTimeDelivery")}
                        >
                          <span>On-Time</span>
                          <ArrowUpDown size={14} className="ml-1" />
                        </button>
                      </TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-center">Performance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSuppliers.map((supplier) => (
                      <TableRow key={supplier.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                        <TableCell className="font-medium">{supplier.name}</TableCell>
                        <TableCell>{renderStarRating(supplier.rating)}</TableCell>
                        <TableCell className="text-center">{supplier.responseTime}</TableCell>
                        <TableCell className="text-center">{supplier.deliveryPerformance}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={supplier.priceCompetitiveness === "High" ? "default" : "secondary"} className="font-normal">
                            {supplier.priceCompetitiveness}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center font-medium">
                          {supplier.onTimeDelivery}%
                        </TableCell>
                        <TableCell className="text-center">{getStatusBadge(supplier.status)}</TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2"
                            onClick={() => handleEditPerformance(supplier)}
                          >
                            <Edit className="h-3.5 w-3.5 mr-1" />
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
        
        <EditPerformanceDialog
          supplier={selectedSupplier}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSave={handleSavePerformance}
        />
        
        <AddSupplierDialog
          open={isAddSupplierDialogOpen}
          onOpenChange={setIsAddSupplierDialogOpen}
          onAddSupplier={handleAddSupplier}
        />
      </div>
    </AppLayout>
  );
}
