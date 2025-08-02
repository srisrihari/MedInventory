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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { 
  Plus, Search, Filter, Calendar as CalendarIcon, 
  Wrench, Activity, AlertTriangle, CheckCircle, 
  Clock, Zap, Settings, TrendingUp, TrendingDown,
  Battery, Thermometer, Gauge, WifiOff, Wifi,
  Edit, Eye, MoreVertical
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface Equipment {
  id: string;
  name: string;
  type: string;
  location: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  installDate: string;
  lastMaintenance: string;
  nextMaintenance: string;
  healthScore: number;
  status: "operational" | "maintenance" | "critical" | "offline";
  utilizationRate: number;
  temperature: number;
  vibration: number;
  powerConsumption: number;
  connectivity: "online" | "offline";
  warningCount: number;
  criticalAlerts: number;
}

interface MaintenanceTask {
  id: string;
  equipmentId: string;
  equipmentName: string;
  taskType: "preventive" | "corrective" | "emergency";
  priority: "low" | "medium" | "high" | "critical";
  description: string;
  assignedTo: string;
  scheduledDate: string;
  estimatedDuration: string;
  status: "scheduled" | "in-progress" | "completed" | "overdue";
  completedDate?: string;
  notes?: string;
}

interface Prediction {
  id: string;
  equipmentId: string;
  equipmentName: string;
  predictionType: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  predictedDate: string;
  confidence: number;
  recommendation: string;
  aiInsight: string;
}

const mockEquipment: Equipment[] = [
  {
    id: "EQ001",
    name: "MRI Scanner Alpha",
    type: "Diagnostic Imaging",
    location: "Radiology - Room 101",
    manufacturer: "Siemens",
    model: "MAGNETOM Vida 3T",
    serialNumber: "SMN-2023-001",
    installDate: "2023-03-15",
    lastMaintenance: "2024-01-10",
    nextMaintenance: "2024-04-10",
    healthScore: 87,
    status: "operational",
    utilizationRate: 78,
    temperature: 22.5,
    vibration: 0.8,
    powerConsumption: 45.2,
    connectivity: "online",
    warningCount: 2,
    criticalAlerts: 0
  },
  {
    id: "EQ002", 
    name: "CT Scanner Beta",
    type: "Diagnostic Imaging",
    location: "Radiology - Room 102",
    manufacturer: "GE Healthcare",
    model: "Revolution CT",
    serialNumber: "GE-2023-002",
    installDate: "2023-05-20",
    lastMaintenance: "2024-01-15",
    nextMaintenance: "2024-03-15",
    healthScore: 65,
    status: "maintenance",
    utilizationRate: 0,
    temperature: 28.3,
    vibration: 2.1,
    powerConsumption: 0,
    connectivity: "offline",
    warningCount: 5,
    criticalAlerts: 2
  },
  {
    id: "EQ003",
    name: "Ventilator Unit-A1",
    type: "Life Support",
    location: "ICU - Bay 3",
    manufacturer: "Philips",
    model: "Respironics V680",
    serialNumber: "PH-2023-003",
    installDate: "2023-01-10",
    lastMaintenance: "2024-01-20",
    nextMaintenance: "2024-02-20",
    healthScore: 92,
    status: "operational",
    utilizationRate: 95,
    temperature: 35.2,
    vibration: 0.3,
    powerConsumption: 15.8,
    connectivity: "online",
    warningCount: 0,
    criticalAlerts: 0
  },
  {
    id: "EQ004",
    name: "X-Ray Machine Gamma",
    type: "Diagnostic Imaging",
    location: "Emergency - Room 205",
    manufacturer: "Canon",
    model: "CXDI-820C",
    serialNumber: "CN-2023-004",
    installDate: "2023-06-12",
    lastMaintenance: "2023-12-15",
    nextMaintenance: "2024-03-15",
    healthScore: 45,
    status: "critical",
    utilizationRate: 25,
    temperature: 42.1,
    vibration: 3.2,
    powerConsumption: 28.5,
    connectivity: "online",
    warningCount: 8,
    criticalAlerts: 3
  }
];

const mockMaintenanceTasks: MaintenanceTask[] = [
  {
    id: "MT001",
    equipmentId: "EQ002",
    equipmentName: "CT Scanner Beta",
    taskType: "corrective",
    priority: "high",
    description: "Replace cooling fan and calibrate temperature sensors",
    assignedTo: "John Smith",
    scheduledDate: "2024-02-08",
    estimatedDuration: "4 hours",
    status: "in-progress"
  },
  {
    id: "MT002",
    equipmentId: "EQ004", 
    equipmentName: "X-Ray Machine Gamma",
    taskType: "emergency",
    priority: "critical",
    description: "Critical overheating issue - immediate attention required",
    assignedTo: "Sarah Johnson",
    scheduledDate: "2024-02-06",
    estimatedDuration: "6 hours",
    status: "scheduled"
  },
  {
    id: "MT003",
    equipmentId: "EQ003",
    equipmentName: "Ventilator Unit-A1",
    taskType: "preventive",
    priority: "medium",
    description: "Routine filter replacement and performance check",
    assignedTo: "Mike Wilson",
    scheduledDate: "2024-02-20",
    estimatedDuration: "2 hours",
    status: "scheduled"
  }
];

const mockPredictions: Prediction[] = [
  {
    id: "PR001",
    equipmentId: "EQ004",
    equipmentName: "X-Ray Machine Gamma",
    predictionType: "Component Failure",
    riskLevel: "critical",
    predictedDate: "2024-02-15",
    confidence: 94,
    recommendation: "Replace power supply unit immediately",
    aiInsight: "Temperature and vibration patterns indicate imminent power supply failure. Historical data shows 94% accuracy for this prediction type."
  },
  {
    id: "PR002",
    equipmentId: "EQ001",
    equipmentName: "MRI Scanner Alpha",
    predictionType: "Performance Degradation",
    riskLevel: "medium",
    predictedDate: "2024-03-20",
    confidence: 76,
    recommendation: "Schedule gradient coil maintenance",
    aiInsight: "Gradual decline in magnetic field uniformity detected. Preventive maintenance recommended within 6 weeks."
  },
  {
    id: "PR003",
    equipmentId: "EQ002",
    equipmentName: "CT Scanner Beta",
    predictionType: "Calibration Drift",
    riskLevel: "low",
    predictedDate: "2024-04-10",
    confidence: 68,
    recommendation: "Plan calibration check in Q2",
    aiInsight: "Minor variations in image quality metrics suggest calibration drift. Schedule routine calibration within 8 weeks."
  }
];

export default function Maintenance() {
  const { toast } = useToast();
  const [equipment, setEquipment] = useState<Equipment[]>(mockEquipment);
  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>(mockMaintenanceTasks);
  const [predictions, setPredictions] = useState<Prediction[]>(mockPredictions);
  const [activeTab, setActiveTab] = useState("equipment");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const getStatusBadge = (status: Equipment["status"]) => {
    switch (status) {
      case "operational":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">Operational</Badge>;
      case "maintenance":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800">Maintenance</Badge>;
      case "critical":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">Critical</Badge>;
      case "offline":
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800">Offline</Badge>;
      default:
        return null;
    }
  };

  const getTaskStatusBadge = (status: MaintenanceTask["status"]) => {
    switch (status) {
      case "scheduled":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">Scheduled</Badge>;
      case "in-progress":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800">In Progress</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">Completed</Badge>;
      case "overdue":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dart:text-red-400 dark:border-red-800">Overdue</Badge>;
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority: MaintenanceTask["priority"]) => {
    switch (priority) {
      case "low":
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800">Low</Badge>;
      case "medium":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">Medium</Badge>;
      case "high":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800">High</Badge>;
      case "critical":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">Critical</Badge>;
      default:
        return null;
    }
  };

  const getRiskBadge = (risk: Prediction["riskLevel"]) => {
    switch (risk) {
      case "low":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">Low Risk</Badge>;
      case "medium":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800">Medium Risk</Badge>;
      case "high":
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800">High Risk</Badge>;
      case "critical":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">Critical Risk</Badge>;
      default:
        return null;
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-amber-600";
    return "text-red-600";
  };

  const filteredEquipment = equipment.filter(eq => {
    const matchesSearch = eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         eq.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         eq.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || eq.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const operationalCount = equipment.filter(eq => eq.status === "operational").length;
  const criticalCount = equipment.filter(eq => eq.status === "critical").length;
  const avgHealthScore = equipment.length > 0 ? 
    Math.round(equipment.reduce((sum, eq) => sum + eq.healthScore, 0) / equipment.length) : 0;
  const predictiveAlerts = predictions.filter(p => p.riskLevel === "critical" || p.riskLevel === "high").length;

  const handleScheduleMaintenance = () => {
    toast({
      title: "Maintenance Scheduled",
      description: "New maintenance task has been scheduled successfully.",
    });
    setIsScheduleDialogOpen(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Predictive Maintenance</h1>
            <p className="text-muted-foreground">
              AI-powered equipment monitoring and predictive maintenance scheduling.
            </p>
          </div>
          
          <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center">
                <Plus className="mr-2 h-4 w-4" />
                Schedule Maintenance
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Schedule Maintenance Task</DialogTitle>
                <DialogDescription>
                  Create a new maintenance task for selected equipment.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="equipment" className="text-sm font-medium">Equipment</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select equipment" />
                    </SelectTrigger>
                    <SelectContent>
                      {equipment.map((eq) => (
                        <SelectItem key={eq.id} value={eq.id}>{eq.name} - {eq.location}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="task-type" className="text-sm font-medium">Task Type</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="preventive">Preventive</SelectItem>
                        <SelectItem value="corrective">Corrective</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="priority" className="text-sm font-medium">Priority</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="scheduled-date" className="text-sm font-medium">Scheduled Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">Description</label>
                  <Input id="description" placeholder="Task description" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="assigned-to" className="text-sm font-medium">Assigned To</label>
                    <Input id="assigned-to" placeholder="Technician name" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="duration" className="text-sm font-medium">Estimated Duration</label>
                    <Input id="duration" placeholder="e.g., 2 hours" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleScheduleMaintenance}>Schedule Task</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
          <StatsCard
            title="Operational Equipment"
            value={operationalCount.toString()}
            description="running normally"
            icon={CheckCircle}
            className="hover-scale"
            percentageChange={2.1}
          />
          <StatsCard
            title="Critical Alerts"
            value={criticalCount.toString()}
            description="require immediate attention"
            icon={AlertTriangle}
            className="hover-scale"
            percentageChange={-15.3}
          />
          <StatsCard
            title="Avg Health Score"
            value={`${avgHealthScore}%`}
            description="across all equipment"
            icon={Activity}
            className="hover-scale"
            percentageChange={3.2}
          />
          <StatsCard
            title="Predictive Alerts"
            value={predictiveAlerts.toString()}
            description="AI predictions"
            icon={TrendingUp}
            className="hover-scale"
            percentageChange={8.7}
          />
        </div>

        <Card>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <CardHeader className="pb-2">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-2 md:space-y-0">
                <div>
                  <CardTitle className="text-lg font-semibold">Equipment Management</CardTitle>
                  <CardDescription>Monitor equipment health and schedule maintenance</CardDescription>
                </div>
                <TabsList>
                  <TabsTrigger value="equipment">Equipment</TabsTrigger>
                  <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
                  <TabsTrigger value="predictions">AI Predictions</TabsTrigger>
                </TabsList>
              </div>
            </CardHeader>

            <CardContent>
              <TabsContent value="equipment" className="mt-0">
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 gap-3">
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search equipment..."
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
                        <SelectItem value="operational">Operational</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="offline">Offline</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {isLoading ? (
                    <div className="h-64 flex items-center justify-center">
                      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                      {filteredEquipment.map((eq) => (
                        <Card key={eq.id} className="hover:shadow-md transition-shadow">
                          <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-base">{eq.name}</CardTitle>
                                <CardDescription>{eq.type} • {eq.location}</CardDescription>
                              </div>
                              <div className="flex items-center space-x-2">
                                {eq.connectivity === "online" ? (
                                  <Wifi className="h-4 w-4 text-green-500" />
                                ) : (
                                  <WifiOff className="h-4 w-4 text-red-500" />
                                )}
                                {getStatusBadge(eq.status)}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Health Score</span>
                                <span className={cn("font-bold", getHealthScoreColor(eq.healthScore))}>
                                  {eq.healthScore}%
                                </span>
                              </div>
                              <Progress value={eq.healthScore} className="h-2" />
                              
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center justify-between">
                                  <span className="text-muted-foreground">Utilization</span>
                                  <span className="font-medium">{eq.utilizationRate}%</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-muted-foreground">Temperature</span>
                                  <span className="font-medium">{eq.temperature}°C</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-muted-foreground">Warnings</span>
                                  <span className="font-medium text-amber-600">{eq.warningCount}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-muted-foreground">Critical</span>
                                  <span className="font-medium text-red-600">{eq.criticalAlerts}</span>
                                </div>
                              </div>
                              
                              <div className="flex justify-between items-center pt-2 border-t">
                                <span className="text-sm text-muted-foreground">
                                  Next: {formatDate(eq.nextMaintenance)}
                                </span>
                                <div className="flex space-x-2">
                                  <Button variant="ghost" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Settings className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="maintenance" className="mt-0">
                <div className="space-y-4">
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Equipment</TableHead>
                          <TableHead>Task Type</TableHead>
                          <TableHead>Priority</TableHead>
                          <TableHead>Assigned To</TableHead>
                          <TableHead>Scheduled Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {maintenanceTasks.map((task) => (
                          <TableRow key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                            <TableCell>
                              <div>
                                <div className="font-medium">{task.equipmentName}</div>
                                <div className="text-sm text-muted-foreground">{task.description}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="capitalize">
                                {task.taskType}
                              </Badge>
                            </TableCell>
                            <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                            <TableCell>{task.assignedTo}</TableCell>
                            <TableCell>{formatDate(task.scheduledDate)}</TableCell>
                            <TableCell>{getTaskStatusBadge(task.status)}</TableCell>
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
                </div>
              </TabsContent>

              <TabsContent value="predictions" className="mt-0">
                <div className="space-y-4">
                  {predictions.map((prediction) => (
                    <Card key={prediction.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-base">{prediction.equipmentName}</CardTitle>
                            <CardDescription>{prediction.predictionType}</CardDescription>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getRiskBadge(prediction.riskLevel)}
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
                              {prediction.confidence}% confidence
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Predicted Date:</span>
                            <span className="text-sm">{formatDate(prediction.predictedDate)}</span>
                          </div>
                          
                          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="flex items-start">
                              <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-blue-800 dark:text-blue-300">AI Insight</p>
                                <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                                  {prediction.aiInsight}
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                            <div className="flex items-start">
                              <Wrench className="h-5 w-5 text-amber-600 dark:text-amber-400 mr-2 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Recommendation</p>
                                <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                                  {prediction.recommendation}
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex justify-end pt-2">
                            <Button size="sm" variant="outline">
                              Schedule Maintenance
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </AppLayout>
  );
}