
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useAIDemandForecast, useAIHealth } from '@/hooks/useAI';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export function ForecastingPanel() {
  const { data: forecastData, isLoading: forecastLoading, error: forecastError } = useAIDemandForecast();
  const { data: aiHealth, isLoading: healthLoading } = useAIHealth();

  if (forecastLoading || healthLoading) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            AI-Powered Demand Forecasting
          </CardTitle>
          <CardDescription>Loading AI predictions...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (forecastError) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            AI-Powered Demand Forecasting
          </CardTitle>
          <CardDescription>Error loading AI predictions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-red-600 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Failed to load AI forecast data
          </div>
        </CardContent>
      </Card>
    );
  }

  const forecasts = forecastData?.forecasts || [];
  const insights = forecastData?.insights || [];
  const accuracy = forecastData?.overall_accuracy || 0;
  const isAIHealthy = aiHealth?.status === 'healthy';

  // Get top 5 forecasts for display
  const topForecasts = forecasts.slice(0, 5);
  
  // Get high priority insights
  const highPriorityInsights = insights.filter(insight => insight.priority === 'high');

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          AI-Powered Demand Forecasting
          {isAIHealthy ? (
            <Badge variant="outline" className="text-green-600 border-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              AI Active
            </Badge>
          ) : (
            <Badge variant="outline" className="text-orange-600 border-orange-600">
              <Clock className="h-3 w-3 mr-1" />
              AI Limited
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          AI-powered demand predictions with {accuracy}% accuracy
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* AI Accuracy */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>AI Model Accuracy</span>
            <span className="font-medium">{accuracy}%</span>
          </div>
          <Progress value={accuracy} className="h-2" />
        </div>

        {/* Top Forecasts and AI Insights - Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Demand Predictions */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Top Demand Predictions</h4>
            <div className="space-y-2">
              {topForecasts.map((forecast, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{forecast.item_name}</div>
                    <div className="text-xs text-gray-600">{forecast.recommendation}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-sm">{forecast.predicted_demand} units</div>
                    <div className="flex items-center gap-1">
                      <Badge 
                        variant={forecast.risk_level === 'high' ? 'destructive' : 
                                forecast.risk_level === 'medium' ? 'secondary' : 'default'}
                        className="text-xs"
                      >
                        {forecast.risk_level}
                      </Badge>
                      <span className="text-xs text-gray-500">{forecast.confidence_score}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Insights */}
          {highPriorityInsights.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  AI Insights
                </h4>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    // This could open a detailed insights modal or navigate to insights page
                    console.log('View all insights clicked');
                  }}
                >
                  View All Insights
                </Button>
              </div>
              <div className="space-y-3">
                {highPriorityInsights.map((insight, index) => (
                  <div key={index} className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-sm text-orange-800">{insight.type}</div>
                      <Badge 
                        variant={insight.priority === 'high' ? 'destructive' : 
                                insight.priority === 'medium' ? 'secondary' : 'default'}
                        className="text-xs"
                      >
                        {insight.priority} priority
                      </Badge>
                    </div>
                    <div className="text-sm text-orange-700 mb-3">{insight.description}</div>
                    
                    {/* Detailed Breakdown */}
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-orange-800">Detailed Analysis:</div>
                      <div className="text-xs text-orange-700 space-y-1">
                        <div>• <strong>Category:</strong> {insight.category || 'General'}</div>
                        <div>• <strong>Action Required:</strong> {insight.action_required ? 'Yes' : 'No'}</div>
                        {insight.action_description && (
                          <div>• <strong>Recommended Action:</strong> {insight.action_description}</div>
                        )}
                        <div>• <strong>Impact Level:</strong> {insight.priority === 'high' ? 'Critical - Immediate attention needed' : 
                                                             insight.priority === 'medium' ? 'Moderate - Review within 24 hours' : 
                                                             'Low - Monitor closely'}</div>
                      </div>
                    </div>
                    
                    {/* Action Items */}
                    {insight.action_required && (
                      <div className="mt-3 pt-3 border-t border-orange-200">
                        <div className="text-xs font-medium text-orange-800 mb-2">Immediate Actions:</div>
                        <div className="text-xs text-orange-700 space-y-1">
                          <div>1. Review current stock levels</div>
                          <div>2. Check supplier availability</div>
                          <div>3. Update reorder points if needed</div>
                          <div>4. Monitor demand patterns</div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* AI Status */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">AI Service Status</span>
            <div className="flex items-center gap-2">
              {isAIHealthy ? (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="h-3 w-3" />
                  <span>Operational</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-orange-600">
                  <Clock className="h-3 w-3" />
                  <span>Limited</span>
                </div>
              )}
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Model: {aiHealth?.model || 'Unknown'} | AI-powered predictions
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
