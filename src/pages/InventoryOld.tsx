
import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { 
  Package, 
  Plus, 
  Search, 
  RefreshCw, 
  MoreVertical, 
  Edit, 
  Trash2, 
  FileText,
  Filter,
  ArrowUpDown,
  Calendar,
  Tag,
  AlertCircle,
  IndianRupee,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatsCard } from "@/components/dashboard/StatsCard";

// Define the allowed status types
type InventoryStatus = "In Stock" | "Low Stock" | "Out of Stock";

// Mock data for inventory items - updated to include batchId
const mockInventoryItems = [
  {
    id: "INV001",
    name: "Paracetamol 500mg",
    category: "Pain Relief",
    quantity: 2500,
    unit: "Tablets",
    batchNumber: "BATCH-123",
    batchId: "B123",
    expiryDate: "2024-12-15",
    supplier: "MediTech Pharmaceuticals",
    price: 0.15,
    location: "Warehouse A, Shelf 3",
    status: "In Stock" as InventoryStatus,
    reorderLevel: 500,
    lastUpdated: "2023-11-01"
  },
  {
    id: "INV002",
    name: "Paracetamol 500mg",
    category: "Pain Relief",
    quantity: 1500,
    unit: "Tablets",
    batchNumber: "BATCH-124",
    batchId: "B124",
    expiryDate: "2024-10-15",
    supplier: "MediTech Pharmaceuticals",
    price: 0.15,
    location: "Warehouse A, Shelf 3",
    status: "In Stock" as InventoryStatus,
    reorderLevel: 500,
    lastUpdated: "2023-11-01"
  },
  {
    id: "INV003",
    name: "Amoxicillin 250mg",
    category: "Antibiotics",
    quantity: 1800,
    unit: "Capsules",
    batchNumber: "BATCH-456",
    batchId: "B456",
    expiryDate: "2024-01-10",
    supplier: "Global Health Supplies",
    price: 0.28,
    location: "Warehouse A, Shelf 5",
    status: "Low Stock" as InventoryStatus,
    reorderLevel: 2000,
    lastUpdated: "2023-10-25"
  },
  {
    id: "INV004",
    name: "Insulin Glargine",
    category: "Diabetes",
    quantity: 500,
    unit: "Vials",
    batchNumber: "BATCH-789",
    batchId: "B789",
    expiryDate: "2023-12-28",
    supplier: "PharmaPlus Inc.",
    price: 35.99,
    location: "Cold Storage, Section 2",
    status: "In Stock" as InventoryStatus,
    reorderLevel: 100,
    lastUpdated: "2023-11-02"
  },
  {
    id: "INV005",
    name: "Vitamin B Complex",
    category: "Supplements",
    quantity: 1200,
    unit: "Tablets",
    batchNumber: "BATCH-012",
    batchId: "B012",
    expiryDate: "2023-12-08",
    supplier: "Healthcare Products Co.",
    price: 0.10,
    location: "Warehouse B, Shelf 1",
    status: "In Stock" as InventoryStatus,
    reorderLevel: 300,
    lastUpdated: "2023-10-20"
  },
  {
    id: "INV006",
    name: "Hydrocortisone Cream",
    category: "Topical",
    quantity: 800,
    unit: "Tubes",
    batchNumber: "BATCH-345",
    batchId: "B345",
    expiryDate: "2024-02-15",
    supplier: "MediTech Pharmaceuticals",
    price: 4.75,
    location: "Warehouse A, Shelf 7",
    status: "In Stock" as InventoryStatus,
    reorderLevel: 200,
    lastUpdated: "2023-11-05"
  },
  {
    id: "INV007",
    name: "Ibuprofen 400mg",
    category: "Pain Relief",
    quantity: 150,
    unit: "Tablets",
    batchNumber: "BATCH-678",
    batchId: "B678",
    expiryDate: "2024-03-20",
    supplier: "Global Health Supplies",
    price: 0.18,
    location: "Warehouse A, Shelf 3",
    status: "Low Stock" as InventoryStatus,
    reorderLevel: 300,
    lastUpdated: "2023-10-30"
  },
  {
    id: "INV008",
    name: "Metformin 500mg",
    category: "Diabetes",
    quantity: 3200,
    unit: "Tablets",
    batchNumber: "BATCH-901",
    batchId: "B901",
    expiryDate: "2024-06-12",
    supplier: "PharmaPlus Inc.",
    price: 0.12,
    location: "Warehouse B, Shelf 4",
    status: "In Stock" as InventoryStatus,
    reorderLevel: 500,
    lastUpdated: "2023-11-03"
  },
  {
    id: "INV009",
    name: "Azithromycin 500mg",
    category: "Antibiotics",
    quantity: 0,
    unit: "Tablets",
    batchNumber: "BATCH-234",
    batchId: "B234",
    expiryDate: "2024-04-30",
    supplier: "MediTech Pharmaceuticals",
    price: 0.95,
    location: "Warehouse A, Shelf 6",
    status: "Out of Stock" as InventoryStatus,
    reorderLevel: 100,
    lastUpdated: "2023-10-15"
  },
  {
    id: "INV010",
    name: "Vitamin B Complex",
    category: "Supplements",
    quantity: 800,
    unit: "Tablets",
    batchNumber: "BATCH-013",
    batchId: "B013",
    expiryDate: "2024-01-15",
    supplier: "Healthcare Products Co.",
    price: 0.10,
    location: "Warehouse B, Shelf 1",
    status: "In Stock" as InventoryStatus,
    reorderLevel: 300,
    lastUpdated: "2023-11-10"
  }
];

