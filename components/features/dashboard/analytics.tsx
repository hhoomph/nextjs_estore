/**
 * Module for analytics
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
"use client";

import { useCallback, useEffect, useState } from "react";

export function Analytics() {
  const [analytics, setAnalytics] = useState<{
    userGrowth: Array<{ month: string; users: number }>;
    orderStats: Array<{ status: string; count: number; percentage: number }>;
    revenueStats: Array<{ month: string; revenue: number }>;
    popularProducts: Array<{ name: string; sales: number; revenue: number }>;
  }>({
    userGrowth: [],
    orderStats: [],
    revenueStats: [],
    popularProducts: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      // This would typically fetch from an analytics API
      // For now, we'll use mock data
      setTimeout(() => {
        setAnalytics({
          userGrowth: [
            { month: "Jan", users: 120 },
            { month: "Feb", users: 150 },
            { month: "Mar", users: 180 },
            { month: "Apr", users: 220 },
            { month: "May", users: 280 },
            { month: "Jun", users: 350 },
          ],
          orderStats: [
            { status: "Completed", count: 145, percentage: 65 },
            { status: "Pending", count: 45, percentage: 20 },
            { status: "Cancelled", count: 30, percentage: 15 },
          ],
          revenueStats: [
            { month: "Jan", revenue: 12000 },
            { month: "Feb", revenue: 15000 },
            { month: "Mar", revenue: 18000 },
            { month: "Apr", revenue: 22000 },
            { month: "May", revenue: 28000 },
            { month: "Jun", revenue: 35000 },
          ],
          popularProducts: [
            { name: "Wireless Headphones", sales: 245, revenue: 12250 },
            { name: "Smart Watch", sales: 189, revenue: 28350 },
            { name: "Laptop Stand", sales: 156, revenue: 3120 },
            { name: "USB Cable", sales: 134, revenue: 402 },
            { name: "Phone Case", sales: 98, revenue: 980 },
          ],
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, []); // Remove fetchAnalytics from deps to avoid cascading renders

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">User Growth</h3>
          <div className="h-64 flex items-end justify-between space-x-2">
            {analytics.userGrowth.map((data, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div
                  className="bg-indigo-500 rounded-t w-full mb-2"
                  style={{ height: `${(data.users / 400) * 200}px` }}
                ></div>
                <span className="text-xs text-gray-600">{data.month}</span>
                <span className="text-xs font-medium">{data.users}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">
            Order Status Distribution
          </h3>
          <div className="space-y-3">
            {analytics.orderStats.map((stat, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{stat.status}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        stat.status === "Completed"
                          ? "bg-green-500"
                          : stat.status === "Pending"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                      style={{ width: `${stat.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium w-12 text-right">
                    {stat.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Trend */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
          <div className="h-64 flex items-end justify-between space-x-2">
            {analytics.revenueStats.map((data, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div
                  className="bg-green-500 rounded-t w-full mb-2"
                  style={{ height: `${(data.revenue / 40000) * 200}px` }}
                ></div>
                <span className="text-xs text-gray-600">{data.month}</span>
                <span className="text-xs font-medium">
                  ${data.revenue.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Products */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Popular Products</h3>
          <div className="space-y-3">
            {analytics.popularProducts.slice(0, 5).map((product, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {product.name}
                  </p>
                  <p className="text-xs text-gray-500">{product.sales} sales</p>
                </div>
                <span className="text-sm font-medium text-green-600">
                  ${product.revenue.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm">
                <span className="font-medium">John Doe</span> placed an order
                for $299.99
              </p>
              <p className="text-xs text-gray-500">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm">
                <span className="font-medium">Jane Smith</span> registered as a
                new user
              </p>
              <p className="text-xs text-gray-500">4 hours ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm">Order #1234 status changed to completed</p>
              <p className="text-xs text-gray-500">6 hours ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm">Payment failed for order #1235</p>
              <p className="text-xs text-gray-500">8 hours ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
