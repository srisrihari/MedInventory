
import { cn } from "@/lib/utils";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

const statCardVariants = cva(
  "stat-card",
  {
    variants: {
      trend: {
        positive: "border-l-4 border-l-green-500",
        negative: "border-l-4 border-l-red-500",
        neutral: "border-l-4 border-l-gray-300",
      },
    },
    defaultVariants: {
      trend: "neutral",
    },
  }
);

interface StatsCardProps extends VariantProps<typeof statCardVariants> {
  title: string;
  value: string | number;
  description?: string;
  percentageChange?: number;
  icon: React.ElementType;
  className?: string;
}

export function StatsCard({
  title,
  value,
  description,
  percentageChange = 0,
  icon: Icon,
  trend,
  className,
}: StatsCardProps) {
  const isPositive = percentageChange > 0;
  const isNegative = percentageChange < 0;
  const displayTrend = isPositive ? "positive" : isNegative ? "negative" : "neutral";

  return (
    <div className={cn(statCardVariants({ trend: trend ?? displayTrend }), className)}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
        </div>
        <div className="rounded-full p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {percentageChange !== undefined && (
        <div className="flex items-center mt-4">
          {isPositive ? (
            <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
          ) : isNegative ? (
            <ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" />
          ) : null}
          <span
            className={cn(
              "text-sm font-medium",
              isPositive ? "text-green-500" : isNegative ? "text-red-500" : "text-gray-500"
            )}
          >
            {Math.abs(percentageChange)}% {isPositive ? "increase" : isNegative ? "decrease" : ""}
          </span>
          {description && (
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-1.5">
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
