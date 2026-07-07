/**
 * Module for AddressList
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
"use client";

import {
  AlertTriangle,
  Building,
  Edit,
  Home,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plus,
  Star,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  deleteAddress,
  getUserAddresses,
  setDefaultAddress,
} from "@/lib/actions/addresses";
import { useSession } from "@/lib/auth-client";
import { useToast } from "@/lib/hooks/use-toast";

interface AddressListProps {
  onEdit: (address: any) => void;
  onAddNew: () => void;
}

export function AddressList({ onEdit, onAddNew }: AddressListProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchAddresses = async () => {
    if (!session?.user?.id) return;

    try {
      const result = await getUserAddresses(session.user.id);
      if (result.success && result.addresses) {
        setAddresses(result.addresses);
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

  const handleDelete = async (addressId: string) => {
    if (!session?.user?.id) return;

    setActionLoading(addressId);
    try {
      const result = await deleteAddress(addressId, session.user.id);
      if (result.success) {
        toast({
          title: "Success",
          description: "Address deleted successfully",
        });
        fetchAddresses(); // Refresh the list
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete address",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting address:", error);
      toast({
        title: "Error",
        description: "Failed to delete address",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    if (!session?.user?.id) return;

    setActionLoading(addressId);
    try {
      const result = await setDefaultAddress({ addressId }, session.user.id);
      if (result.success) {
        toast({
          title: "Success",
          description: "Default address updated successfully",
        });
        fetchAddresses(); // Refresh the list
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to set default address",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error setting default address:", error);
      toast({
        title: "Error",
        description: "Failed to set default address",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const formatAddress = (address: any) => {
    const parts = [
      address.address_line1,
      address.address_line2,
      address.city,
      address.state,
      address.postal_code,
    ].filter(Boolean);

    return parts.join(", ");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading addresses...</span>
      </div>
    );
  }

  if (addresses.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No addresses yet</h3>
          <p className="text-muted-foreground text-center mb-6">
            Add your first delivery address to make checkout faster and easier.
          </p>
          <Button onClick={onAddNew}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Address
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Address Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.map((address) => (
          <Card key={address.id} className="relative">
            {address.is_default && (
              <div className="absolute top-3 right-3">
                <Badge
                  variant="default"
                  className="bg-primary"
                >
                  <Star className="h-3 w-3 mr-1" />
                  Default
                </Badge>
              </div>
            )}

            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-base">Delivery Address</CardTitle>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* Address */}
              <div>
                <p className="text-sm font-medium text-foreground">
                  {formatAddress(address)}
                </p>
              </div>

              {/* Contact Info */}
              <div className="space-y-1">
                {address.mobile && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    <span>{address.mobile}</span>
                  </div>
                )}
                {address.telephone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    <span>{address.telephone} (Home)</span>
                  </div>
                )}
              </div>

              {/* Map Location */}
              {address.location && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>Coordinates: {address.location}</span>
                </div>
              )}

              <Separator />

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(address)}
                    disabled={actionLoading === address.id}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>

                  {!address.is_default && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetDefault(address.id)}
                      disabled={actionLoading === address.id}
                    >
                      {actionLoading === address.id ? (
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <Star className="h-3 w-3 mr-1" />
                      )}
                      Set Default
                    </Button>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(address.id)}
                  disabled={actionLoading === address.id}
                  className="text-destructive hover:text-destructive"
                >
                  {actionLoading === address.id ? (
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  ) : (
                    <Trash2 className="h-3 w-3 mr-1" />
                  )}
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add New Address Card */}
      <Card className="border-dashed border-2 hover:border-primary/50 transition-colors cursor-pointer">
        <CardContent
          className="flex flex-col items-center justify-center py-8"
          onClick={onAddNew}
        >
          <Plus className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-muted-foreground font-medium">Add New Address</p>
          <p className="text-xs text-muted-foreground mt-1">
            Click to add another delivery address
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
