/**
 * Module for page
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

// Force dynamic rendering to avoid prerendering issues
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { ArrowRight, Clock, Percent, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DealsPage() {
  // Mock deals data - in a real app, this would come from an API
  const deals = [
    {
      id: 1,
      title: "Flash Sale - 50% Off Electronics",
      description: "Limited time offer on all electronics. Don't miss out!",
      discount: 50,
      originalPrice: 999,
      salePrice: 499,
      category: "Electronics",
      endsIn: "2 days",
      image: "/placeholder-electronics.jpg",
    },
    {
      id: 2,
      title: "Fashion Week Special",
      description: "Up to 70% off on summer collection",
      discount: 70,
      originalPrice: 299,
      salePrice: 89,
      category: "Fashion",
      endsIn: "5 days",
      image: "/placeholder-fashion.jpg",
    },
    {
      id: 3,
      title: "Home & Garden Clearance",
      description: "End of season clearance on garden tools and decor",
      discount: 40,
      originalPrice: 199,
      salePrice: 119,
      category: "Home & Garden",
      endsIn: "1 week",
      image: "/placeholder-home.jpg",
    },
  ];

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
            <span className="text-foreground">Deals</span>
          </nav>
        </div>
      </div>

      <div className="container px-4 py-8">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            <Percent className="mr-1 h-3 w-3" />
            Limited Time Offers
          </Badge>
          <h1 className="text-4xl font-bold mb-4">Special Deals & Offers</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover amazing discounts and special offers on our best products.
            Save big before these deals expire!
          </p>
        </div>

        {/* Featured Deal */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Featured Deal</h2>
          <Card className="bg-linear-to-r from-primary/5 to-secondary/5 style={{ borderColor: 'rgb(59, 130, 246)' }}/20">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1">
                  <Badge className="mb-4 bg-red-500">🔥 Hot Deal</Badge>
                  <h3 className="text-3xl font-bold mb-4">
                    Mega Electronics Sale
                  </h3>
                  <p className="text-lg text-muted-foreground mb-6">
                    Up to 70% off on laptops, smartphones, and accessories.
                    Limited stock available!
                  </p>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-orange-500" />
                      <span className="font-semibold">Ends in 24 hours</span>
                    </div>
                  </div>
                  <Button size="lg" asChild={true}>
                    <Link href="/products?category=electronics&onSale=true">
                      Shop Electronics Deals
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <div className="w-full md:w-96 h-64 bg-linear-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center">
                  <Percent className="h-24 w-24 style={{ color: 'rgb(59, 130, 246)' }}/50" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* All Deals */}
        <div>
          <h2 className="text-2xl font-bold mb-6">All Current Deals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deals.map((deal) => (
              <Card
                key={deal.id}
                className="group hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <Badge variant="destructive" className="mb-2">
                      -{deal.discount}%
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {deal.endsIn}
                    </div>
                  </div>
                  <div className="aspect-square bg-muted rounded-lg mb-4 flex items-center justify-center">
                    <Tag className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <CardTitle className="line-clamp-2 group-hover:style={{ color: 'rgb(59, 130, 246)' }} transition-colors">
                    {deal.title}
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="text-muted-foreground mb-4 line-clamp-3">
                    {deal.description}
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Original Price:
                      </span>
                      <span className="text-sm line-through text-muted-foreground">
                        ${deal.originalPrice}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Sale Price:
                      </span>
                      <span className="text-lg font-bold text-green-600">
                        ${deal.salePrice}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        You Save:
                      </span>
                      <span className="text-sm font-semibold text-green-600">
                        ${(deal.originalPrice - deal.salePrice).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter>
                  <Button className="w-full" asChild={true}>
                    <Link
                      href={`/products?category=${deal.category.toLowerCase().replace(" & ", "-").replace(" ", "-")}&onSale=true`}
                    >
                      View Deal
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="mt-16 bg-muted/30 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">Never Miss a Deal</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Subscribe to our newsletter and be the first to know about new deals
            and special offers.
          </p>
          <Button size="lg" asChild={true}>
            <Link href="/auth/signup?redirect=/deals">Subscribe for Deals</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
