/**
 * Module for AddressSelector
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
"use client";

import {
  AlertTriangle,
  Building,
  CheckCircle,
  Edit,
  Home,
  Loader2,
  MapPin,
  Phone,
  Plus,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { getUserAddresses } from "@/lib/actions/addresses";
import { useSession } from "@/lib/auth-client";
import { useToast } from "@/lib/hooks/use-toast";
import type { Address } from "@/types/address";

interface AddressSelectorProps {
  selectedAddressId?: string;
  onAddressSelect: (address: Address | null) => void;
  onAddNew?: () => void;
  title?: string;
  description?: string;
  allowNullSelection?: boolean;
}

export function AddressSelector({
  selectedAddressId,
  onAddressSelect,
  onAddNew,
  title = "Select Delivery Address",
  description = "Choose a delivery address for your order",
  allowNullSelection = false,
}: AddressSelectorProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(
    selectedAddressId || null,
  );

  const fetchAddresses = async () => {
    if (!session?.user?.id) return;

    try {
      const result = await getUserAddresses(session.user.id);
      if (result.success && result.addresses) {
        setAddresses(result.addresses);
        // Auto-select default address if none selected
        if (!selectedId && result.addresses.length > 0) {
          const defaultAddr = result.addresses.find((addr) => addr.isDefault);
          if (defaultAddr) {
            setSelectedId(defaultAddr.id);
            onAddressSelect(defaultAddr);
          }
        }
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to fetch addresses",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
      toast({
        title: "Error",
        description: "Failed to fetch addresses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [session?.user?.id]);

  useEffect(() => {
    setSelectedId(selectedAddressId || null);
  }, [selectedAddressId]);

  const handleAddressChange = (addressId: string) => {
    const address = addresses.find((addr) => addr.id === addressId);
    setSelectedId(addressId);
    onAddressSelect(address || null);
  };

  const formatAddress = (address: Address) => {
    const parts = [
      address.addressLine1,
      address.addressLine2,
      address.city,
      address.state,
      address.postalCode,
    ].filter(Boolean);

    return parts.join(", ");
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading addresses...</span>
        </CardContent>
      </Card>
    );
  }

  if (addresses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {title}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No addresses found</h3>
            <p className="text-muted-foreground mb-6">
              Add a delivery address to continue with your order.
            </p>
            {onAddNew && (
              <Button onClick={onAddNew}>
                <Plus className="h-4 w-4 mr-2" />
                Add New Address
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          {title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selectedId || ""}
          onValueChange={handleAddressChange}
          className="space-y-4"
        >
          {addresses.map((address) => (
            <div key={address.id} className="flex items-start space-x-3">
              <RadioGroupItem
                value={address.id}
                id={address.id}
                className="mt-1"
              />
              <Label htmlFor={address.id} className="flex-1 cursor-pointer">
                <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Delivery Address</span>
                      {address.isDefault && (
                        <Badge variant="default" className="text-xs">
                          Default
                        </Badge>
                      )}
                    </div>
                    {selectedId === address.id && (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">
                      {formatAddress(address)}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {address.mobile && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span>{address.mobile}</span>
                        </div>
                      )}
                      {address.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>Has coordinates</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>

        <Separator className="my-6" />

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {selectedId ? (
              <span className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                Address selected
              </span>
            ) : (
              <span className="flex items-center gap-2 text-orange-600">
                <AlertTriangle className="h-4 w-4" />
                Please select an address
              </span>
            )}
          </div>

          {onAddNew && (
            <Button variant="outline" onClick={onAddNew}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Address
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
