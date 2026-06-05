/**
 * Module for page
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
"use client";

import { Suspense, useEffect, useState } from "react";

// Force dynamic rendering to avoid prerendering issues
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "@/lib/auth-client";

interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  recentOrders: number;
  lowStockProducts: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  active: boolean;
}

interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  status: number;
  category: { name: string };
}

function DashboardContent() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");

  useEffect(() => {
    if (!isPending) {
      if (!session) {
        router.push("/");
        return;
      }

      if (session.user.role === "ADMIN") {
        // Redirect admin users to the admin panel
        router.push("/admin");
        return;
      }

      // Non-admin users see the regular dashboard
      fetchDashboardData();
    }
  }, [session, isPending, router]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch stats
      const statsResponse = await fetch("/api/dashboard/stats");
      const statsData = await statsResponse.json();
      setStats(statsData.stats || null);

      // Fetch users
      const usersResponse = await fetch("/api/users");
      const usersData = await usersResponse.json();
      setUsers(usersData.users || []);

      // Fetch products
      const productsResponse = await fetch("/api/products?limit=50");
      const productsData = await productsResponse.json();
      setProducts(productsData.products || []);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      // Set default values on error
      setStats(null);
      setUsers([]);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole =
      userRoleFilter === "all" || user.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  if (isPending || loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading dashboard...</span>
      </div>
    );
  }

  return null;
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading dashboard...</span>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
