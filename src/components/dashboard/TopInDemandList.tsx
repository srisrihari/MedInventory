
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Package, Brain, AlertTriangle } from "lucide-react";
import { useTopInDemand } from "@/hooks/useDashboard";
import { cn } from "@/lib/utils";

export function TopInDemandList() {
  const { data: topItems, isLoading, error } = useTopInDemand();

  if (isLoading) {
    return (
      <Card className="hover-scale">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            Top In-Demand Items
          </CardTitle>
          <CardDescription>AI-powered demand predictions</CardDescription>
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
      <Card className="hover-scale">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            Top In-Demand Items
          </CardTitle>
          <CardDescription>AI-powered demand predictions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-4">
            Failed to load demand data
          </div>
        </CardContent>
      </Card>
    );
  }

  const items = topItems || [];

  return (
    <Card className="hover-scale">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-orange-500" />
          Top In-Demand Items
          {items.length > 0 && items[0]?.isAI && (
            <Badge variant="outline" className="text-xs">
              <Brain className="h-3 w-3 mr-1" />
              AI Powered
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          {items.length > 0 && items[0]?.isAI 
            ? "AI-powered demand predictions for next 30 days" 
            : "Items with highest demand (inventory-based)"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.length === 0 ? (
            <div className="text-center text-muted-foreground py-4">
              No demand data available
            </div>
          ) : (
            items.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                    {item.isAI ? (
                      <Brain className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    ) : (
                      <Package className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">{item.category}</p>
                      {item.isAI && (
                        <Badge variant="outline" className="text-xs">
                          {item.confidence}% accuracy
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge 
                    variant={item.status === 'high' ? 'destructive' : 
                           item.status === 'medium' ? 'secondary' : 'default'}
                    className="text-xs"
                  >
                    {item.quantity} units
                  </Badge>
                  {item.isAI && item.current_stock && (
                    <div className="text-xs text-muted-foreground">
                      Current: {item.current_stock}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
