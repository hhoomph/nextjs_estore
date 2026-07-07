/**
 * Module for AddressMap
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
"use client";

import type { LatLng, Map as LeafletMap, LeafletMouseEvent } from "leaflet";
import { Loader2, MapPin, Navigation, RefreshCw } from "lucide-react";
// Dynamically import Leaflet components to avoid SSR issues
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useMapEvents } from "react-leaflet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserAddresses } from "@/lib/actions/addresses";
import { useSession } from "@/lib/auth-client";
import { useToast } from "@/lib/hooks/use-toast";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false },
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false },
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

// Address interface for type safety
interface MapAddress {
  id: string;
  addressLine1: string | null;
  addressLine2?: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  location: string | null;
  isDefault: boolean;
  mobile?: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Component to handle map events
function MapEvents({
  onMapClick,
}: {
  onMapClick: (e: LeafletMouseEvent) => void;
}) {
  useMapEvents({
    click: onMapClick,
  });
  return null;
}

interface AddressMapProps {
  className?: string;
  height?: number | string;
  zoom?: number;
  showControls?: boolean;
  onAddressSelect?: (address: MapAddress) => void;
}

export function AddressMap({}: AddressMapProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<MapAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef<LeafletMap | null>(null);

  // Default center (Tehran, Iran for this example)
  const defaultCenter: [number, number] = [35.6892, 51.389];
  const defaultZoom = 10;

  const fetchAddresses = async () => {
    if (!session?.user?.id) return;

    try {
      const result = await getUserAddresses(session.user.id);
      if (result.success && result.addresses) {
        setAddresses(result.addresses);
      }
    } catch (error) {
      console.error("Error fetching addresses for map:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [session?.user?.id]);

  // Parse coordinates from address.location string
  const parseCoordinates = (location: string): [number, number] | null => {
    if (!location) return null;

    const parts = location.split(",").map((part) => parseFloat(part.trim()));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return [parts[0], parts[1]];
    }
    return null;
  };

  // Format coordinates for display
  const formatCoordinates = (lat: number, lng: number): string => {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  // Get addresses with valid coordinates
  const addressesWithCoords = addresses.filter((addr) => {
    const coords = parseCoordinates(addr.location ?? "");
    return coords !== null;
  });

  // Calculate map center based on addresses or use default
  const getMapCenter = (): [number, number] => {
    if (addressesWithCoords.length > 0) {
      const location = addressesWithCoords[0].location;
      if (location) {
        const firstCoords = parseCoordinates(location);
        return firstCoords || defaultCenter;
      }
    }
    return defaultCenter;
  };

  const handleMapClick = (e: LeafletMouseEvent) => {
    const { lat, lng } = e.latlng;
    const coordinates = formatCoordinates(lat, lng);

    // Copy coordinates to clipboard
    navigator.clipboard.writeText(coordinates).then(() => {
      toast({
        title: "Coordinates Copied",
        description: `Copied: ${coordinates}. Paste this into the Location field when adding/editing an address.`,
      });
    });
  };

  const centerMap = () => {
    if (mapRef.current) {
      const center = getMapCenter();
      mapRef.current.setView(center, defaultZoom);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading map...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Map Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Your Addresses on Map</h3>
          <p className="text-sm text-muted-foreground">
            Click on the map to copy coordinates for new addresses
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={centerMap}
            disabled={!mapLoaded}
          >
            <Navigation className="h-4 w-4 mr-2" />
            Center Map
          </Button>

          <Button variant="outline" size="sm" onClick={() => fetchAddresses()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Map Stats */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>Total addresses: {addresses.length}</span>
        <span>Addresses with coordinates: {addressesWithCoords.length}</span>
        {addressesWithCoords.length === 0 && (
          <Badge variant="outline" className="text-warning">
            No addresses with coordinates yet
          </Badge>
        )}
      </div>

      {/* Map Container */}
      <Card>
        <CardContent className="p-0">
          <div className="relative h-96 w-full">
            <MapContainer
              center={getMapCenter()}
              zoom={defaultZoom}
              style={{ height: "100%", width: "100%" }}
              whenReady={() => setMapLoaded(true)}
              ref={mapRef}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />

              <MapEvents onMapClick={handleMapClick} />

              {/* Address Markers */}
              {addressesWithCoords.map((address) => {
                const coords = parseCoordinates(address.location ?? "");
                if (!coords) return null;

                return (
                  <Marker key={address.id} position={coords}>
                    <Popup>
                      <div className="space-y-2 min-w-48">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span className="font-medium">Delivery Address</span>
                          {address.isDefault && (
                            <Badge variant="default" className="text-xs">
                              Default
                            </Badge>
                          )}
                        </div>

                        <div className="text-sm">
                          <p className="font-medium">
                            {[address.addressLine1, address.city, address.state]
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                          {address.mobile && (
                            <p className="text-muted-foreground">
                              {address.mobile}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatCoordinates(coords[0], coords[1])}
                          </p>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>

            {/* Loading overlay */}
            {!mapLoaded && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Loading map...
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-primary/10 border-primary/20">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-medium text-foreground">How to use the map</h4>
              <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                <li>
                  • Click anywhere on the map to copy coordinates to your
                  clipboard
                </li>
                <li>
                  • Paste the coordinates into the "Map Location" field when
                  adding/editing addresses
                </li>
                <li>
                  • Addresses with coordinates will appear as markers on the map
                </li>
                <li>• Default addresses are highlighted in the address list</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
