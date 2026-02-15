/**
 * Module for address
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
// Address-related type definitions

export interface Address {
  id: string;
  userId: string;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  telephone: string | null;
  mobile: string | null;
  location: string | null; // GPS coordinates as "lat,lng"
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AddressFormData {
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  telephone?: string;
  mobile: string;
  location?: string;
  is_default?: boolean;
}

export interface UpdateAddressData extends AddressFormData {
  id: string;
  user_id: string;
}

export interface SetDefaultAddressData {
  addressId: string;
}

// Address validation schemas (for reference)
export const addressValidationRules = {
  address_line1: {
    required: true,
    minLength: 5,
    maxLength: 255,
  },
  address_line2: {
    required: false,
    maxLength: 255,
  },
  city: {
    required: true,
    minLength: 2,
    maxLength: 100,
  },
  state: {
    required: true,
    minLength: 2,
    maxLength: 100,
  },
  postal_code: {
    required: true,
    pattern: /^[0-9]{5,10}$/,
  },
  telephone: {
    required: false,
    pattern: /^[0-9+\-\s()]{7,20}$/,
  },
  mobile: {
    required: true,
    pattern: /^[0-9+\-\s()]{7,20}$/,
  },
  location: {
    required: false,
    pattern: /^-?\d{1,3}\.\d{1,10},-?\d{1,3}\.\d{1,10}$/, // lat,lng format
  },
};

// Address display utilities
export const formatAddress = (address: Address): string => {
  const parts = [
    address.addressLine1,
    address.addressLine2,
    address.city,
    address.state,
    address.postalCode,
  ].filter(Boolean);

  return parts.join(", ");
};

export const parseCoordinates = (location: string): [number, number] | null => {
  if (!location) return null;

  const parts = location.split(",").map((part) => parseFloat(part.trim()));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return [parts[0], parts[1]];
  }
  return null;
};

export const formatCoordinates = (lat: number, lng: number): string => {
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
};

// Address API response types
export interface AddressApiResponse {
  success: boolean;
  addresses?: Address[];
  address?: Address;
  error?: string;
}

// Address component prop types
export interface AddressSelectorProps {
  selectedAddressId?: string;
  onAddressSelect: (address: Address | null) => void;
  onAddNew?: () => void;
  title?: string;
  description?: string;
  allowNullSelection?: boolean;
}

export interface AddressFormProps {
  address?: Address;
  onSuccess: () => void;
  onCancel: () => void;
}

export interface AddressListProps {
  onEdit: (address: Address) => void;
  onAddNew: () => void;
}

export interface AddressMapProps {
  className?: string;
  height?: number | string;
  zoom?: number;
  showControls?: boolean;
  onAddressSelect?: (address: Address) => void;
  addresses?: Address[];
}
