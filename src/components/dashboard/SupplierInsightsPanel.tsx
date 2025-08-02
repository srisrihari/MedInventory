
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell 
} from "recharts";
import { BrainCircuit, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SupplierPerformance {
  name: string;
  onTimeDelivery: number;
  qualityScore: number;
  responseTime: number;
  costEfficiency: number;
  overallScore: number;
  trend: "improving" | "declining" | "stable";
  recommendation: string;
  insights: string[];
}

// Mock supplier performance data
const mockSupplierPerformance: SupplierPerformance[] = [
  {
    name: "MediTech Pharmaceuticals",
    onTimeDelivery: 95,
    qualityScore: 92,
    responseTime: 88,
    costEfficiency: 85,
    overallScore: 90,
    trend: "improving",
    recommendation: "Preferred",
    insights: [
      "Delivered 98% of orders on time in the last month",
      "Product quality has improved by 5% since last quarter",
      "Most cost-effective for antibiotics and pain relief medications"
    ]
  },
  {
    name: "Global Health Supplies",
    onTimeDelivery: 82,
    qualityScore: 90,
    responseTime: 75,
    costEfficiency: 94,
    overallScore: 85,
    trend: "stable",
    recommendation: "Recommended",
    insights: [
      "Average delivery time increased by 1.5 days",
      "Competitive pricing for bulk orders",
      "Quality consistently meets standards"
    ]
  },
  {
    name: "PharmaPlus Inc.",
    onTimeDelivery: 76,
    qualityScore: 85,
    responseTime: 92,
    costEfficiency: 80,
    overallScore: 83,
    trend: "declining",
    recommendation: "Review",
    insights: [
      "3 late deliveries in the last month",
      "Response time has decreased by 15%",
      "Price increases noticed on key products"
    ]
  },
  {
    name: "Healthcare Products Co.",
    onTimeDelivery: 91,
    qualityScore: 88,
    responseTime: 90,
    costEfficiency: 87,
    overallScore: 89,
    trend: "improving",
    recommendation: "Preferred",
    insights: [
      "Consistent performance across all metrics",
      "New delivery optimization has reduced delays",
      "Offers competitive pricing for emergency orders"
    ]
  }
];

export function SupplierInsightsPanel() {
  const [supplierData, setSupplierData] = useState<SupplierPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierPerformance | null>(null);

  // Prepare chart data
  const performanceMetrics = [
    { name: "On-Time Delivery", key: "onTimeDelivery", color: "#10b981" },
    { name: "Quality Score", key: "qualityScore", color: "#3b82f6" },
    { name: "Response Time", key: "responseTime", color: "#6366f1" },
    { name: "Cost Efficiency", key: "costEfficiency", color: "#f97316" }
  ];

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setSupplierData(mockSupplierPerformance);
      setSelectedSupplier(mockSupplierPerformance[0]);
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  const getTrendIcon = (trend: SupplierPerformance["trend"]) => {
    switch (trend) {
      case "improving":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "declining":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case "stable":
        return <BarChart3 className="h-4 w-4 text-blue-500" />;
    }
  };

  const getRecommendationBadge = (recommendation: string) => {
    switch (recommendation) {
      case "Preferred":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400">
            Preferred
          </Badge>
        );
      case "Recommended":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400">
            Recommended
          </Badge>
        );
      case "Review":
        return (
          <Badge className="bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400">
            Review Needed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {recommendation}
          </Badge>
        );
    }
  };

  // Create chart data for selected supplier
  const getChartData = (supplier: SupplierPerformance) => {
    return performanceMetrics.map(metric => ({
      name: metric.name,
      value: supplier[metric.key as keyof typeof supplier] as number,
      color: metric.color
    }));
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center">
          <BrainCircuit className="mr-2 h-5 w-5 text-primary" />
          AI Supplier Insights
        </CardTitle>
        <CardDescription>Performance analysis and recommendations</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-48 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {supplierData.map((supplier) => (
                <button
                  key={supplier.name}
                  onClick={() => setSelectedSupplier(supplier)}
                  className={cn(
                    "px-3 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors",
                    selectedSupplier?.name === supplier.name
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary hover:bg-secondary/80"
                  )}
                >
                  {supplier.name}
                </button>
              ))}
            </div>

            {selectedSupplier && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Performance Trend:</span>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(selectedSupplier.trend)}
                      <span className={cn(
                        "text-sm",
                        selectedSupplier.trend === "improving" ? "text-green-600" :
                        selectedSupplier.trend === "declining" ? "text-red-600" : "text-blue-600"
                      )}>
                        {selectedSupplier.trend.charAt(0).toUpperCase() + selectedSupplier.trend.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">AI Recommendation:</span>
                    {getRecommendationBadge(selectedSupplier.recommendation)}
                  </div>
                </div>

                <div className="h-[160px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={getChartData(selectedSupplier)}
                      margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 11 }} 
                        axisLine={{ stroke: "#e5e7eb" }}
                        tickLine={false}
                      />
                      <YAxis 
                        tick={{ fontSize: 11 }}
                        axisLine={{ stroke: "#e5e7eb" }}
                        tickLine={false}
                        domain={[0, 100]}
                      />
                      <Tooltip 
                        formatter={(value) => [`${value}%`, ""]}
                        contentStyle={{ 
                          borderRadius: "0.375rem", 
                          border: "none", 
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                          backgroundColor: "rgba(255, 255, 255, 0.9)"
                        }}
                      />
                      <Bar 
                        dataKey="value" 
                        radius={[4, 4, 0, 0]} 
                        animationDuration={1000}
                      >
                        {getChartData(selectedSupplier).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-2 mt-2">
                  <h4 className="text-sm font-medium">Key Insights:</h4>
                  <ul className="space-y-1">
                    {selectedSupplier.insights.map((insight, index) => (
                      <li key={index} className="text-sm flex items-start">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mt-1.5 mr-2 flex-shrink-0"></span>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
