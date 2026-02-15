/**
 * Module for product
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
// Domain types for Product entity
export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  discountPrice?: number;
  quantity: number;
  status: ProductStatus;
  categoryId: string;
  images: ProductImage[];
  tags: string[];
  attributes: ProductAttribute[];
  variants: ProductVariant[];
  seo: ProductSEO;
  inventory: ProductInventory;
  createdAt: Date;
  updatedAt: Date;
}

export type ProductStatus = "active" | "inactive" | "draft" | "archived";

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  displayOrder: number;
  isPrimary: boolean;
}

export interface ProductAttribute {
  id: string;
  name: string;
  value: string;
  type: "text" | "number" | "boolean" | "color" | "size";
}

export interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  price: number;
  discountPrice?: number;
  quantity: number;
  attributes: Record<string, string>;
  images: string[];
}

export interface ProductSEO {
  title?: string;
  description?: string;
  keywords?: string[];
  canonicalUrl?: string;
}

export interface ProductInventory {
  trackInventory: boolean;
  lowStockThreshold: number;
  backorderAllowed: boolean;
  stockStatus: "in_stock" | "out_of_stock" | "on_backorder";
}

// API types for Product operations
export interface CreateProductRequest {
  name: string;
  slug?: string;
  description?: string;
  price: number;
  discountPrice?: number;
  quantity: number;
  status?: ProductStatus;
  categoryId: string;
  images?: string[];
  tags?: string[];
  attributes?: Omit<ProductAttribute, "id">[];
  seo?: ProductSEO;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  id: string;
}

export interface ProductFilters {
  category?: string;
  priceMin?: number;
  priceMax?: number;
  status?: ProductStatus;
  tags?: string[];
  search?: string;
  sortBy?: "name" | "price" | "created_at" | "rating";
  sortOrder?: "asc" | "desc";
}

export interface ProductListResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: ProductFilters;
}

// Form validation schemas (Zod)
export interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number;
  quantity: number;
  categoryId: string;
  images: File[];
  tags: string[];
  attributes: Array<{
    name: string;
    value: string;
    type: ProductAttribute["type"];
  }>;
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
}

// Cart and Order related types
export interface CartItem {
  product: Product;
  variant?: ProductVariant;
  quantity: number;
  price: number; // Final price including discounts
  total: number;
}

export interface OrderItem {
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  total: number;
  product: Pick<Product, "id" | "name" | "slug" | "images">;
  variant?: Pick<ProductVariant, "id" | "name" | "sku">;
}
