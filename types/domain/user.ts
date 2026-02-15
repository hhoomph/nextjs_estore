/**
 * Module for user
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
// Domain types for User entity
export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  preferences: UserPreferences;
  addresses: UserAddress[];
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export type UserRole = "customer" | "admin" | "moderator" | "vendor";

export type UserStatus =
  | "active"
  | "inactive"
  | "suspended"
  | "pending_verification";

export interface UserPreferences {
  language: string;
  currency: string;
  timezone: string;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    marketing: boolean;
    orderUpdates: boolean;
  };
  privacy: {
    profileVisibility: "public" | "private" | "friends";
    showOnlineStatus: boolean;
    allowMessages: boolean;
  };
}

export interface UserAddress {
  id: string;
  type: "billing" | "shipping" | "home" | "work";
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

// Authentication types
export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  acceptTerms: boolean;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirmRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Profile update types
export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: File;
  preferences?: Partial<UserPreferences>;
}

export interface AddAddressRequest {
  type: UserAddress["type"];
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault?: boolean;
}

export interface UpdateAddressRequest extends Partial<AddAddressRequest> {
  id: string;
}

// API Response types
export interface UserProfileResponse {
  user: User;
  stats: {
    totalOrders: number;
    totalSpent: number;
    wishlistItems: number;
    reviewsCount: number;
  };
}

export interface UserListResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  filters: {
    role?: UserRole;
    status?: UserStatus;
    search?: string;
  };
}

// Form validation types
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
  acceptTerms: boolean;
}

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  phone: string;
  avatar?: File;
}

export interface AddressFormData {
  type: UserAddress["type"];
  firstName: string;
  lastName: string;
  company: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

// Session types
export interface Session {
  user: AuthUser;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface ActiveSession extends Session {
  id: string;
  createdAt: Date;
  lastActivityAt: Date;
  isCurrentSession: boolean;
}
