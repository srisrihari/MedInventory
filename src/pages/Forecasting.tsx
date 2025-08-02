
import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ForecastingPanel } from "@/components/dashboard/ForecastingPanel";
import { 
  useAIDemandForecast, 
  useRegenerateForecast, 
  useAIHealth,
  useForecastHistory,
  type DemandForecastResponse,
  type AIInsight
} from "@/hooks/useAI";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { 
  BrainCircuit, 
  TrendingUp, 
  RefreshCw, 
  ArrowRight,
  BarChart3,
  LineChart as LineChartIcon,
  FileText,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

// Product categories
const productCategories = [
  "All Categories",
  "Pain Relief",
  "Antibiotics",
  "Diabetes",
  "Cardiovascular",
  "Respiratory",
  "Gastrointestinal",
  "Supplements",
  "Topical",
];

// Forecast periods
const forecastPeriods = [
  { label: "Next 7 Days", value: "7d" },
  { label: "Next 30 Days", value: "30d" },
  { label: "Next 90 Days", value: "90d" },
  { label: "Next 6 Months", value: "6m" },
  { label: "Next 1 Year", value: "1y" },
];

// AI Insights icons mapping
const insightIcons: Record<string, React.ComponentType<any>> = {
  "Stock Alert": AlertTriangle,
  "Seasonal Trend": TrendingUp,
  "System Status": Clock,
  "Performance": CheckCircle,
  "default": BrainCircuit
};

export default function Forecasting() {
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedPeriod, setSelectedPeriod] = useState("30d");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Fetch forecast data
  const { 
    data: forecastData, 
    isLoading: forecastLoading, 
    error: forecastError,
    refetch: refetchForecast
  } = useAIDemandForecast(selectedPeriod, selectedCategory);

  // AI health check
  const { data: aiHealth, isLoading: healthLoading } = useAIHealth();

  // Forecast regeneration
  const regenerateMutation = useRegenerateForecast();

  // Forecast history
  const { data: historyData } = useForecastHistory(30);

  // Handle generating a new forecast
  const handleGenerateForecast = async () => {
    setIsRegenerating(true);
    try {
      await regenerateMutation.mutateAsync({
        forecastPeriod: selectedPeriod,
        categoryFilter: selectedCategory,
      });
      await refetchForecast();
    } catch (error) {
      console.error("Failed to regenerate forecast:", error);
    } finally {
      setIsRegenerating(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = () => {
    refetchForecast();
  };

  // Get chart data from forecast
  const getChartData = () => {
    if (!forecastData?.chart_data) {
      return {
        demandOverview: [],
        accuracyTrend: [],
        seasonalPattern: []
      };
    }

    return {
      demandOverview: forecastData.chart_data.demand_overview || [],
      accuracyTrend: forecastData.chart_data.accuracy_trend || [],
      seasonalPattern: forecastData.chart_data.seasonal_pattern || []
    };
  };

  // Get AI insights
  const getAIInsights = (): AIInsight[] => {
    if (!forecastData?.insights) return [];
    return forecastData.insights.slice(0, 5); // Show top 5 insights
  };

  // Get top products forecast
  const getTopProductsForecast = () => {
    if (!forecastData?.forecasts) return [];
    return forecastData.forecasts.slice(0, 10); // Show top 10
  };

  const { demandOverview, accuracyTrend, seasonalPattern } = getChartData();
  const aiInsights = getAIInsights();
  const topProductsForecast = getTopProductsForecast();

  const isLoading = forecastLoading || healthLoading;
  const isAIHealthy = aiHealth?.status === 'healthy';

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AI Demand Forecasting</h1>
            <p className="text-muted-foreground">
              Predict future demand with our AI-powered forecasting system.
              {forecastData && (
                <span className="ml-2 text-sm">
                  Last updated: {new Date(forecastData.created_at).toLocaleString()}
                </span>
              )}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <Button 
              onClick={handleGenerateForecast} 
              disabled={isLoading || isRegenerating} 
              className="flex items-center"
            >
              {isRegenerating ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <BrainCircuit className="mr-2 h-4 w-4" />
              )}
              {isRegenerating ? "Generating..." : "Generate New Forecast"}
            </Button>
            <Button variant="outline" className="flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        {/* AI Status Card */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-blue-600" />
              AI System Status
              {isAIHealthy ? (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Operational
                </Badge>
              ) : (
                <Badge variant="outline" className="text-orange-600 border-orange-600">
                  <Clock className="h-3 w-3 mr-1" />
                  Limited
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {forecastData ? (
                <>
                  Model: {forecastData.ai_model_version} | 
                  Accuracy: {forecastData.overall_accuracy}% | 
                  Items Forecasted: {forecastData.total_items_forecasted}
                </>
              ) : (
                "Loading AI system status..."
              )}
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-lg font-medium">Forecasting Parameters</CardTitle>
            <CardDescription>Customize your demand forecast parameters</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="category" className="text-sm font-medium">Product Category</label>
                <Select 
                  value={selectedCategory} 
                  onValueChange={(value) => {
                    setSelectedCategory(value);
                    handleFilterChange();
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {productCategories.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="forecastPeriod" className="text-sm font-medium">Forecast Period</label>
                <Select 
                  value={selectedPeriod} 
                  onValueChange={(value) => {
                    setSelectedPeriod(value);
                    handleFilterChange();
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    {forecastPeriods.map((period) => (
                      <SelectItem key={period.value} value={period.value}>{period.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="startDate" className="text-sm font-medium">Start Date</label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="endDate" className="text-sm font-medium">End Date</label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 bg-gray-50 dark:bg-gray-800/50">
            <Button 
              variant="secondary" 
              className="w-full sm:w-auto"
              onClick={() => {
                setSelectedCategory("All Categories");
                setSelectedPeriod("30d");
                setStartDate("");
                setEndDate("");
                handleFilterChange();
              }}
            >
              Reset Filters
            </Button>
            <Button 
              className="w-full sm:w-auto" 
              onClick={handleFilterChange}
              disabled={isLoading}
            >
              Apply Filters
            </Button>
          </CardFooter>
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <Tabs defaultValue="dashboard" className="w-full">
              <div className="flex justify-between items-center mb-4">
                <TabsList>
                  <TabsTrigger value="dashboard" className="flex items-center">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Dashboard
                  </TabsTrigger>
                  <TabsTrigger value="detailed" className="flex items-center">
                    <LineChartIcon className="mr-2 h-4 w-4" />
                    Detailed Analysis
                  </TabsTrigger>
                </TabsList>
                <Select defaultValue="units">
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Units" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="units">Units</SelectItem>
                    <SelectItem value="value">Value ($)</SelectItem>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <TabsContent value="dashboard" className="space-y-6">
                {isLoading ? (
                  <div className="h-[400px] flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-semibold">Demand Forecast Overview</CardTitle>
                        <CardDescription>Predicted demand vs. current stock levels for the selected period</CardDescription>
                      </CardHeader>
                      <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={demandOverview}
                            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                            <XAxis 
                              dataKey="name" 
                              tick={{ fontSize: 12 }} 
                              axisLine={{ stroke: "#e5e7eb" }}
                              tickLine={false}
                            />
                            <YAxis 
                              tick={{ fontSize: 12 }}
                              axisLine={{ stroke: "#e5e7eb" }}
                              tickLine={false}
                              label={{ value: 'Units', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#6b7280', fontSize: 12 } }}
                            />
                            <Tooltip 
                              formatter={(value) => [`${value} units`, ""]}
                              contentStyle={{ 
                                borderRadius: "0.375rem", 
                                border: "none", 
                                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                                backgroundColor: "rgba(255, 255, 255, 0.9)"
                              }}
                            />
                            <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} />
                            <Area 
                              type="monotone" 
                              dataKey="forecast" 
                              name="Forecasted Demand" 
                              stroke="#6366f1" 
                              fill="#6366f1" 
                              fillOpacity={0.1} 
                              animationDuration={1500}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="actual" 
                              name="Current Stock" 
                              stroke="#f97316" 
                              fill="#f97316" 
                              fillOpacity={0.1} 
                              animationDuration={1500}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-semibold">Forecast Accuracy</CardTitle>
                        <CardDescription>Historical accuracy of AI predictions over time</CardDescription>
                      </CardHeader>
                      <CardContent className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={accuracyTrend}
                            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                            <XAxis 
                              dataKey="month" 
                              tick={{ fontSize: 12 }} 
                              axisLine={{ stroke: "#e5e7eb" }}
                              tickLine={false}
                            />
                            <YAxis 
                              tick={{ fontSize: 12 }}
                              axisLine={{ stroke: "#e5e7eb" }}
                              tickLine={false}
                              domain={[70, 100]}
                              label={{ value: 'Accuracy (%)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#6b7280', fontSize: 12 } }}
                            />
                            <Tooltip 
                              formatter={(value) => [`${value}%`, "Accuracy"]}
                              contentStyle={{ 
                                borderRadius: "0.375rem", 
                                border: "none", 
                                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                                backgroundColor: "rgba(255, 255, 255, 0.9)"
                              }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="accuracy" 
                              name="Prediction Accuracy" 
                              stroke="#10b981" 
                              strokeWidth={2}
                              dot={{ r: 4 }}
                              activeDot={{ r: 6 }}
                              animationDuration={1500}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </>
                )}
              </TabsContent>

              <TabsContent value="detailed" className="space-y-6">
                {isLoading ? (
                  <div className="h-[400px] flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-semibold">Seasonal Demand Patterns</CardTitle>
                        <CardDescription>Monthly demand patterns showing seasonal trends</CardDescription>
                      </CardHeader>
                      <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={seasonalPattern}
                            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                            <XAxis 
                              dataKey="month" 
                              tick={{ fontSize: 12 }} 
                              axisLine={{ stroke: "#e5e7eb" }}
                              tickLine={false}
                            />
                            <YAxis 
                              tick={{ fontSize: 12 }}
                              axisLine={{ stroke: "#e5e7eb" }}
                              tickLine={false}
                              label={{ value: 'Relative Demand', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#6b7280', fontSize: 12 } }}
                            />
                            <Tooltip 
                              formatter={(value) => [`${value}%`, "Relative Demand"]}
                              contentStyle={{ 
                                borderRadius: "0.375rem", 
                                border: "none", 
                                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                                backgroundColor: "rgba(255, 255, 255, 0.9)"
                              }}
                            />
                            <Bar 
                              dataKey="demand" 
                              name="Demand Index" 
                              fill="#6366f1" 
                              radius={[4, 4, 0, 0]}
                              animationDuration={1500}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                      <CardFooter className="border-t p-4 bg-gray-50 dark:bg-gray-800/50">
                        <div className="flex items-start">
                          <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-blue-800 dark:text-blue-300">AI Insight</p>
                            <p className="text-sm text-blue-600 dark:text-blue-400">Demand peaks in July and December. Plan for a 20% increase in inventory during these months.</p>
                          </div>
                        </div>
                      </CardFooter>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg font-semibold">Top Products Forecast</CardTitle>
                            <CardDescription>AI-predicted demand for top products in the next {selectedPeriod === "30d" ? "30 days" : "period"}</CardDescription>
                          </div>
                          <Button variant="outline" size="sm" className="flex items-center">
                            <Download className="mr-2 h-4 w-4" />
                            Export
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="rounded-md border overflow-hidden">
                          <table className="w-full">
                            <thead>
                              <tr className="bg-gray-50 dark:bg-gray-800/50 border-b">
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                                <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Current Stock</th>
                                <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Forecasted Demand</th>
                                <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Difference</th>
                                <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Accuracy</th>
                                <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Trend</th>
                              </tr>
                            </thead>
                            <tbody>
                              {topProductsForecast.map((product, index) => (
                                <tr key={index} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                                  <td className="py-3 px-4 text-sm font-medium">{product.item_name}</td>
                                  <td className="py-3 px-4 text-sm">
                                    <Badge variant="secondary" className="font-normal">
                                      {product.item_category}
                                    </Badge>
                                  </td>
                                  <td className="py-3 px-4 text-sm text-center">{product.current_stock}</td>
                                  <td className="py-3 px-4 text-sm text-center">{product.predicted_demand}</td>
                                  <td className="py-3 px-4 text-sm text-center">
                                    <span className={cn(
                                      "font-medium",
                                      product.difference > 0 ? "text-green-600" : "text-red-600"
                                    )}>
                                      {product.difference > 0 ? "+" : ""}{product.difference}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-sm text-center">
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
                                      {product.confidence_score}%
                                    </Badge>
                                  </td>
                                  <td className="py-3 px-4 text-sm text-center">
                                    {product.trend === "increasing" && (
                                      <Badge className="bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
                                        Increasing
                                      </Badge>
                                    )}
                                    {product.trend === "decreasing" && (
                                      <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                                        Decreasing
                                      </Badge>
                                    )}
                                    {product.trend === "stable" && (
                                      <Badge className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
                                        Stable
                                      </Badge>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </TabsContent>
            </Tabs>
          </div>

          <div className="xl:col-span-1">
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center">
                  <BrainCircuit className="mr-2 h-5 w-5 text-primary" />
                  AI Insights
                </CardTitle>
                <CardDescription>Smart inventory recommendations based on AI analysis</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-48 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {aiInsights.map((insight, index) => {
                      const IconComponent = insightIcons[insight.type] || insightIcons.default;
                      return (
                        <div 
                          key={index} 
                          className="p-4 border rounded-lg hover:shadow-md transition-shadow duration-200 hover:bg-gray-50 dark:hover:bg-gray-900"
                        >
                          <div className="flex items-start">
                            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 mr-3">
                              <IconComponent className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-semibold">{insight.title}</h4>
                                <Badge variant="outline" className="text-xs">
                                  {insight.category}
                                </Badge>
                              </div>
                              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{insight.description}</p>
                              {insight.action_required && (
                                <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium">
                                  Action Required: {insight.action_description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    <Button variant="outline" className="w-full flex items-center justify-center mt-2">
                      View All Insights
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <ForecastingPanel />
      </div>
    </AppLayout>
  );
}
