/**
 * Module for page
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
"use client";

import { useState } from "react";

// Force Node.js runtime for account features
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import {
  Bell,
  CreditCard,
  Edit,
  Heart,
  LogOut,
  MapPin,
  Package,
  Settings,
  ShoppingBag,
  User,
} from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { signOut, useSession } from "@/lib/auth-client";

export default function AccountPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("overview");

  if (!session?.user) {
    return (
      <div className="container px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
          <p className="text-muted-foreground mb-6">
            You need to be signed in to access your account.
          </p>
          <div className="space-x-4">
            <Button asChild={true}>
              <Link href="/auth/signin?redirect=/account">Sign In</Link>
            </Button>
            <Button variant="outline" asChild={true}>
              <Link href="/auth/signup?redirect=/account">Sign Up</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/";
        },
      },
    });
  };

  return (
    <div className="bg-background">
      {/* Breadcrumb */}
      <div className="border-b">
        <div className="container px-4 py-3">
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
            <span>/</span>
            <span className="text-foreground">Account</span>
          </nav>
        </div>
      </div>

      <div className="container px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
            <Avatar className="h-20 w-20">
              <AvatarImage
                src={session.user.image || ""}
                alt={session.user.name || ""}
              />
              <AvatarFallback className="text-xl">
                {session.user.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold">
                    {session.user.name || "User"}
                  </h1>
                  <p className="text-muted-foreground">{session.user.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary">
                      {session.user.role === "ADMIN"
                        ? "Administrator"
                        : "Customer"}
                    </Badge>
                    <Badge variant="outline">Verified</Badge>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Link href="/settings">
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSignOut()}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Account Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
              <TabsTrigger value="addresses">Addresses</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Orders
                    </CardTitle>
                    <ShoppingBag className="h-4 w-4 text-muted-foreground ml-auto" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">12</div>
                    <p className="text-xs text-muted-foreground">
                      +2 from last month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Wishlist Items
                    </CardTitle>
                    <Heart className="h-4 w-4 text-muted-foreground ml-auto" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">8</div>
                    <p className="text-xs text-muted-foreground">
                      +3 from last week
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Spent
                    </CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground ml-auto" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">$1,234</div>
                    <p className="text-xs text-muted-foreground">
                      +$456 from last month
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Order #12345</p>
                          <p className="text-sm text-muted-foreground">
                            2 days ago
                          </p>
                        </div>
                        <Badge>Shipped</Badge>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Order #12344</p>
                          <p className="text-sm text-muted-foreground">
                            1 week ago
                          </p>
                        </div>
                        <Badge variant="outline">Delivered</Badge>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      asChild={true}
                    >
                      <Link href="/orders">View All Orders</Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Account Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      asChild={true}
                    >
                      <Link href="/settings">
                        <Settings className="h-4 w-4 mr-2" />
                        Account Settings
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      asChild={true}
                    >
                      <Link href="/orders">
                        <Package className="h-4 w-4 mr-2" />
                        Order History
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      asChild={true}
                    >
                      <Link href="/wishlist">
                        <Heart className="h-4 w-4 mr-2" />
                        My Wishlist
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Bell className="h-4 w-4 mr-2" />
                      Notifications
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Order History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No orders yet
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      When you place your first order, it will appear here.
                    </p>
                    <Button asChild={true}>
                      <Link href="/products">Start Shopping</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Wishlist Tab */}
            <TabsContent value="wishlist" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>My Wishlist</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      Your wishlist is empty
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Save items you love for later by clicking the heart icon.
                    </p>
                    <Button asChild={true}>
                      <Link href="/products">Browse Products</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Addresses Tab */}
            <TabsContent value="addresses" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Saved Addresses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No addresses saved
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Add delivery addresses to speed up your checkout process.
                    </p>
                    <Button>
                      <Edit className="h-4 w-4 mr-2" />
                      Add Address
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
