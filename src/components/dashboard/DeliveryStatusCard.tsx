
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Truck, AlertTriangle, CheckCircle2, Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface Shipment {
  id: string;
  supplierName: string;
  status: "in-transit" | "delayed" | "delivered";
  estimatedDelivery: string;
  items: string;
  quantity: number;
  completionPercentage: number;
}

// Mock shipment data
const mockShipments: Shipment[] = [
  {
    id: "SHP-1234",
    supplierName: "MediTech Pharmaceuticals",
    status: "in-transit",
    estimatedDelivery: "2023-12-10",
    items: "Antibiotics",
    quantity: 500,
    completionPercentage: 75,
  },
  {
    id: "SHP-1235",
    supplierName: "Global Health Supplies",
    status: "delayed",
    estimatedDelivery: "2023-12-15",
    items: "Surgical Masks",
    quantity: 1000,
    completionPercentage: 40,
  },
  {
    id: "SHP-1236",
    supplierName: "PharmaPlus Inc.",
    status: "delivered",
    estimatedDelivery: "2023-12-05",
    items: "Pain Relief",
    quantity: 250,
    completionPercentage: 100,
  },
];

export function DeliveryStatusCard() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setShipments(mockShipments);
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  const getStatusDetails = (status: Shipment["status"]) => {
    switch (status) {
      case "in-transit":
        return {
          icon: <Truck className="h-4 w-4 text-blue-500" />,
          label: "In Transit",
          badgeClass: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
        };
      case "delayed":
        return {
          icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
          label: "Delayed",
          badgeClass: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
        };
      case "delivered":
        return {
          icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
          label: "Delivered",
          badgeClass: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
        };
      default:
        return {
          icon: <Package className="h-4 w-4 text-gray-500" />,
          label: "Unknown",
          badgeClass: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800"
        };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };

  // Count shipments by status
  const inTransitCount = shipments.filter(s => s.status === "in-transit").length;
  const delayedCount = shipments.filter(s => s.status === "delayed").length;
  const deliveredCount = shipments.filter(s => s.status === "delivered").length;
  const totalActive = inTransitCount + delayedCount;

  return (
    <Card className="hover-scale">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center">
          <Truck className="mr-2 h-5 w-5 text-primary" />
          Delivery Status
        </CardTitle>
        <CardDescription>
          {totalActive} shipments in progress, {delayedCount} delayed
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-24 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {shipments.map((shipment) => {
              const statusDetails = getStatusDetails(shipment.status);
              return (
                <div 
                  key={shipment.id} 
                  className="p-2 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      {statusDetails.icon}
                      <span className="text-sm font-medium truncate max-w-[120px]">
                        {shipment.supplierName}
                      </span>
                    </div>
                    <Badge variant="outline" className={cn(statusDetails.badgeClass)}>
                      {statusDetails.label}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                    <span>{shipment.items} × {shipment.quantity}</span>
                    {shipment.status !== "delivered" && (
                      <span>Est: {formatDate(shipment.estimatedDelivery)}</span>
                    )}
                  </div>
                  {shipment.status !== "delivered" && (
                    <Progress 
                      value={shipment.completionPercentage} 
                      className="h-1.5" 
                      indicatorClassName={
                        shipment.status === "delayed" 
                          ? "bg-red-500" 
                          : "bg-blue-500"
                      }
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
