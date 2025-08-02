
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { 
  Table, TableBody, TableCaption, TableCell, 
  TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  Card, CardContent, CardDescription, 
  CardHeader, CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Form, FormControl, FormDescription, 
  FormField, FormItem, FormLabel 
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Download, FileText, Filter, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Define report schema
const reportFormSchema = z.object({
  reportType: z.string(),
  dateRange: z.string(),
  category: z.string().optional(),
  supplier: z.string().optional(),
  statusFilter: z.string().optional(),
});

type ReportFormValues = z.infer<typeof reportFormSchema>;

// Mock data for reports
const inventoryReportData = [
  { id: "1", name: "Paracetamol", category: "Pain Relief", quantity: 2500, supplier: "MedSource Inc", status: "In Stock", lastUpdated: "2023-06-10" },
  { id: "2", name: "Amoxicillin", category: "Antibiotics", quantity: 1200, supplier: "PharmaPlus", status: "Low Stock", lastUpdated: "2023-06-09" },
  { id: "3", name: "Ibuprofen", category: "Pain Relief", quantity: 3000, supplier: "MedSource Inc", status: "In Stock", lastUpdated: "2023-06-08" },
  { id: "4", name: "Cetirizine", category: "Allergy", quantity: 800, supplier: "HealthDirect", status: "Low Stock", lastUpdated: "2023-06-07" },
  { id: "5", name: "Ventolin", category: "Respiratory", quantity: 500, supplier: "PharmaPlus", status: "In Stock", lastUpdated: "2023-06-05" },
];

const supplierReportData = [
  { id: "1", name: "MedSource Inc", reliability: 92, deliverySpeed: 95, costEfficiency: 87, lastDelivery: "2023-06-08", totalOrders: 156 },
  { id: "2", name: "PharmaPlus", reliability: 88, deliverySpeed: 82, costEfficiency: 90, lastDelivery: "2023-06-05", totalOrders: 123 },
  { id: "3", name: "HealthDirect", reliability: 95, deliverySpeed: 88, costEfficiency: 82, lastDelivery: "2023-06-09", totalOrders: 145 },
  { id: "4", name: "MediWholesale", reliability: 78, deliverySpeed: 79, costEfficiency: 94, lastDelivery: "2023-06-02", totalOrders: 98 },
  { id: "5", name: "GlobalMed", reliability: 90, deliverySpeed: 91, costEfficiency: 85, lastDelivery: "2023-06-04", totalOrders: 112 },
];

const expiryReportData = [
  { id: "1", name: "Amoxicillin Batch A123", quantity: 500, expiryDate: "2023-07-15", daysRemaining: 22, status: "Expiring Soon" },
  { id: "2", name: "Paracetamol Batch P456", quantity: 1000, expiryDate: "2023-08-20", daysRemaining: 58, status: "Safe" },
  { id: "3", name: "Ibuprofen Batch I789", quantity: 750, expiryDate: "2023-07-05", daysRemaining: 12, status: "Critical" },
  { id: "4", name: "Cetirizine Batch C012", quantity: 300, expiryDate: "2023-09-10", daysRemaining: 79, status: "Safe" },
  { id: "5", name: "Ventolin Batch V345", quantity: 200, expiryDate: "2023-07-25", daysRemaining: 32, status: "Expiring Soon" },
];

export default function Reports() {
  const [activeTab, setActiveTab] = useState("generate");
  const [reportType, setReportType] = useState("inventory");
  const [reportData, setReportData] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const { toast } = useToast();

  // Initialize form
  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      reportType: "inventory",
      dateRange: "last30",
      category: "all",
      supplier: "all",
      statusFilter: "all",
    },
  });

  // Generate report based on form values
  const generateReport = (values: ReportFormValues) => {
    setIsGeneratingReport(true);
    
    // Simulating API call delay
    setTimeout(() => {
      let data: any[] = [];
      
      // Select data based on report type
      switch (values.reportType) {
        case "inventory":
          data = inventoryReportData;
          break;
        case "supplier":
          data = supplierReportData;
          break;
        case "expiry":
          data = expiryReportData;
          break;
        default:
          data = [];
      }
      
      setReportType(values.reportType);
      setReportData(data);
      setIsGeneratingReport(false);
      setActiveTab("view");
      
      toast({
        title: "Report Generated",
        description: `${values.reportType.charAt(0).toUpperCase() + values.reportType.slice(1)} report has been generated successfully.`,
      });
    }, 800);
  };

  // Download report as CSV
  const downloadReportCSV = () => {
    if (reportData.length === 0) {
      toast({
        title: "No Data",
        description: "There is no report data to download.",
        variant: "destructive",
      });
      return;
    }

    // Create CSV content
    const headers = Object.keys(reportData[0]).join(",");
    const rows = reportData.map(item => Object.values(item).join(",")).join("\n");
    const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows}`;
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    
    // Download file and clean up
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Report Downloaded",
      description: "The report has been downloaded as a CSV file.",
    });
  };

  // Filter report data based on search query
  const filteredReportData = reportData.filter(item => {
    return Object.values(item).some(
      value => value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Render the appropriate table based on report type
  const renderReportTable = () => {
    if (reportData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <FileText className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No Report Data</h3>
          <p className="text-muted-foreground mt-2">
            Generate a report to view data here.
          </p>
        </div>
      );
    }

    switch (reportType) {
      case "inventory":
        return (
          <Table>
            <TableCaption>Inventory Status Report as of {new Date().toLocaleDateString()}</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Item Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReportData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.supplier}</TableCell>
                  <TableCell>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      item.status === "In Stock" 
                        ? "bg-green-100 text-green-800" 
                        : item.status === "Low Stock" 
                        ? "bg-yellow-100 text-yellow-800" 
                        : "bg-red-100 text-red-800"
                    }`}>
                      {item.status}
                    </span>
                  </TableCell>
                  <TableCell>{item.lastUpdated}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );
      
      case "supplier":
        return (
          <Table>
            <TableCaption>Supplier Performance Report as of {new Date().toLocaleDateString()}</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Supplier Name</TableHead>
                <TableHead>Reliability (%)</TableHead>
                <TableHead>Delivery Speed (%)</TableHead>
                <TableHead>Cost Efficiency (%)</TableHead>
                <TableHead>Last Delivery</TableHead>
                <TableHead>Total Orders</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReportData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.reliability}</TableCell>
                  <TableCell>{item.deliverySpeed}</TableCell>
                  <TableCell>{item.costEfficiency}</TableCell>
                  <TableCell>{item.lastDelivery}</TableCell>
                  <TableCell>{item.totalOrders}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );
      
      case "expiry":
        return (
          <Table>
            <TableCaption>Expiry Tracking Report as of {new Date().toLocaleDateString()}</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Item Name</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Days Remaining</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReportData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.expiryDate}</TableCell>
                  <TableCell>{item.daysRemaining}</TableCell>
                  <TableCell>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      item.status === "Safe" 
                        ? "bg-green-100 text-green-800" 
                        : item.status === "Expiring Soon" 
                        ? "bg-yellow-100 text-yellow-800" 
                        : "bg-red-100 text-red-800"
                    }`}>
                      {item.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );
      
      default:
        return null;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Generate and view detailed reports about your inventory.
          </p>
        </div>

        <Card className="shadow-sm">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-2 md:space-y-0">
                <div>
                  <CardTitle>Reports Center</CardTitle>
                  <CardDescription>Generate custom reports for your inventory management system.</CardDescription>
                </div>
                <TabsList className="grid grid-cols-2 w-full md:w-auto mt-2">
                  <TabsTrigger value="generate">Generate Report</TabsTrigger>
                  <TabsTrigger value="view">View Report</TabsTrigger>
                </TabsList>
              </div>
            </CardHeader>

            <CardContent>
              <TabsContent value="generate" className="mt-0">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(generateReport)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="reportType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Report Type</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select report type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="inventory">Inventory Status</SelectItem>
                                <SelectItem value="supplier">Supplier Performance</SelectItem>
                                <SelectItem value="expiry">Expiry Tracking</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Select the type of report you want to generate.
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="dateRange"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date Range</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select date range" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="last7">Last 7 Days</SelectItem>
                                <SelectItem value="last30">Last 30 Days</SelectItem>
                                <SelectItem value="last90">Last 90 Days</SelectItem>
                                <SelectItem value="lastYear">Last Year</SelectItem>
                                <SelectItem value="allTime">All Time</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Select the time period for the report.
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                    </div>

                    {form.watch("reportType") === "inventory" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="all">All Categories</SelectItem>
                                  <SelectItem value="pain-relief">Pain Relief</SelectItem>
                                  <SelectItem value="antibiotics">Antibiotics</SelectItem>
                                  <SelectItem value="respiratory">Respiratory</SelectItem>
                                  <SelectItem value="allergy">Allergy</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="statusFilter"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Status</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="all">All Statuses</SelectItem>
                                  <SelectItem value="in-stock">In Stock</SelectItem>
                                  <SelectItem value="low-stock">Low Stock</SelectItem>
                                  <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {form.watch("reportType") === "supplier" && (
                      <FormField
                        control={form.control}
                        name="supplier"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Supplier</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select supplier" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="all">All Suppliers</SelectItem>
                                <SelectItem value="medsource">MedSource Inc</SelectItem>
                                <SelectItem value="pharmaplus">PharmaPlus</SelectItem>
                                <SelectItem value="healthdirect">HealthDirect</SelectItem>
                                <SelectItem value="mediwholesale">MediWholesale</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    )}

                    <Button 
                      type="submit" 
                      className="w-full md:w-auto"
                      disabled={isGeneratingReport}
                    >
                      {isGeneratingReport ? "Generating..." : "Generate Report"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="view" className="mt-0">
                {reportData.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between gap-3">
                      <div className="relative w-full sm:max-w-xs">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="search"
                          placeholder="Search report..."
                          className="pl-8"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      
                      <Button 
                        variant="outline" 
                        onClick={downloadReportCSV}
                        className="w-full sm:w-auto"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download CSV
                      </Button>
                    </div>

                    <div className="border rounded-md overflow-auto">
                      {renderReportTable()}
                    </div>
                  </div>
                )}

                {reportData.length === 0 && (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No Report Generated</h3>
                    <p className="text-muted-foreground mt-2">
                      Generate a report first to view the data.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setActiveTab("generate")}
                    >
                      Generate New Report
                    </Button>
                  </div>
                )}
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </AppLayout>
  );
}
