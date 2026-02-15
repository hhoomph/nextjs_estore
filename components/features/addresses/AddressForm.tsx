/**
 * Module for AddressForm
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
"use client";

/**
 * Address Form Component - Create and Edit User Addresses
 *
 * This component provides a comprehensive form for managing user addresses
 * with the following features:
 * - Address line inputs with validation
 * - City, state, postal code fields
 * - Phone number inputs with Persian number support
 * - Interactive map integration for location selection
 * - Default address setting
 * - Form validation with Zod schema
 * - Persian/English number conversion
 *
 * @author AI Assistant
 * @version 1.1.0
 * @since 2025-01-01
 */

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, MapPin, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PersianPhoneInput } from "@/components/ui/persian-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  createAddress,
  getUserAddresses,
  updateAddress,
} from "@/lib/actions/addresses";
import { useSession } from "@/lib/auth-client";
import { useToast } from "@/lib/hooks/use-toast";
import {
  convertPersianToEnglish,
  formatPhoneNumber,
  sanitizeIranianPhone,
} from "@/lib/utils/persian";
import { addressSchema } from "@/lib/validations/schemas/address";

interface AddressFormProps {
  address?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

const COUNTRIES = [
  { value: "US", label: "United States" },
  { value: "CA", label: "Canada" },
  { value: "GB", label: "United Kingdom" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  { value: "IT", label: "Italy" },
  { value: "ES", label: "Spain" },
  { value: "NL", label: "Netherlands" },
  { value: "BE", label: "Belgium" },
  { value: "CH", label: "Switzerland" },
  { value: "AT", label: "Austria" },
  { value: "SE", label: "Sweden" },
  { value: "NO", label: "Norway" },
  { value: "DK", label: "Denmark" },
  { value: "FI", label: "Finland" },
  { value: "IE", label: "Ireland" },
  { value: "PT", label: "Portugal" },
  { value: "GR", label: "Greece" },
  { value: "PL", label: "Poland" },
  { value: "CZ", label: "Czech Republic" },
  { value: "HU", label: "Hungary" },
  { value: "RO", label: "Romania" },
  { value: "BG", label: "Bulgaria" },
  { value: "HR", label: "Croatia" },
  { value: "SI", label: "Slovenia" },
  { value: "SK", label: "Slovakia" },
  { value: "EE", label: "Estonia" },
  { value: "LV", label: "Latvia" },
  { value: "LT", label: "Lithuania" },
  { value: "LU", label: "Luxembourg" },
  { value: "MT", label: "Malta" },
  { value: "CY", label: "Cyprus" },
  { value: "IR", label: "Iran" },
  { value: "TR", label: "Turkey" },
  { value: "AE", label: "United Arab Emirates" },
  { value: "SA", label: "Saudi Arabia" },
  { value: "QA", label: "Qatar" },
  { value: "KW", label: "Kuwait" },
  { value: "BH", label: "Bahrain" },
  { value: "OM", label: "Oman" },
  { value: "JO", label: "Jordan" },
  { value: "LB", label: "Lebanon" },
  { value: "EG", label: "Egypt" },
  { value: "MA", label: "Morocco" },
  { value: "TN", label: "Tunisia" },
  { value: "DZ", label: "Algeria" },
  { value: "LY", label: "Libya" },
  { value: "SD", label: "Sudan" },
  { value: "SS", label: "South Sudan" },
  { value: "ET", label: "Ethiopia" },
  { value: "KE", label: "Kenya" },
  { value: "UG", label: "Uganda" },
  { value: "TZ", label: "Tanzania" },
  { value: "RW", label: "Rwanda" },
  { value: "BI", label: "Burundi" },
  { value: "ZM", label: "Zambia" },
  { value: "ZW", label: "Zimbabwe" },
  { value: "BW", label: "Botswana" },
  { value: "NA", label: "Namibia" },
  { value: "ZA", label: "South Africa" },
  { value: "MZ", label: "Mozambique" },
  { value: "MG", label: "Madagascar" },
  { value: "MU", label: "Mauritius" },
  { value: "SC", label: "Seychelles" },
  { value: "KM", label: "Comoros" },
  { value: "AU", label: "Australia" },
  { value: "NZ", label: "New Zealand" },
  { value: "FJ", label: "Fiji" },
  { value: "PG", label: "Papua New Guinea" },
  { value: "SB", label: "Solomon Islands" },
  { value: "VU", label: "Vanuatu" },
  { value: "NC", label: "New Caledonia" },
  { value: "PF", label: "French Polynesia" },
  { value: "WS", label: "Samoa" },
  { value: "TO", label: "Tonga" },
  { value: "TV", label: "Tuvalu" },
  { value: "KI", label: "Kiribati" },
  { value: "MH", label: "Marshall Islands" },
  { value: "FM", label: "Micronesia" },
  { value: "PW", label: "Palau" },
  { value: "NR", label: "Nauru" },
  { value: "JP", label: "Japan" },
  { value: "KR", label: "South Korea" },
  { value: "CN", label: "China" },
  { value: "HK", label: "Hong Kong" },
  { value: "TW", label: "Taiwan" },
  { value: "SG", label: "Singapore" },
  { value: "MY", label: "Malaysia" },
  { value: "TH", label: "Thailand" },
  { value: "VN", label: "Vietnam" },
  { value: "PH", label: "Philippines" },
  { value: "ID", label: "Indonesia" },
  { value: "BN", label: "Brunei" },
  { value: "KH", label: "Cambodia" },
  { value: "LA", label: "Laos" },
  { value: "MM", label: "Myanmar" },
  { value: "LK", label: "Sri Lanka" },
  { value: "NP", label: "Nepal" },
  { value: "BT", label: "Bhutan" },
  { value: "BD", label: "Bangladesh" },
  { value: "PK", label: "Pakistan" },
  { value: "IN", label: "India" },
  { value: "AF", label: "Afghanistan" },
  { value: "TJ", label: "Tajikistan" },
  { value: "KG", label: "Kyrgyzstan" },
  { value: "UZ", label: "Uzbekistan" },
  { value: "TM", label: "Turkmenistan" },
  { value: "KZ", label: "Kazakhstan" },
  { value: "MN", label: "Mongolia" },
  { value: "RU", label: "Russia" },
  { value: "UA", label: "Ukraine" },
  { value: "BY", label: "Belarus" },
  { value: "MD", label: "Moldova" },
  { value: "GE", label: "Georgia" },
  { value: "AM", label: "Armenia" },
  { value: "AZ", label: "Azerbaijan" },
  { value: "BR", label: "Brazil" },
  { value: "MX", label: "Mexico" },
  { value: "AR", label: "Argentina" },
  { value: "CL", label: "Chile" },
  { value: "CO", label: "Colombia" },
  { value: "PE", label: "Peru" },
  { value: "VE", label: "Venezuela" },
  { value: "EC", label: "Ecuador" },
  { value: "BO", label: "Bolivia" },
  { value: "PY", label: "Paraguay" },
  { value: "UY", label: "Uruguay" },
  { value: "GY", label: "Guyana" },
  { value: "SR", label: "Suriname" },
];

export function AddressForm({
  address,
  onSuccess,
  onCancel,
}: AddressFormProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [setAsDefault, setSetAsDefault] = useState(
    address?.is_default || false,
  );

  const form = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      address_line1: address?.address_line1 || "",
      address_line2: address?.address_line2 || "",
      city: address?.city || "",
      state: address?.state || "",
      postal_code: address?.postal_code || "",
      telephone: address?.telephone || "",
      mobile: address?.mobile || "",
      location: address?.location || "",
      is_default: address?.is_default || false,
    },
  });

  useEffect(() => {
    if (address) {
      form.reset({
        address_line1: address.address_line1 || "",
        address_line2: address.address_line2 || "",
        city: address.city || "",
        state: address.state || "",
        postal_code: address.postal_code || "",
        telephone: address.telephone || "",
        mobile: address.mobile || "",
        location: address.location || "",
        is_default: address.is_default || false,
      });
      setSetAsDefault(address.is_default || false);
    }
  }, [address, form]);

  const onSubmit = async (data: any) => {
    if (!session?.user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to save an address",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const formData = {
        ...data,
        is_default: setAsDefault,
      };

      if (address) {
        // Update existing address
        const result = await updateAddress(session.user.id, {
          id: address.id,
          ...formData,
        });

        if (result.success) {
          toast({
            title: "Success",
            description: "Address updated successfully",
          });
          onSuccess();
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to update address",
            variant: "destructive",
          });
        }
      } else {
        // Create new address
        const result = await createAddress(session.user.id, formData);

        if (result.success) {
          toast({
            title: "Success",
            description: "Address added successfully",
          });
          onSuccess();
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to add address",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Address form error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Address Lines */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="address_line1"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address Line 1 *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Street address, P.O. box, company name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address_line2"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address Line 2</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Apartment, suite, unit, building, floor, etc."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* City and State */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City *</FormLabel>
                <FormControl>
                  <Input placeholder="City" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State/Province *</FormLabel>
                <FormControl>
                  <Input placeholder="State or Province" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Postal Code and Country */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="postal_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Postal Code *</FormLabel>
                <FormControl>
                  <Input placeholder="ZIP or Postal Code" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a country" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country.value} value={country.value}>
                        {country.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Phone Numbers */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="telephone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telephone</FormLabel>
                <FormControl>
                  <PersianPhoneInput placeholder="۰۲۱ ۱۲۳۴۵۶۷۸" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="mobile"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mobile Phone *</FormLabel>
                <FormControl>
                  <PersianPhoneInput placeholder="۰۹۱۲ ۳۴۵ ۶۷۸۹" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Location/Map Coordinates */}
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Map Location (Optional)</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <Input
                    placeholder="Latitude, Longitude (e.g., 35.6892, 51.3890)"
                    {...field}
                  />
                  <p className="text-xs text-muted-foreground">
                    Click on the map to set coordinates, or enter manually as
                    "lat,lng"
                  </p>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Set as Default */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_default"
            checked={setAsDefault}
            onCheckedChange={(checked) => setSetAsDefault(checked === true)}
          />
          <Label htmlFor="is_default" className="text-sm">
            Set as default address
          </Label>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {address ? "Updating..." : "Adding..."}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {address ? "Update Address" : "Add Address"}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
