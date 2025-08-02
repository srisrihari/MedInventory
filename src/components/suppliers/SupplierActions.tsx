
import { useState } from "react";
import { FileSpreadsheet, Download, RefreshCw, Calendar, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SupplierActions() {
  const [reportType, setReportType] = useState("performance");
  const [fileFormat, setFileFormat] = useState("pdf");
  const [timeRange, setTimeRange] = useState<"7" | "30" | "90" | "custom">("30");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  
  const handleSyncInventory = () => {
    setIsSyncing(true);
    
    // Simulate API call to sync inventory data
    setTimeout(() => {
      setIsSyncing(false);
      toast({
        title: "Inventory Synchronized",
        description: "Supplier data has been updated with the latest inventory changes.",
      });
    }, 2000);
  };
  
  const handleGenerateReport = () => {
    setIsGeneratingReport(true);
    
    // Simulate report generation
    setTimeout(() => {
      setIsGeneratingReport(false);
      
      if (fileFormat === "pdf") {
        toast({
          title: "PDF Report Generated",
          description: `Your ${reportType} report has been generated successfully.`,
        });
      } else {
        toast({
          title: "Excel Report Generated",
          description: `Your ${reportType} report has been generated successfully.`,
        });
      }
    }, 2000);
  };
  
  const openReportDialog = () => {
    setIsReportDialogOpen(true);
  };
  
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <Card className="flex-1">
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center">
              <RefreshCw className="mr-2 h-5 w-5" />
              <span className="font-medium">Sync Inventory Data</span>
            </div>
            <Button 
              variant="default" 
              size="sm"
              disabled={isSyncing}
              onClick={handleSyncInventory}
              className="w-full sm:w-auto"
            >
              {isSyncing ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  Syncing...
                </>
              ) : (
                "Sync Now"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card className="flex-1">
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              <span className="font-medium">Generate Reports</span>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={openReportDialog}
              className="w-full sm:w-auto"
            >
              <FileSpreadsheet className="mr-1.5 h-4 w-4" />
              Generate Report
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Report Generation Dialog */}
      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Generate Supplier Report</DialogTitle>
            <DialogDescription>
              Configure report settings below to generate a detailed supplier report.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reportType" className="text-right">
                Report Type
              </Label>
              <Select
                value={reportType}
                onValueChange={setReportType}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Report Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="performance">Performance Report</SelectItem>
                  <SelectItem value="inventory">Inventory Report</SelectItem>
                  <SelectItem value="delivery">Delivery Report</SelectItem>
                  <SelectItem value="quality">Quality Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fileFormat" className="text-right">
                File Format
              </Label>
              <Select
                value={fileFormat}
                onValueChange={setFileFormat}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="File Format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="timeRange" className="text-right">
                Time Range
              </Label>
              <Select
                value={timeRange}
                onValueChange={(value) => setTimeRange(value as "7" | "30" | "90" | "custom")}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 Days</SelectItem>
                  <SelectItem value="30">Last 30 Days</SelectItem>
                  <SelectItem value="90">Last 90 Days</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {timeRange === "custom" && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dateRange" className="text-right">
                  Date Range
                </Label>
                <div className="col-span-3 flex gap-2 items-center">
                  <div className="flex flex-1 items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <Input
                      type="date"
                      id="startDate"
                      className="flex-1"
                    />
                  </div>
                  <span className="text-gray-500">to</span>
                  <div className="flex flex-1 items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <Input
                      type="date"
                      id="endDate"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReportDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                setIsReportDialogOpen(false);
                handleGenerateReport();
              }}
              disabled={isGeneratingReport}
            >
              {isGeneratingReport ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Download className="mr-1.5 h-4 w-4" />
                  Generate Report
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
