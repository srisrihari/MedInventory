/**
 * Real Inventory Management Page - Connected to Backend API
 * Replaces mock data with actual API calls to your FastAPI backend
 */

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
import { Label } from "@/components/ui/label";
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
  BarChart3,
  TrendingUp,
  TrendingDown,
  Download
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { useInventory, useInventoryMutations, getStatusColor, getStatusIcon } from "@/hooks/useInventory";
import { InventoryItem } from "@/lib/api";

// Add/Subtract Stock Dialog Component
function StockAdjustmentDialog({ 
  item, 
  isOpen, 
  onClose, 
  type 
}: { 
  item: InventoryItem | null;
  isOpen: boolean;
  onClose: () => void;
  type: 'add' | 'subtract';
}) {
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(0);
  const [referenceType, setReferenceType] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const { addStock, subtractStock, isAddingStock, isSubtractingStock } = useInventoryMutations();
  
  // Get all items for selection - use a separate hook call
  const { items: allItems, isLoading: itemsLoading, error: itemsError, refetch: refetchItems } = useInventory({ 
    limit: 100,
    skip: 0
  });

  // Debug logging
  useEffect(() => {
    console.log('StockAdjustmentDialog - allItems:', allItems);
    console.log('StockAdjustmentDialog - itemsLoading:', itemsLoading);
    console.log('StockAdjustmentDialog - itemsError:', itemsError);
  }, [allItems, itemsLoading, itemsError]);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedItemId('');
      setQuantity(0);
      setReferenceType('');
      setNotes('');
      // Refetch items when dialog opens to ensure fresh data
      refetchItems();
    }
  }, [isOpen, refetchItems]);

  const handleSubmit = () => {
    const targetItem = item || allItems.find(i => i.id === selectedItemId);
    if (!targetItem || quantity <= 0) return;

    const stockData = {
      itemId: targetItem.id,
      quantity,
      referenceType: referenceType || undefined,
      notes: notes || undefined,
    };

    if (type === 'add') {
      addStock(stockData);
    } else {
      subtractStock(stockData);
    }

    // Reset form and close
    setSelectedItemId('');
    setQuantity(0);
    setReferenceType('');
    setNotes('');
    onClose();
  };

  const targetItem = item || allItems.find(i => i.id === selectedItemId);
  const isLoading = isAddingStock || isSubtractingStock;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{type === 'add' ? '➕ Add Stock' : '➖ Subtract Stock'}</span>
            {!item && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchItems()}
                disabled={itemsLoading}
              >
                <RefreshCw className={`h-4 w-4 ${itemsLoading ? 'animate-spin' : ''}`} />
              </Button>
            )}
          </DialogTitle>
          <DialogDescription>
            {item ? (
              <>
                {type === 'add' ? 'Add inventory to' : 'Subtract inventory from'} {item.name}
                <br />
                Current Quantity: <strong>{item.quantity} {item.unit}</strong>
              </>
            ) : (
              `Select an item to ${type === 'add' ? 'add' : 'subtract'} stock`
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* Item Selection */}
          {!item && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="item" className="text-right">
                Item *
              </Label>
              <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={itemsLoading ? "Loading items..." : "Select an item"} />
                </SelectTrigger>
                <SelectContent>
                  {itemsLoading ? (
                    <SelectItem value="loading" disabled>Loading items...</SelectItem>
                  ) : itemsError ? (
                    <SelectItem value="error" disabled>Error loading items. Please try again.</SelectItem>
                  ) : allItems.length === 0 ? (
                    <SelectItem value="no-items" disabled>No items available</SelectItem>
                  ) : (
                    allItems.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name} - {item.quantity} {item.unit} (₹{item.price || 0})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {itemsError && (
                <div className="col-span-4 text-sm text-red-600">
                  Error loading items: {itemsError.message}
                </div>
              )}
              {!itemsLoading && !itemsError && allItems.length === 0 && (
                <div className="col-span-4 text-sm text-yellow-600">
                  No items found. Please check if inventory data exists.
                </div>
              )}
              {!itemsLoading && !itemsError && allItems.length > 0 && (
                <div className="col-span-4 text-sm text-green-600">
                  Found {allItems.length} items available for selection.
                </div>
              )}
            </div>
          )}
          
          {/* Show form fields when item is selected or pre-selected */}
          {(targetItem || item) && (
            <>
              {/* Item Info Display */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Selected Item</Label>
                <div className="col-span-3 p-2 bg-gray-50 rounded text-sm">
                  <strong>{targetItem?.name || item?.name}</strong>
                  <br />
                  Current Stock: {targetItem?.quantity || item?.quantity} {targetItem?.unit || item?.unit}
                  {targetItem?.price && ` • Price: ₹${targetItem.price}`}
                </div>
              </div>

              {/* Quantity Input */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="quantity" className="text-right">
                  Quantity *
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                  className="col-span-3"
                  min="1"
                  max={type === 'subtract' ? (targetItem?.quantity || item?.quantity || 0) : undefined}
                  required
                  placeholder="Enter quantity"
                />
              </div>
              
              {/* Reference Type */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="reference" className="text-right">
                  Reference Type *
                </Label>
                <Select value={referenceType} onValueChange={setReferenceType}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select reference type" />
                  </SelectTrigger>
                  <SelectContent>
                    {type === 'add' ? (
                      <>
                        <SelectItem value="purchase">Purchase</SelectItem>
                        <SelectItem value="return">Return</SelectItem>
                        <SelectItem value="transfer">Transfer In</SelectItem>
                        <SelectItem value="donation">Donation</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="usage">Patient Usage</SelectItem>
                        <SelectItem value="waste">Waste/Expired</SelectItem>
                        <SelectItem value="transfer">Transfer Out</SelectItem>
                        <SelectItem value="damage">Damaged</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Notes */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">
                  Notes
                </Label>
                <Input
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="col-span-3"
                  placeholder="Optional notes (e.g., patient name, department, reason)"
                />
              </div>

              {/* Bill Generation Notice for Subtraction */}
              {type === 'subtract' && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="col-span-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-800">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm font-medium">Bill Generation</span>
                    </div>
                    <p className="text-sm text-blue-600 mt-1">
                      A bill will be automatically generated for this transaction and can be downloaded from the transaction logs.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!targetItem || quantity <= 0 || !referenceType || isLoading}
            className={type === 'add' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
          >
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                {type === 'add' ? 'Adding...' : 'Subtracting...'}
              </>
            ) : (
              <>
                {type === 'add' ? <TrendingUp className="mr-2 h-4 w-4" /> : <TrendingDown className="mr-2 h-4 w-4" />}
                {type === 'add' ? 'Add Stock' : 'Subtract Stock'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Transaction Logs Component
function TransactionLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for now - this would come from API
  const mockLogs = [
    {
      id: '1',
      itemName: 'Ibuprofen 400mg',
      transactionType: 'subtract',
      quantity: 50,
      referenceType: 'usage',
      notes: 'Patient usage - Emergency Department',
      timestamp: new Date().toISOString(),
      user: 'Dr. Smith',
      billGenerated: true,
      billNumber: 'BILL-001'
    },
    {
      id: '2',
      itemName: 'Paracetamol 500mg',
      transactionType: 'add',
      quantity: 200,
      referenceType: 'purchase',
      notes: 'New stock received from supplier',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      user: 'Admin',
      billGenerated: false
    }
  ];

  useEffect(() => {
    setLogs(mockLogs);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN');
  };

  const downloadBill = (log: any) => {
    // Enhanced bill generation with professional format
    const billContent = `
╔══════════════════════════════════════════════════════════════╗
║                    MEDINVENTORY BILL RECEIPT                ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Bill Number: ${log.billNumber}                              ║
║  Date: ${formatDate(log.timestamp)}                          ║
║  Generated By: ${log.user}                                   ║
║                                                              ║
╠══════════════════════════════════════════════════════════════╣
║  ITEM DETAILS:                                               ║
║                                                              ║
║  Item Name: ${log.itemName}                                  ║
║  Quantity: ${log.quantity} units                             ║
║  Transaction Type: ${log.transactionType.toUpperCase()}      ║
║  Reference: ${log.referenceType}                             ║
║  Notes: ${log.notes}                                         ║
║                                                              ║
╠══════════════════════════════════════════════════════════════╣
║  BILLING INFORMATION:                                        ║
║                                                              ║
║  This is an automated bill generated for inventory          ║
║  transaction. Please keep this receipt for your records.    ║
║                                                              ║
║  For any queries, please contact the hospital               ║
║  administration department.                                  ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
    `;
    
    const blob = new Blob([billContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${log.billNumber}_${log.itemName.replace(/\s+/g, '_')}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Transaction Logs
        </CardTitle>
        <CardDescription>
          Recent inventory additions and subtractions with billing information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {logs.map((log) => (
            <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant={log.transactionType === 'add' ? 'default' : 'destructive'}>
                    {log.transactionType === 'add' ? '➕ Add' : '➖ Subtract'}
                  </Badge>
                  <span className="font-medium">{log.itemName}</span>
                  <span className="text-muted-foreground">({log.quantity} units)</span>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {log.referenceType} • {log.notes} • {formatDate(log.timestamp)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  By: {log.user}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {log.billGenerated && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => downloadBill(log)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Bill
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Inventory() {
  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Dialog states
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isAddStockOpen, setIsAddStockOpen] = useState(false);
  const [isSubtractStockOpen, setIsSubtractStockOpen] = useState(false);

  // API integration
  const { items, total, isLoading, error, refetch } = useInventory({
    search: searchTerm || undefined,
    category: selectedCategory !== "all" ? selectedCategory : undefined,
    status: selectedStatus !== "all" ? selectedStatus : undefined,
    skip: (currentPage - 1) * itemsPerPage,
    limit: itemsPerPage,
  });

  // Calculate statistics from current items
  const calculateStats = () => {
    const totalValue = items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
    const lowStockCount = items.filter(item => item.status === 'low_stock').length;
    const outOfStockCount = items.filter(item => item.status === 'out_of_stock').length;
    const expiredCount = items.filter(item => {
      if (!item.expiry_date) return false;
      return new Date(item.expiry_date) < new Date();
    }).length;

    return { totalValue, lowStockCount, outOfStockCount, expiredCount };
  };

  const stats = calculateStats();

  // Get unique categories and statuses from items
  const categories = [...new Set(items.map(item => item.category))];
  const statuses = [
    { value: 'in_stock', label: 'In Stock' },
    { value: 'low_stock', label: 'Low Stock' },
    { value: 'out_of_stock', label: 'Out of Stock' }
  ];

  // Handle stock adjustment
  const handleStockAdjustment = (item: InventoryItem, type: 'add' | 'subtract') => {
    setSelectedItem(item);
    if (type === 'add') {
      setIsAddStockOpen(true);
    } else {
      setIsSubtractStockOpen(true);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Get status display
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'in_stock':
        return { label: 'In Stock', variant: 'default' as const };
      case 'low_stock':
        return { label: 'Low Stock', variant: 'destructive' as const };
      case 'out_of_stock':
        return { label: 'Out of Stock', variant: 'outline' as const };
      default:
        return { label: status, variant: 'secondary' as const };
    }
  };

  // Pagination
  const totalPages = Math.ceil(total / itemsPerPage);

  if (error) {
    return (
      <AppLayout>
        <div className="container mx-auto py-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center space-x-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <span>Error loading inventory: {error.message}</span>
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
            <h1 className="text-2xl font-bold tracking-tight">Medical Inventory</h1>
            <p className="text-muted-foreground">
              Manage your medical supplies and track stock levels
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsAddStockOpen(true)}>
              <TrendingUp className="mr-2 h-4 w-4" />
              Add Stock
            </Button>
            <Button variant="outline" onClick={() => setIsSubtractStockOpen(true)}>
              <TrendingDown className="mr-2 h-4 w-4" />
              Subtract Stock
            </Button>
            <Button onClick={() => refetch()}>
              <RefreshCw className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Items"
            value={total.toString()}
            description="Medical inventory items"
            icon={Package}
          />
          <StatsCard
            title="Total Value"
            value={formatCurrency(stats.totalValue)}
            description="Current stock value"
            icon={IndianRupee}
          />
          <StatsCard
            title="Low Stock Alerts"
            value={stats.lowStockCount.toString()}
            description="Items need reordering"
            icon={AlertCircle}
            trend={stats.lowStockCount > 0 ? "negative" : "positive"}
          />
          <StatsCard
            title="Out of Stock"
            value={stats.outOfStockCount.toString()}
            description="Items completely out"
            icon={BarChart3}
            trend={stats.outOfStockCount > 0 ? "negative" : "positive"}
          />
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory Items</CardTitle>
            <CardDescription>
              Showing {items.length} of {total} medical inventory items
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search items, IDs, or batch numbers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {statuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Inventory Table */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        <RefreshCw className="mx-auto h-4 w-4 animate-spin" />
                        <p className="mt-2 text-sm text-muted-foreground">Loading inventory...</p>
                      </TableCell>
                    </TableRow>
                  ) : items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        <Package className="mx-auto h-4 w-4 text-muted-foreground" />
                        <p className="mt-2 text-sm text-muted-foreground">No inventory items found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((item) => {
                      const statusDisplay = getStatusDisplay(item.status);
                      return (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{item.name}</div>
                              <div className="text-sm text-muted-foreground">
                                Batch: {item.batch_id || 'N/A'}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{item.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <span className="font-medium">{item.quantity}</span>
                              <span className="text-sm text-muted-foreground ml-1">
                                {item.unit}
                              </span>
                            </div>
                            {item.reorder_level && item.quantity <= item.reorder_level && (
                              <div className="text-xs text-orange-600">
                                Reorder Level: {item.reorder_level}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusDisplay.variant}>
                              {getStatusIcon(item.status)} {statusDisplay.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {item.price ? formatCurrency(item.price) : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {item.expiry_date ? (
                              <div className={cn(
                                "text-sm",
                                new Date(item.expiry_date) < new Date() 
                                  ? "text-red-600 font-medium" 
                                  : new Date(item.expiry_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                                  ? "text-orange-600"
                                  : "text-muted-foreground"
                              )}>
                                {formatDate(item.expiry_date)}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">N/A</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {item.location || 'Not specified'}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Stock Actions</DropdownMenuLabel>
                                <DropdownMenuItem
                                  onClick={() => handleStockAdjustment(item, 'add')}
                                  className="text-green-600"
                                >
                                  <TrendingUp className="mr-2 h-4 w-4" />
                                  Add Stock
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleStockAdjustment(item, 'subtract')}
                                  className="text-red-600"
                                >
                                  <TrendingDown className="mr-2 h-4 w-4" />
                                  Subtract Stock
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Item
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <FileText className="mr-2 h-4 w-4" />
                                  View History
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                  {Math.min(currentPage * itemsPerPage, total)} of {total} items
                </div>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        className={cn(
                          currentPage === 1 && "pointer-events-none opacity-50"
                        )}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setCurrentPage(page)}
                            isActive={currentPage === page}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        className={cn(
                          currentPage === totalPages && "pointer-events-none opacity-50"
                        )}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stock Adjustment Dialogs */}
        <StockAdjustmentDialog
          item={selectedItem}
          isOpen={isAddStockOpen}
          onClose={() => {
            setIsAddStockOpen(false);
            setSelectedItem(null);
          }}
          type="add"
        />
        
        <StockAdjustmentDialog
          item={selectedItem}
          isOpen={isSubtractStockOpen}
          onClose={() => {
            setIsSubtractStockOpen(false);
            setSelectedItem(null);
          }}
          type="subtract"
        />

        {/* Transaction Logs */}
        <TransactionLogs />
      </div>
    </AppLayout>
  );
}