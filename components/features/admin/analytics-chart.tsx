/**
 * Module for analytics-chart
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ChartData {
  [key: string]: string | number | Date | undefined;
}

interface AnalyticsChartProps {
  type: "line" | "bar" | "area" | "pie";
  data: ChartData[];
  dataKey: string;
  xAxisKey?: string;
  yAxisKey?: string;
  height?: number;
  colors?: string[];
  showGrid?: boolean;
  showTooltip?: boolean;
  title?: string;
  formatter?: (
    value: number | string | undefined,
    name?: string,
  ) => [string, string];
}

const DEFAULT_COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#00ff00",
  "#ff00ff",
  "#00ffff",
  "#ff0000",
  "#0000ff",
  "#ffff00",
];

export function AnalyticsChart({
  type,
  data,
  dataKey,
  xAxisKey = "name",
  yAxisKey,
  height = 300,
  colors = DEFAULT_COLORS,
  showGrid = true,
  showTooltip = true,
  title,
  formatter,
}: AnalyticsChartProps) {
  const commonProps = {
    data,
    height,
  };

  const renderChart = () => {
    switch (type) {
      case "line":
        return (
          <LineChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis
              dataKey={xAxisKey}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                // Format date values
                if (
                  typeof value === "string" &&
                  value.match(/^\d{4}-\d{2}-\d{2}$/)
                ) {
                  return new Date(value).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }
                return value;
              }}
            />
            {yAxisKey && <YAxis dataKey={yAxisKey} tick={{ fontSize: 12 }} />}
            {showTooltip && (
              <Tooltip
                labelFormatter={(value) => {
                  if (
                    typeof value === "string" &&
                    value.match(/^\d{4}-\d{2}-\d{2}$/)
                  ) {
                    return new Date(value).toLocaleDateString();
                  }
                  return value;
                }}
                formatter={formatter}
              />
            )}
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={colors[0]}
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        );

      case "bar":
        return (
          <BarChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis
              dataKey={xAxisKey}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                if (
                  typeof value === "string" &&
                  value.match(/^\d{4}-\d{2}-\d{2}$/)
                ) {
                  return new Date(value).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }
                return value;
              }}
            />
            {yAxisKey && <YAxis tick={{ fontSize: 12 }} />}
            {showTooltip && (
              <Tooltip
                labelFormatter={(value) => {
                  if (
                    typeof value === "string" &&
                    value.match(/^\d{4}-\d{2}-\d{2}$/)
                  ) {
                    return new Date(value).toLocaleDateString();
                  }
                  return value;
                }}
                formatter={formatter}
              />
            )}
            <Bar dataKey={dataKey} fill={colors[0]} radius={[4, 4, 0, 0]} />
          </BarChart>
        );

      case "area":
        return (
          <AreaChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis
              dataKey={xAxisKey}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                if (
                  typeof value === "string" &&
                  value.match(/^\d{4}-\d{2}-\d{2}$/)
                ) {
                  return new Date(value).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }
                return value;
              }}
            />
            {yAxisKey && <YAxis tick={{ fontSize: 12 }} />}
            {showTooltip && (
              <Tooltip
                labelFormatter={(value) => {
                  if (
                    typeof value === "string" &&
                    value.match(/^\d{4}-\d{2}-\d{2}$/)
                  ) {
                    return new Date(value).toLocaleDateString();
                  }
                  return value;
                }}
                formatter={formatter}
              />
            )}
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={colors[0]}
              fill={colors[0]}
              fillOpacity={0.3}
            />
          </AreaChart>
        );

      case "pie":
        return (
          <PieChart {...commonProps}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent = 0 }) =>
                `${name}: ${(percent * 100).toFixed(1)}%`
              }
              outerRadius={80}
              fill="#8884d8"
              dataKey={dataKey}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Pie>
            {showTooltip && <Tooltip formatter={formatter} />}
          </PieChart>
        );

      default:
        return <div>Unsupported chart type</div>;
    }
  };

  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
}

// Specialized chart components for common use cases
export function SalesChart({
  data,
  period,
}: {
  data: ChartData[];
  period: string;
}) {
  return (
    <AnalyticsChart
      type="line"
      data={data}
      dataKey="revenue"
      xAxisKey="date"
      height={300}
      title="Revenue Trend"
      formatter={(value, name) => [`$${Number(value).toFixed(2)}`, "Revenue"]}
    />
  );
}

export function OrdersChart({
  data,
  period,
}: {
  data: ChartData[];
  period: string;
}) {
  return (
    <AnalyticsChart
      type="bar"
      data={data}
      dataKey="orders"
      xAxisKey="date"
      height={300}
      title="Orders Trend"
      colors={["#82ca9d"]}
      formatter={(value) => [String(value), "Orders"]}
    />
  );
}

export function UserGrowthChart({
  data,
  period,
}: {
  data: ChartData[];
  period: string;
}) {
  return (
    <AnalyticsChart
      type="area"
      data={data}
      dataKey="users"
      xAxisKey="date"
      height={250}
      title="User Growth"
      colors={["#8884d8"]}
      formatter={(value) => [String(value), "New Users"]}
    />
  );
}

export function CategoryChart({ data }: { data: ChartData[] }) {
  return (
    <AnalyticsChart
      type="pie"
      data={data}
      dataKey="revenue"
      height={250}
      title="Revenue by Category"
      formatter={(value) => [`$${Number(value).toFixed(2)}`, "Revenue"]}
    />
  );
}
