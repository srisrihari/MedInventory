import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Calendar as CalendarIcon, Filter, Search, Bell, FileText, AlertTriangle, Check, X, Edit, Trash2, ChevronDown, ArrowUpDown, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { expiryAPI } from "@/lib/api";

interface MedicineItem {
  id: string;
  name: string;
  category: string;
  batch_number: string;
  expiry_date: string;
  quantity: number;
  supplier: string;
  location: string;
  alert_days: number;
  alert_enabled: boolean;
  extended_date?: string;
  notes?: string;
  expiry_status: "expired" | "expiring-soon" | "ok";
  days_until_expiry: number;
  days_text: string;
}

interface AlertSettings {
  id: string;
  medicine_id: string;
  medicine_name: string;
  days_before_expiry: number;
  enabled: boolean;
  notification_type: "email" | "app" | "both";
  created_at: string;
}

export default function Expiry() {
  const { toast } = useToast();
  const [medicines, setMedicines] = useState<MedicineItem[]>([]);
  const [alerts, setAlerts] = useState<AlertSettings[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortField, setSortField] = useState<keyof MedicineItem>("expiry_date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [activeTab, setActiveTab] = useState("all");
  
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isExtendDialogOpen, setIsExtendDialogOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<MedicineItem | null>(null);
  const [newExpiryDate, setNewExpiryDate] = useState<Date | undefined>(undefined);
  const [extendedExpiryDate, setExtendedExpiryDate] = useState<Date | undefined>(undefined);
  const [extendNotes, setExtendNotes] = useState("");
  const [alertDays, setAlertDays] = useState(30);
  const [notificationType, setNotificationType] = useState<"email" | "app" | "both">("both");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const medicinesData = await expiryAPI.getMedicines();
        setMedicines(medicinesData);

        const alertsData = await expiryAPI.getAlerts();
        setAlerts(alertsData);
      } catch (error) {
        toast({
          title: "Error fetching data",
          description: "Failed to load medicines or alerts. Please try again later.",
          variant: "destructive",
        });
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, [toast]);

  const categories = Array.from(new Set(medicines.map(med => med.category)));

  const getExpiryStatus = (expiryDate: string, extendedDate?: string): "expired" | "expiring-soon" | "ok" => {
    const today = new Date();
    const dateToCheck = extendedDate || expiryDate;
    const expiry = new Date(dateToCheck);
    
    if (expiry < today) {
      return "expired";
    }
    
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    if (expiry <= thirtyDaysFromNow) {
      return "expiring-soon";
    }
    
    return "ok";
  };

  const getExpiryBadge = (medicine: MedicineItem) => {
    const status = getExpiryStatus(medicine.expiry_date, medicine.extended_date);
    
    switch (status) {
      case "expired":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
            Expired
          </Badge>
        );
      case "expiring-soon":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800">
            Expiring Soon
          </Badge>
        );
      case "ok":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
            Good
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "MMM dd, yyyy");
  };

  const getDaysUntilExpiry = (expiryDate: string, extendedDate?: string) => {
    const today = new Date();
    const dateToCheck = extendedDate || expiryDate;
    const expiry = new Date(dateToCheck);
    
    const differenceInTime = expiry.getTime() - today.getTime();
    const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));
    
    return differenceInDays;
  };

  const handleSort = (field: keyof MedicineItem) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredMedicines = medicines.filter(medicine => {
    const matchesSearch = 
      medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medicine.batch_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medicine.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || medicine.category === selectedCategory;
    
    const status = getExpiryStatus(medicine.expiry_date, medicine.extended_date);
    const matchesStatus = selectedStatus === "all" || 
      (selectedStatus === "expired" && status === "expired") ||
      (selectedStatus === "expiring-soon" && status === "expiring-soon") ||
      (selectedStatus === "ok" && status === "ok");
    
    const matchesTab = activeTab === "all" || 
      (activeTab === "expired" && status === "expired") ||
      (activeTab === "expiring-soon" && status === "expiring-soon") ||
      (activeTab === "with-alerts" && medicine.alert_enabled);
    
    return matchesSearch && matchesCategory && matchesStatus && matchesTab;
  });

  const sortedMedicines = [...filteredMedicines].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];
    
    if (sortField === "expiry_date") {
      aValue = a.extended_date || a.expiry_date;
      bValue = b.extended_date || b.expiry_date;
      
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }
    
    if (sortDirection === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const expiredCount = medicines.filter(med => 
    getExpiryStatus(med.expiry_date, med.extended_date) === "expired"
  ).length;
  
  const expiringSoonCount = medicines.filter(med => 
    getExpiryStatus(med.expiry_date, med.extended_date) === "expiring-soon"
  ).length;
  
  const alertsEnabledCount = medicines.filter(med => med.alert_enabled).length;

  const handleSetAlert = async () => {
    if (!selectedMedicine) return;
    
    const existingAlertIndex = alerts.findIndex(a => a.medicine_id === selectedMedicine.id);
    
    if (existingAlertIndex >= 0) {
      await api.updateAlert(alerts[existingAlertIndex].id, alertDays, notificationType);
      const updatedAlerts = [...alerts];
      updatedAlerts[existingAlertIndex] = {
        ...updatedAlerts[existingAlertIndex],
        days_before_expiry: alertDays,
        notification_type: notificationType,
        enabled: true,
      };
      setAlerts(updatedAlerts);
    } else {
      await api.createAlert(selectedMedicine.id, alertDays, notificationType);
      const newAlert: AlertSettings = {
        id: `ALERT${Math.floor(Math.random() * 10000).toString().padStart(3, '0')}`,
        medicine_id: selectedMedicine.id,
        medicine_name: selectedMedicine.name,
        days_before_expiry: alertDays,
        enabled: true,
        notification_type: notificationType,
        created_at: new Date().toISOString(),
      };
      setAlerts([...alerts, newAlert]);
    }
    
    const updatedMedicines = medicines.map(med => {
      if (med.id === selectedMedicine.id) {
        return {
          ...med,
          alert_days: alertDays,
          alert_enabled: true,
        };
      }
      return med;
    });
    
    setMedicines(updatedMedicines);
    setIsAlertDialogOpen(false);
    
    toast({
      title: "Alert Set",
      description: `Alert has been set for ${selectedMedicine.name}. You will be notified ${alertDays} days before expiry.`,
    });
  };

  const handleUpdateExpiryDate = async () => {
    if (!selectedMedicine || !newExpiryDate) return;
    
    await api.updateMedicine(selectedMedicine.id, newExpiryDate.toISOString().split('T')[0]);
    const updatedMedicines = medicines.map(med => {
      if (med.id === selectedMedicine.id) {
        return {
          ...med,
          expiry_date: newExpiryDate.toISOString().split('T')[0],
        };
      }
      return med;
    });
    
    setMedicines(updatedMedicines);
    setIsEditDialogOpen(false);
    setNewExpiryDate(undefined);
    
    toast({
      title: "Expiry Date Updated",
      description: `Expiry date for ${selectedMedicine.name} has been updated to ${format(newExpiryDate, "MMM dd, yyyy")}.`,
    });
  };

  const handleExtendShelfLife = async () => {
    if (!selectedMedicine || !extendedExpiryDate) return;
    
    await api.extendShelfLife(selectedMedicine.id, extendedExpiryDate.toISOString().split('T')[0], extendNotes);
    const updatedMedicines = medicines.map(med => {
      if (med.id === selectedMedicine.id) {
        return {
          ...med,
          extended_date: extendedExpiryDate.toISOString().split('T')[0],
          notes: extendNotes,
        };
      }
      return med;
    });
    
    setMedicines(updatedMedicines);
    setIsExtendDialogOpen(false);
    setExtendedExpiryDate(undefined);
    setExtendNotes("");
    
    toast({
      title: "Shelf Life Extended",
      description: `Shelf life for ${selectedMedicine.name} has been extended to ${format(extendedExpiryDate, "MMM dd, yyyy")}.`,
    });
  };

  const handleToggleAlert = async (medicine: MedicineItem) => {
    const updatedMedicines = medicines.map(med => {
      if (med.id === medicine.id) {
        return {
          ...med,
          alert_enabled: !med.alert_enabled,
        };
      }
      return med;
    });
    
    setMedicines(updatedMedicines);
    
    const alertIndex = alerts.findIndex(a => a.medicine_id === medicine.id);
    if (alertIndex >= 0) {
      await api.updateAlert(alerts[alertIndex].id, medicine.alert_enabled ? 0 : 30, "both"); // Disable alert
      const updatedAlerts = [...alerts];
      updatedAlerts[alertIndex] = {
        ...updatedAlerts[alertIndex],
        enabled: !medicine.alert_enabled,
      };
      setAlerts(updatedAlerts);
    }
    
    toast({
      title: medicine.alert_enabled ? "Alert Disabled" : "Alert Enabled",
      description: `Expiry alert for ${medicine.name} has been ${medicine.alert_enabled ? "disabled" : "enabled"}.`,
    });
  };

  const handleRemoveExtendedDate = async (medicine: MedicineItem) => {
    await api.removeExtendedDate(medicine.id);
    const updatedMedicines = medicines.map(med => {
      if (med.id === medicine.id) {
        const { extended_date, notes, ...rest } = med;
        return rest;
      }
      return med;
    });
    
    setMedicines(updatedMedicines);
    
    toast({
      title: "Extension Removed",
      description: `Extended expiry date for ${medicine.name} has been removed.`,
      variant: "destructive",
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Expiry Tracking</h1>
            <p className="text-muted-foreground">
              Monitor and manage items approaching their expiration date.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Expired Items</p>
                  <h3 className="text-2xl font-bold mt-1">{expiredCount}</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => setActiveTab("expired")}
                >
                  View Expired Items
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Expiring Soon</p>
                  <h3 className="text-2xl font-bold mt-1">{expiringSoonCount}</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
                  <CalendarDays className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => setActiveTab("expiring-soon")}
                >
                  View Items Expiring Soon
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Alerts</p>
                  <h3 className="text-2xl font-bold mt-1">{alertsEnabledCount}</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <Bell className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => setActiveTab("with-alerts")}
                >
                  View Items With Alerts
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Alert Management Section */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Bell className="h-5 w-5" />
              Smart Alert Management
            </CardTitle>
            <CardDescription>
              Set up intelligent alerts for items approaching expiry. Get notified before items expire to prevent waste.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Quick Alert Setup */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Quick Alert Setup</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setAlertDays(30);
                        setNotificationType("both");
                        setIsAlertDialogOpen(true);
                      }}
                    >
                      <Bell className="h-4 w-4 mr-2" />
                      Set 30-Day Alert
                    </Button>
                    <span className="text-xs text-muted-foreground">Most common</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setAlertDays(15);
                        setNotificationType("both");
                        setIsAlertDialogOpen(true);
                      }}
                    >
                      <Bell className="h-4 w-4 mr-2" />
                      Set 15-Day Alert
                    </Button>
                    <span className="text-xs text-muted-foreground">Critical items</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setAlertDays(7);
                        setNotificationType("both");
                        setIsAlertDialogOpen(true);
                      }}
                    >
                      <Bell className="h-4 w-4 mr-2" />
                      Set 7-Day Alert
                    </Button>
                    <span className="text-xs text-muted-foreground">Emergency items</span>
                  </div>
                </div>
              </div>

              {/* Alert Statistics */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Alert Statistics</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Active Alerts:</span>
                    <span className="font-medium">{alertsEnabledCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Items Expiring Soon:</span>
                    <span className="font-medium text-amber-600">{expiringSoonCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expired Items:</span>
                    <span className="font-medium text-red-600">{expiredCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Items:</span>
                    <span className="font-medium">{medicines.length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Alert Recommendations */}
            <div className="mt-4 p-3 bg-blue-100 rounded-lg">
              <h5 className="font-medium text-sm text-blue-800 mb-2">💡 Smart Alert Recommendations:</h5>
              <div className="text-xs text-blue-700 space-y-1">
                <div>• <strong>30 days:</strong> Standard items, allows time for reordering</div>
                <div>• <strong>15 days:</strong> Critical medications, requires immediate attention</div>
                <div>• <strong>7 days:</strong> Emergency items, last chance to use or dispose</div>
                <div>• <strong>Custom:</strong> Set specific days based on your workflow</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Expiry Management</CardTitle>
            <CardDescription>Track and manage medicine expiry dates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search medicines..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Select 
                  value={selectedCategory} 
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="w-[160px]">
                    <div className="flex items-center">
                      <Filter className="mr-2 h-4 w-4" />
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
                <Select 
                  value={selectedStatus} 
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger className="w-[160px]">
                    <div className="flex items-center">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      <span>Status</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="expiring-soon">Expiring Soon</SelectItem>
                    <SelectItem value="ok">Good</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full mb-4">
                <TabsTrigger value="all" className="flex-1">All Items</TabsTrigger>
                <TabsTrigger value="expired" className="flex-1">Expired</TabsTrigger>
                <TabsTrigger value="expiring-soon" className="flex-1">Expiring Soon</TabsTrigger>
                <TabsTrigger value="with-alerts" className="flex-1">With Alerts</TabsTrigger>
              </TabsList>
            </Tabs>

            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : sortedMedicines.length === 0 ? (
              <div className="text-center py-8 border rounded-md">
                <CalendarIcon className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium mb-1">No medicines found</h3>
                <p className="text-muted-foreground">Try adjusting your filters or search terms.</p>
              </div>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800 border-b">
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        <button 
                          className="flex items-center"
                          onClick={() => handleSort("name")}
                        >
                          Medicine
                          <ArrowUpDown size={14} className="ml-1" />
                        </button>
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        <button 
                          className="flex items-center"
                          onClick={() => handleSort("expiry_date")}
                        >
                          Expiry Date
                          <ArrowUpDown size={14} className="ml-1" />
                        </button>
                      </th>
                      <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Alert
                      </th>
                      <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedMedicines.map((medicine) => {
                      const daysRemaining = getDaysUntilExpiry(medicine.expiry_date, medicine.extended_date);
                      const expiryStatus = getExpiryStatus(medicine.expiry_date, medicine.extended_date);
                      
                      return (
                        <tr 
                          key={medicine.id}
                          className={cn(
                            "border-b hover:bg-gray-50 dark:hover:bg-gray-800",
                            expiryStatus === "expired" ? "bg-red-50/30 dark:bg-red-950/10" : 
                            expiryStatus === "expiring-soon" ? "bg-amber-50/30 dark:bg-amber-950/10" : ""
                          )}
                        >
                          <td className="py-3 px-4">
                            <div className="flex flex-col">
                              <span className="font-medium">{medicine.name}</span>
                              <div className="flex items-center mt-1">
                                <span className="text-xs text-gray-500 dark:text-gray-400 mr-3">
                                  Batch: {medicine.batch_number}
                                </span>
                                <Badge variant="secondary" className="text-xs">
                                  {medicine.category}
                                </Badge>
                              </div>
                              {medicine.extended_date && (
                                <div className="mt-1 text-xs italic text-gray-500 dark:text-gray-400">
                                  Extended from {formatDate(medicine.expiry_date)}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium">
                              {medicine.extended_date 
                                ? formatDate(medicine.extended_date)
                                : formatDate(medicine.expiry_date)
                              }
                            </div>
                            {medicine.notes && (
                              <div className="mt-1 text-xs italic text-gray-500 dark:text-gray-400 max-w-[220px] truncate">
                                Note: {medicine.notes}
                              </div>
                            )}
                            
                            <div className={cn(
                              "mt-1 text-xs",
                              daysRemaining < 0 ? "text-red-600 dark:text-red-400" :
                              daysRemaining <= 30 ? "text-amber-600 dark:text-amber-400" :
                              "text-green-600 dark:text-green-400"
                            )}>
                              {daysRemaining < 0 
                                ? `${Math.abs(daysRemaining)} days overdue` 
                                : `${daysRemaining} days remaining`
                              }
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {getExpiryBadge(medicine)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center">
                              <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                  medicine.alert_enabled
                                    ? "text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                                    : "text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                                )}
                                onClick={() => handleToggleAlert(medicine)}
                              >
                                <Bell className="h-4 w-4" />
                              </Button>
                              <span className="text-xs ml-1">
                                {medicine.alert_enabled
                                  ? `${medicine.alert_days} days`
                                  : "Off"}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedMedicine(medicine);
                                  setAlertDays(medicine.alert_days);
                                  setNotificationType(
                                    alerts.find(a => a.medicine_id === medicine.id)?.notification_type || "both"
                                  );
                                  setIsAlertDialogOpen(true);
                                }}
                                title="Set Alert"
                              >
                                <Bell className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedMedicine(medicine);
                                  setNewExpiryDate(
                                    medicine.extended_date
                                      ? new Date(medicine.extended_date)
                                      : new Date(medicine.expiry_date)
                                  );
                                  setIsEditDialogOpen(true);
                                }}
                                title="Edit Expiry Date"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              {expiryStatus === "expired" && !medicine.extended_date && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-amber-500 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300"
                                  onClick={() => {
                                    setSelectedMedicine(medicine);
                                    const extendDate = new Date(medicine.expiry_date);
                                    extendDate.setDate(extendDate.getDate() + 30);
                                    setExtendedExpiryDate(extendDate);
                                    setIsExtendDialogOpen(true);
                                  }}
                                  title="Extend Shelf Life"
                                >
                                  <CalendarPlus className="h-4 w-4" />
                                </Button>
                              )}
                              {medicine.extended_date && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                                  onClick={() => handleRemoveExtendedDate(medicine)}
                                  title="Remove Extension"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Set Expiry Alert</DialogTitle>
              <DialogDescription>
                Configure when you'd like to be notified before this medicine expires.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <h4 className="font-medium">{selectedMedicine?.name}</h4>
                <p className="text-sm text-muted-foreground">
                  Expires on {selectedMedicine?.extended_date 
                    ? formatDate(selectedMedicine.extended_date)
                    : selectedMedicine?.expiry_date
                      ? formatDate(selectedMedicine.expiry_date)
                      : 'N/A'
                  }
                </p>
              </div>
              <div className="space-y-2">
                <label htmlFor="alert-days" className="text-sm font-medium">
                  Alert me before expiry
                </label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="alert-days"
                    type="number"
                    value={alertDays}
                    onChange={(e) => setAlertDays(parseInt(e.target.value))}
                    min={1}
                    max={180}
                  />
                  <span>days</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Notification Type
                </label>
                <Select 
                  value={notificationType} 
                  onValueChange={(value: "email" | "app" | "both") => setNotificationType(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select notification type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email Only</SelectItem>
                    <SelectItem value="app">App Only</SelectItem>
                    <SelectItem value="both">Email & App</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsAlertDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSetAlert}>
                Save Alert
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Update Expiry Date</DialogTitle>
              <DialogDescription>
                Change the expiry date for this medicine.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <h4 className="font-medium">{selectedMedicine?.name}</h4>
                <p className="text-sm text-muted-foreground">
                  Current expiry: {selectedMedicine?.extended_date 
                    ? formatDate(selectedMedicine.extended_date)
                    : selectedMedicine?.expiry_date
                      ? formatDate(selectedMedicine.expiry_date)
                      : 'N/A'
                  }
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  New Expiry Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !newExpiryDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newExpiryDate ? format(newExpiryDate, "PPP") : "Select a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newExpiryDate}
                      onSelect={setNewExpiryDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setNewExpiryDate(undefined);
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateExpiryDate}
                disabled={!newExpiryDate}
              >
                Update Date
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isExtendDialogOpen} onOpenChange={setIsExtendDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Extend Shelf Life</DialogTitle>
              <DialogDescription>
                Extend the shelf life of expired medicine after quality check.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <h4 className="font-medium">{selectedMedicine?.name}</h4>
                <div className="flex items-center">
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    Expired on {selectedMedicine?.expiry_date
                      ? formatDate(selectedMedicine.expiry_date)
                      : 'N/A'
                    }
                  </Badge>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Extended Expiry Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !extendedExpiryDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {extendedExpiryDate ? format(extendedExpiryDate, "PPP") : "Select a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={extendedExpiryDate}
                      onSelect={setExtendedExpiryDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <label htmlFor="extend-notes" className="text-sm font-medium">
                  Notes (Quality Check)
                </label>
                <Input
                  id="extend-notes"
                  placeholder="Enter quality check notes"
                  value={extendNotes}
                  onChange={(e) => setExtendNotes(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Include details of the quality check that justifies extending the shelf life.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsExtendDialogOpen(false);
                  setExtendedExpiryDate(undefined);
                  setExtendNotes("");
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleExtendShelfLife}
                disabled={!extendedExpiryDate || extendNotes.trim() === ""}
              >
                Extend Shelf Life
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}

function CalendarPlus({ className, size = 24, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("lucide lucide-calendar-plus", className)}
      {...props}
    >
      <path d="M21 13V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="19" y1="16" x2="19" y2="22" />
      <line x1="16" y1="19" x2="22" y2="19" />
    </svg>
  );
}
