"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Eye, Package, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAdminSettingsStore } from "@/lib/stores/admin-settings-store";
import { formatAmount } from "@/lib/utils/currency";

interface Order {
  id: string;
  userId: string;
  total: number;
  status: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  orderItems: Array<{
    quantity: number;
    product: {
      name: string;
      price: number;
    };
  }>;
}

export default function AdminOrdersPage() {
  const t = useTranslations("Admin Orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const defaultCurrency = useAdminSettingsStore((state) => state.defaultCurrency);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
      });

      if (searchTerm) params.set("search", searchTerm);
      if (statusFilter !== "all") params.set("status", statusFilter);

      const response = await fetch(`/api/admin/orders?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch orders");
      }

      setOrders(data.orders || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update order status");
      }

      toast.success(t("orderStatusUpdated"));
      fetchOrders();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update order",
      );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">{t("loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-border bg-card p-6 shadow-xl">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {t("commerceWorkspace")}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
            {t("orders")}
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {t("ordersDescription")}
          </p>
        </div>
      </section>

      <Card className="apex-stat-card">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("searchOrders")}
                  className="rounded-xl pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48 rounded-xl border-border bg-background">
                <SelectValue placeholder={t("filterByStatus")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allStatus")}</SelectItem>
                <SelectItem value="pending">{t("pending")}</SelectItem>
                <SelectItem value="processing">{t("processing")}</SelectItem>
                <SelectItem value="shipped">{t("shipped")}</SelectItem>
                <SelectItem value="delivered">{t("delivered")}</SelectItem>
                <SelectItem value="cancelled">{t("cancelled")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="apex-stat-card">
        <CardHeader>
          <CardTitle className="text-base font-semibold tracking-tight text-foreground">
            {t("ordersCount", { count: orders.length })}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {error && (
            <div className="rounded-2xl border border-border bg-destructive/10 p-4 text-center">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {orders.length === 0 ? (
            <div className="py-12 text-center">
              <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{t("noOrdersFound")}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("table.orderId")}</TableHead>
                    <TableHead>{t("table.customer")}</TableHead>
                    <TableHead>{t("table.items")}</TableHead>
                    <TableHead>{t("table.total")}</TableHead>
                    <TableHead>{t("table.status")}</TableHead>
                    <TableHead>{t("table.date")}</TableHead>
                    <TableHead>{t("table.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        #{order.id.slice(-8)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.user?.name ?? t("guest")}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.user?.email ?? "-"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {order.orderItems?.length ?? 0} {t("item")}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatAmount(Number(order.total), defaultCurrency)}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={order.status}
                          onValueChange={(value) =>
                            updateOrderStatus(order.id, value)
                          }
                        >
                          <SelectTrigger className="w-32 rounded-xl border-border bg-background">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">{t("pending")}</SelectItem>
                            <SelectItem value="processing">{t("processing")}</SelectItem>
                            <SelectItem value="shipped">{t("shipped")}</SelectItem>
                            <SelectItem value="delivered">{t("delivered")}</SelectItem>
                            <SelectItem value="cancelled">{t("cancelled")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="rounded-xl">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex justify-center rounded-[1.5rem] border border-border bg-card p-4 shadow-lg">
          <div className="flex flex-col gap-3 text-sm text-muted-foreground md:flex-row md:items-center">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="rounded-xl"
            >
              {t("previous")}
            </Button>
            <span className="flex items-center justify-center px-4">
              {t("pageXOfY", { current: currentPage, total: totalPages })}
            </span>
            <Button
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="rounded-xl"
            >
              {t("next")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

