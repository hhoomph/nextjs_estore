"use client";

import { Package, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "@/lib/auth-client";

interface OrderItem {
  id: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    discountPrice: number | null;
    image: string | null;
  };
  quantity: number;
}

interface Order {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  transactionCode: string | null;
  createdAt: string;
  items: OrderItem[];
}

interface OrdersResponse {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function OrdersPage() {
  const { data: session, isPending } = useSession();
  const [isClient, setIsClient] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!session?.user) return;

    const loadOrders = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/orders");
        const data = (await response.json()) as OrdersResponse;

        if (!response.ok) {
          const errorData = data as unknown as { error?: string } | undefined;
          throw new Error(errorData?.error || "Failed to fetch orders");
        }

        setOrders(data.orders ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };

    void loadOrders();
  }, [session?.user?.id]);

  if (!isClient || isPending || loading) {
    return (
      <div className="container px-4 py-16 text-center">
        <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">Orders</h1>
        <p className="text-muted-foreground">Loading your orders...</p>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="container px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
          <p className="text-muted-foreground mb-6">You need to be signed in to view your orders.</p>
          <Button asChild={true}>
            <Link href="/auth/signin?redirect=/orders">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <div className="border-b">
        <div className="container px-4 py-3">
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <Link href="/account" className="hover:text-foreground">Account</Link>
            <span>/</span>
            <span className="text-foreground">Orders</span>
          </nav>
        </div>
      </div>

      <div className="container px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Orders</h1>
          <p className="text-muted-foreground">Review your recent order history.</p>
        </div>

        {error && (
          <Card className="mb-6 border-destructive/40">
            <CardHeader>
              <CardTitle className="text-destructive">Unable to load orders</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
          </Card>
        )}

        {orders.length === 0 ? (
          <Card>
            <CardHeader>
              <Package className="h-12 w-12 text-muted-foreground mb-3" />
              <CardTitle>No orders yet</CardTitle>
              <CardDescription>Orders you place will appear here.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild={true}>
                <Link href="/products">Browse Products</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle>Order #{order.orderNumber}</CardTitle>
                      <CardDescription>{new Date(order.createdAt).toLocaleDateString()}</CardDescription>
                    </div>
                    <Badge variant={order.status === "completed" ? "default" : "secondary"}>{order.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {order.items.length} item{order.items.length === 1 ? "" : "s"} · 
                  </p>
                  {order.items.slice(0, 3).map((item) => (
                    <p key={item.id} className="text-sm">
                      {item.quantity} × {item.product.name}
                    </p>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
