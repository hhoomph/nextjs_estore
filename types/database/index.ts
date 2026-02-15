/**
 * Module for index
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
// User types
export interface User {
  id: string;
  name: string | null;
  email: string;
  phone_number: string | null;
  role: "USER" | "ADMIN";
  picture: string | null;
  image: string | null;
  emailVerified: Date | null;
  username: string | null;
  created_at: Date;
  updated_at: Date;
  active: boolean | null;
  address?: Address[];
}

// Product types
export interface Product {
  id: string;
  name: string | null;
  desc: string | null;
  slug: string | null;
  category_id: string;
  quantity: number;
  price: number;
  status: number | null;
  discount_price: number | null;
  created_at: Date;
  modified_at: Date;
  category?: Category;
  images?: ProductImage[];
  inStock: boolean;
  discount_percentage: number;
}

export interface ProductImage {
  id: string;
  url: string;
  alt?: string;
}

// Category types
export interface Category {
  id: string;
  parent_id: string | null;
  level: number | null;
  name: string | null;
  created_at: Date;
  modified_at: Date;
}

// Cart types
export interface CartItem {
  id: string;
  session_id: string | null;
  product_id: string;
  product_options_id: string | null;
  quantity: number;
  created_at: Date | null;
  modified_at: Date | null;
  user_id: string | null;
  product: Product;
}

export interface CartItemWithProduct extends CartItem {
  product: Product;
}

// Order types
export interface Order {
  id: string;
  user_id: string;
  session_id: string | null;
  total: number;
  deliver_date: Date | null;
  discount_id: string | null;
  payment_id: string | null;
  created_at: Date;
  modified_at: Date;
  order_items: OrderItem[];
  payment?: Payment[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  created_at: Date;
  modified_at: Date;
  product: Product;
}

export interface Payment {
  id: string;
  use_id: string;
  order_id: string;
  amount: number;
  provider: string | null;
  status: string;
  transaction_code: string | null;
  Bank_Refrence: string | null;
  describe: string | null;
  created_at: Date;
  modified_at: Date;
}

// Review types
export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  created_at: Date;
  updated_at: Date;
  user: User;
}

// Wishlist types
export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: Date;
  product: Product;
}

// Address types
export interface Address {
  id: string;
  user_id: string;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  telephone: string | null;
  mobile: string | null;
  location: string | null;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ProductForm {
  name: string;
  desc: string;
  slug: string;
  category_id: string;
  quantity: number;
  price: number;
  discount_price?: number;
  status: number;
}

export interface AddressForm {
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  telephone?: string;
  mobile?: string;
}

// Search and filter types
export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sortBy?:
    | "price_asc"
    | "price_desc"
    | "name_asc"
    | "name_desc"
    | "newest"
    | "oldest";
  search?: string;
}

export interface SearchParams {
  q?: string;
  category?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  filters?: ProductFilters;
}

// Dashboard types
export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  recentOrders: Order[];
  lowStockProducts: Product[];
}

// Component prop types
export interface ComponentWithChildren {
  children: React.ReactNode;
}

export interface ComponentWithClassName {
  className?: string;
}

// Zustand store types
export interface CartStore {
  items: CartItemWithProduct[];
  isOpen: boolean;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getTotalPrice: () => number;
  toggleCart: () => void;
  setCartOpen: (open: boolean) => void;
}

export interface WishlistStore {
  items: WishlistItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  getItemCount: () => number;
}

// Better Auth types
export interface AuthUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
}

export interface AuthSession {
  user: AuthUser;
  session: {
    id: string;
    userId: string;
    expires: Date;
  };
}

// Blog types
export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  order: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  posts?: BlogPost[];
}

export interface BlogCategoryWithCount extends BlogCategory {
  _posts: { id: string }[];
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  createdAt: Date;
  posts?: BlogPostTag[];
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featuredImage: string | null;
  status: string;
  publishedAt: Date | null;
  authorId: string;
  categoryId: string;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  ogImage: string | null;
  canonicalUrl: string | null;
  readingTime: number | null;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
  author?: User;
  category?: BlogCategory;
  tags?: BlogPostTag[];
  comments?: BlogComment[];
}

export interface BlogPostWithContent extends BlogPost {
  author: User;
  category: BlogCategory;
  tags: BlogPostTag[];
  comments: BlogComment[];
}

export interface BlogPostTag {
  id: string;
  postId: string;
  tagId: string;
  post?: BlogPost;
  tag?: BlogTag;
}

export interface BlogComment {
  id: string;
  content: string;
  authorId: string;
  postId: string;
  parentId: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  author?: User;
  post?: BlogPost;
  replies?: BlogComment[];
  parent?: BlogComment;
}

// Pagination types
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}