// Inventory form interfaces
interface InventoryFormData {
  id?: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  batchNumber: string;
  batchId: string;
  expiryDate: string;
  supplier: string;
  price: number;
  location: string;
  reorderLevel: number;
}

// Item interface
interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  batchNumber: string;
  batchId: string;
  expiryDate: string;
  supplier: string;
  price: number;
  location: string;
  status: InventoryStatus;
  reorderLevel: number;
  lastUpdated: string;
}

export default function Inventory() {
  const { toast } = useToast();
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(mockInventoryItems);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof InventoryItem>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [itemsPerPage] = useState(5);
  
  // Form state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState<InventoryFormData>({
    name: "",
    category: "",
    quantity: 0,
    unit: "Tablets",
    batchNumber: "",
    batchId: "",
    expiryDate: "",
    supplier: "",
    price: 0,
    location: "",
    reorderLevel: 0
  });

  // Calculate inventory stats
  const calculateInventoryStats = () => {
    const totalStockValue = inventoryItems.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);

    const lowStockCount = inventoryItems.filter(item => 
      item.status === "Low Stock" || item.quantity <= item.reorderLevel
    ).length;

    const today = new Date();
    const expiredCount = inventoryItems.filter(item => {
      const expiryDate = new Date(item.expiryDate);
      return expiryDate < today;
    }).length;

    return {
      totalStockValue,
      lowStockCount,
      expiredCount
    };
  };

  const inventoryStats = calculateInventoryStats();

  // Extract unique categories from inventory items
  const categories = [...new Set(inventoryItems.map(item => item.category))];
  
  // Extract unique statuses from inventory items
  const statuses = [...new Set(inventoryItems.map(item => item.status))];

  // Handle sorting
  const handleSort = (field: keyof InventoryItem) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Filter inventory items based on search, category, and status
  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.batchId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesStatus = selectedStatus === "all" || item.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Sort filtered items
  const sortedItems = [...filteredItems].sort((a, b) => {
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

  // Pagination logic
  const totalPages = Math.ceil(sortedItems.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedItems.slice(indexOfFirstItem, indexOfLastItem);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Reset form data
  const resetFormData = () => {
    setFormData({
      name: "",
      category: "",
      quantity: 0,
      unit: "Tablets",
      batchNumber: "",
      batchId: "",
      expiryDate: "",
      supplier: "",
      price: 0,
      location: "",
      reorderLevel: 0
    });
  };

  // Handle form input changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "quantity" || name === "price" || name === "reorderLevel" 
        ? parseFloat(value) || 0 
        : value
    }));
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Determine the status based on quantity and reorder level
  const determineStatus = (quantity: number, reorderLevel: number): InventoryStatus => {
    if (quantity === 0) return "Out of Stock";
    if (quantity <= reorderLevel) return "Low Stock";
    return "In Stock";
  };

  // Add new inventory item
  const handleAddItem = () => {
    const newItem: InventoryItem = {
      id: `INV${Math.floor(Math.random() * 10000).toString().padStart(3, '0')}`,
      ...formData,
      status: determineStatus(formData.quantity, formData.reorderLevel),
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    
    setInventoryItems([...inventoryItems, newItem]);
    setIsAddDialogOpen(false);
    resetFormData();
    
    toast({
      title: "Item Added",
      description: `${newItem.name} has been added to inventory.`,
    });
  };

  // Edit inventory item
  const handleEditItem = () => {
    if (!selectedItem) return;
    
    const updatedItems = inventoryItems.map(item => {
      if (item.id === selectedItem.id) {
        return {
          ...item,
          ...formData,
          status: determineStatus(formData.quantity, formData.reorderLevel),
          lastUpdated: new Date().toISOString().split('T')[0]
        };
      }
      return item;
    });
    
    setInventoryItems(updatedItems);
    setIsEditDialogOpen(false);
    setSelectedItem(null);
    resetFormData();
    
    toast({
      title: "Item Updated",
      description: `${formData.name} has been updated.`,
    });
  };

  // Delete inventory item
  const handleDeleteItem = () => {
    if (!selectedItem) return;
    
    const updatedItems = inventoryItems.filter(item => item.id !== selectedItem.id);
    setInventoryItems(updatedItems);
    setIsDeleteDialogOpen(false);
    setSelectedItem(null);
    
    toast({
      title: "Item Deleted",
      description: `${selectedItem.name} has been removed from inventory.`,
      variant: "destructive",
    });
  };

  // Open edit dialog with selected item data
  const openEditDialog = (item: InventoryItem) => {
    setSelectedItem(item);
    setFormData({
      id: item.id,
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      batchNumber: item.batchNumber,
      batchId: item.batchId,
      expiryDate: item.expiryDate,
      supplier: item.supplier,
      price: item.price,
      location: item.location,
      reorderLevel: item.reorderLevel
    });
    setIsEditDialogOpen(true);
  };

  // Open delete dialog with selected item
  const openDeleteDialog = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  };

  // Get status badge
  const getStatusBadge = (status: InventoryStatus) => {
    switch (status) {
      case "In Stock":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">In Stock</Badge>;
      case "Low Stock":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800">Low Stock</Badge>;
      case "Out of Stock":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">Out of Stock</Badge>;
      default:
        return null;
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };

  // Format currency for display
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(value);
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Inventory Management</h1>
            <p className="text-muted-foreground">
              Manage and track your hospital inventory items.
            </p>
          </div>
          
          <div className="flex space-x-2">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                  <DialogTitle>Add New Inventory Item</DialogTitle>
                  <DialogDescription>
                    Enter the details of the new inventory item. Click save when you're done.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">Name</label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Medicine name"
                        value={formData.name}
                        onChange={handleFormChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="category" className="text-sm font-medium">Category</label>
                      <Input
                        id="category"
                        name="category"
                        placeholder="Medicine category"
                        value={formData.category}
                        onChange={handleFormChange}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="quantity" className="text-sm font-medium">Quantity</label>
                      <Input
                        id="quantity"
                        name="quantity"
                        type="number"
                        placeholder="0"
                        value={formData.quantity}
                        onChange={handleFormChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="unit" className="text-sm font-medium">Unit</label>
                      <Select 
                        value={formData.unit} 
                        onValueChange={(value) => handleSelectChange("unit", value)}
                      >
                        <SelectTrigger id="unit">
                          <SelectValue placeholder="Select a unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Tablets">Tablets</SelectItem>
                          <SelectItem value="Capsules">Capsules</SelectItem>
                          <SelectItem value="Vials">Vials</SelectItem>
                          <SelectItem value="Ampoules">Ampoules</SelectItem>
                          <SelectItem value="Bottles">Bottles</SelectItem>
                          <SelectItem value="Tubes">Tubes</SelectItem>
                          <SelectItem value="Patches">Patches</SelectItem>
                          <SelectItem value="Inhalers">Inhalers</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="batchNumber" className="text-sm font-medium">Batch Number</label>
                      <Input
                        id="batchNumber"
                        name="batchNumber"
                        placeholder="BATCH-XXX"
                        value={formData.batchNumber}
                        onChange={handleFormChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="batchId" className="text-sm font-medium">Batch ID</label>
                      <Input
                        id="batchId"
                        name="batchId"
                        placeholder="B123"
                        value={formData.batchId}
                        onChange={handleFormChange}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="expiryDate" className="text-sm font-medium">Expiry Date</label>
                      <Input
                        id="expiryDate"
                        name="expiryDate"
                        type="date"
                        value={formData.expiryDate}
                        onChange={handleFormChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="supplier" className="text-sm font-medium">Supplier</label>
                      <Input
                        id="supplier"
                        name="supplier"
                        placeholder="Supplier name"
                        value={formData.supplier}
                        onChange={handleFormChange}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="price" className="text-sm font-medium">Price</label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.price}
                        onChange={handleFormChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="location" className="text-sm font-medium">Storage Location</label>
                      <Input
                        id="location"
                        name="location"
                        placeholder="Warehouse A, Shelf 1"
                        value={formData.location}
                        onChange={handleFormChange}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="reorderLevel" className="text-sm font-medium">Reorder Level</label>
                    <Input
                      id="reorderLevel"
                      name="reorderLevel"
                      type="number"
                      placeholder="0"
                      value={formData.reorderLevel}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsAddDialogOpen(false);
                      resetFormData();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddItem}>Save</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Button variant="outline" size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Inventory Stats Cards */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          <StatsCard
            title="Total Stock Value"
            value={formatCurrency(inventoryStats.totalStockValue)}
            description="total inventory worth"
            icon={IndianRupee}
            className="hover-scale"
          />
          <StatsCard
            title="Low Stock Items"
            value={inventoryStats.lowStockCount.toString()}
            description="items below reorder level"
            icon={AlertCircle}
            className="hover-scale"
            percentageChange={inventoryStats.lowStockCount > 0 ? -12.5 : 0}
          />
          <StatsCard
            title="Expired Items"
            value={inventoryStats.expiredCount.toString()}
            description="items past expiry date"
            icon={BarChart3}
            className="hover-scale"
            percentageChange={inventoryStats.expiredCount > 0 ? -5.2 : 0}
          />
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium">Inventory Items</CardTitle>
            <CardDescription>Manage your inventory items including medicines, supplies, and equipment.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row justify-between mb-6 space-y-3 md:space-y-0 md:space-x-3">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, ID, batch, or supplier..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <div className="w-full sm:w-40">
                  <Select 
                    value={selectedCategory} 
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger>
                      <div className="flex items-center">
                        <Tag className="mr-2 h-4 w-4" />
                        <span>Category</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full sm:w-40">
                  <Select 
                    value={selectedStatus} 
                    onValueChange={setSelectedStatus}
                  >
                    <SelectTrigger>
                      <div className="flex items-center">
                        <Filter className="mr-2 h-4 w-4" />
                        <span>Status</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      {statuses.map((status) => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">ID</TableHead>
                    <TableHead>
                      <button 
                        className="flex items-center font-semibold"
                        onClick={() => handleSort("name")}
                      >
                        Product Name
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      </button>
                    </TableHead>
                    <TableHead>
                      <button 
                        className="flex items-center font-semibold"
                        onClick={() => handleSort("batchId")}
                      >
                        Batch ID
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      </button>
                    </TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>
                      <button 
                        className="flex items-center font-semibold"
                        onClick={() => handleSort("quantity")}
                      >
                        Quantity
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      </button>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-4 w-4" />
                        <button 
                          className="flex items-center font-semibold"
                          onClick={() => handleSort("expiryDate")}
                        >
                          Expiry Date
                          <ArrowUpDown className="ml-1 h-4 w-4" />
                        </button>
                      </div>
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">
                        No inventory items found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentItems.map((item) => (
                      <TableRow key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <TableCell className="font-medium">{item.id}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-normal bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
                            {item.batchId}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-normal">
                            {item.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {item.quantity} {item.unit}
                        </TableCell>
                        <TableCell>{formatDate(item.expiryDate)}</TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => openEditDialog(item)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openDeleteDialog(item)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <FileText className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            
            {/* Fixed pagination layout at the bottom */}
            {totalPages > 1 && (
              <div className="mt-4 flex justify-center">
                <Pagination>
                  <PaginationContent className="flex items-center">
                    <PaginationItem>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => paginate(Math.max(currentPage - 1, 1))}
                        disabled={currentPage === 1}
                        className={currentPage === 1 ? "opacity-50" : ""}
                      >
                        <PaginationPrevious className="h-4 w-4" />
                      </Button>
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => paginate(page)}
                          isActive={page === currentPage}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => paginate(Math.min(currentPage + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={currentPage === totalPages ? "opacity-50" : ""}
                      >
                        <PaginationNext className="h-4 w-4" />
                      </Button>
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Edit Inventory Item</DialogTitle>
              <DialogDescription>
                Update the details of the selected inventory item.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="edit-name" className="text-sm font-medium">Name</label>
                  <Input
                    id="edit-name"
                    name="name"
                    placeholder="Medicine name"
                    value={formData.name}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-category" className="text-sm font-medium">Category</label>
                  <Input
                    id="edit-category"
                    name="category"
                    placeholder="Medicine category"
                    value={formData.category}
                    onChange={handleFormChange}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="edit-quantity" className="text-sm font-medium">Quantity</label>
                  <Input
                    id="edit-quantity"
                    name="quantity"
                    type="number"
                    placeholder="0"
                    value={formData.quantity}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-unit" className="text-sm font-medium">Unit</label>
                  <Select 
                    value={formData.unit} 
                    onValueChange={(value) => handleSelectChange("unit", value)}
                  >
                    <SelectTrigger id="edit-unit">
                      <SelectValue placeholder="Select a unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tablets">Tablets</SelectItem>
                      <SelectItem value="Capsules">Capsules</SelectItem>
                      <SelectItem value="Vials">Vials</SelectItem>
                      <SelectItem value="Ampoules">Ampoules</SelectItem>
                      <SelectItem value="Bottles">Bottles</SelectItem>
                      <SelectItem value="Tubes">Tubes</SelectItem>
                      <SelectItem value="Patches">Patches</SelectItem>
                      <SelectItem value="Inhalers">Inhalers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="edit-batchNumber" className="text-sm font-medium">Batch Number</label>
                  <Input
                    id="edit-batchNumber"
                    name="batchNumber"
                    placeholder="BATCH-XXX"
                    value={formData.batchNumber}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-batchId" className="text-sm font-medium">Batch ID</label>
                  <Input
                    id="edit-batchId"
                    name="batchId"
                    placeholder="B123"
                    value={formData.batchId}
                    onChange={handleFormChange}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="edit-expiryDate" className="text-sm font-medium">Expiry Date</label>
                  <Input
                    id="edit-expiryDate"
                    name="expiryDate"
                    type="date"
                    value={formData.expiryDate}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-supplier" className="text-sm font-medium">Supplier</label>
                  <Input
                    id="edit-supplier"
                    name="supplier"
                    placeholder="Supplier name"
                    value={formData.supplier}
                    onChange={handleFormChange}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="edit-price" className="text-sm font-medium">Price</label>
                  <Input
                    id="edit-price"
                    name="price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-location" className="text-sm font-medium">Storage Location</label>
                  <Input
                    id="edit-location"
                    name="location"
                    placeholder="Warehouse A, Shelf 1"
                    value={formData.location}
                    onChange={handleFormChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-reorderLevel" className="text-sm font-medium">Reorder Level</label>
                <Input
                  id="edit-reorderLevel"
                  name="reorderLevel"
                  type="number"
                  placeholder="0"
                  value={formData.reorderLevel}
                  onChange={handleFormChange}
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setSelectedItem(null);
                  resetFormData();
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleEditItem}>Update</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this inventory item? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {selectedItem && (
                <div className="p-4 border rounded-md">
                  <p className="font-medium">{selectedItem.name}</p>
                  <p className="text-sm text-muted-foreground">ID: {selectedItem.id}</p>
                  <p className="text-sm text-muted-foreground">Batch ID: {selectedItem.batchId}</p>
                  <p className="text-sm text-muted-foreground">Category: {selectedItem.category}</p>
                  <p className="text-sm text-muted-foreground">Quantity: {selectedItem.quantity} {selectedItem.unit}</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setSelectedItem(null);
                }}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteItem}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
