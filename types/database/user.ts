/**
 * Module for user
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
export interface User {
  id: string;
  name: string | null;
  email: string;
  username: string | null;
  phone_number: string | null;
  role: string;
  picture: string | null;
  emailVerified: Date | null;
  active: boolean | null;
  created_at: Date;
  updated_at: Date;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
  address?: Address[];
}

export interface UserWithCounts extends User {
  _count: {
    order: number;
    address: number;
  };
}

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
