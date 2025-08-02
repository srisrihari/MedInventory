
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Calendar, Clock } from "lucide-react";
import { useExpiringItems } from "@/hooks/useDashboard";
import { cn } from "@/lib/utils";

interface ExpiryTrackingListProps {
  threshold: number;
}

export function ExpiryTrackingList({ threshold }: ExpiryTrackingListProps) {
  const { data: expiringItems, isLoading, error } = useExpiringItems(threshold);

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Expiring Items
          </CardTitle>
          <CardDescription>Items expiring within {threshold} days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, idx) => (
              <div key={idx} className="flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-gray-200 rounded"></div>
                  <div className="space-y-1">
                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                    <div className="h-3 w-16 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="h-6 w-12 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Expiring Items
          </CardTitle>
          <CardDescription>Items expiring within {threshold} days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-4">
            Failed to load expiry data
          </div>
        </CardContent>
      </Card>
    );
  }

  const items = expiringItems || [];

  const getExpiryColor = (daysUntilExpiry: number) => {
    if (daysUntilExpiry <= 3) return 'destructive';
    if (daysUntilExpiry <= 7) return 'secondary';
    return 'default';
  };

  const getExpiryIcon = (daysUntilExpiry: number) => {
    if (daysUntilExpiry <= 3) return <Clock className="h-4 w-4 text-red-600 dark:text-red-400" />;
    if (daysUntilExpiry <= 7) return <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />;
    return <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          Expiring Items
        </CardTitle>
        <CardDescription>Items expiring within {threshold} days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[300px] overflow-y-auto">
          {items.length === 0 ? (
            <div className="text-center text-muted-foreground py-4">
              No items expiring within {threshold} days
            </div>
          ) : (
            items.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                    {getExpiryIcon(item.daysUntilExpiry)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={getExpiryColor(item.daysUntilExpiry) as any}
                    className="text-xs"
                  >
                    {item.daysUntilExpiry} days
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {item.quantity} units
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
