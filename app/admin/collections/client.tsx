"use client";

import {
  Edit,
  Eye,
  EyeOff,
  Package,
  Plus,
  Search,
  Star,
  Trash2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  productCount: number;
  products: Array<{
    id: string;
    name: string;
    price: number;
    status: number;
    quantity: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface CollectionFormData {
  name: string;
  slug: string;
  description: string;
  image: string;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
}

export default function AdminCollectionsClient() {
  const t = (useTranslations as any)("Admin Collections");
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(
    null,
  );
  const [formData, setFormData] = useState<CollectionFormData>({
    name: "",
    slug: "",
    description: "",
    image: "",
    isActive: true,
    isFeatured: false,
    sortOrder: 0,
  });

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/collections");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch collections");
      }

      setCollections(data.collections || []);
    } catch (error) {
      console.error("Error fetching collections:", error);
      toast.error("Failed to load collections");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCollection = async () => {
    try {
      const response = await fetch("/api/collections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create collection");
      }

      setCollections((prev) => [...prev, data]);
      setIsCreateDialogOpen(false);
      resetForm();
      toast.success("Collection created successfully");
    } catch (error) {
      console.error("Error creating collection:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create collection",
      );
    }
  };

  const handleEditCollection = async () => {
    if (!editingCollection) return;

    try {
      const response = await fetch(`/api/collections/${editingCollection.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update collection");
      }

      setCollections((prev) =>
        prev.map((collection) =>
          collection.id === editingCollection.id ? data : collection,
        ),
      );
      setEditingCollection(null);
      resetForm();
      toast.success("Collection updated successfully");
    } catch (error) {
      console.error("Error updating collection:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update collection",
      );
    }
  };

  const handleDeleteCollection = async (collectionId: string) => {
    if (!confirm("Are you sure you want to delete this collection?")) return;

    try {
      const response = await fetch(`/api/collections/${collectionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete collection");
      }

      setCollections((prev) => prev.filter((c) => c.id !== collectionId));
      toast.success("Collection deleted successfully");
    } catch (error) {
      console.error("Error deleting collection:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete collection",
      );
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      image: "",
      isActive: true,
      isFeatured: false,
      sortOrder: 0,
    });
  };

  const openEditDialog = (collection: Collection) => {
    setEditingCollection(collection);
    setFormData({
      name: collection.name,
      slug: collection.slug,
      description: collection.description || "",
      image: collection.image || "",
      isActive: collection.isActive,
      isFeatured: collection.isFeatured,
      sortOrder: collection.sortOrder,
    });
  };

  const filteredCollections = collections.filter(
    (collection) =>
      collection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      collection.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading collections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Collections</h1>
          <p className="text-muted-foreground">
            Manage your product collections and categories
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild={true}>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" />
              Create Collection
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-150">
            <DialogHeader>
              <DialogTitle>Create New Collection</DialogTitle>
              <DialogDescription>
                Add a new collection to organize your products.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Collection name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, slug: e.target.value }))
                    }
                    placeholder="collection-slug"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Collection description"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, image: e.target.value }))
                  }
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sortOrder">Sort Order</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        sortOrder: parseInt(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        isActive: checked as boolean,
                      }))
                    }
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        isFeatured: checked as boolean,
                      }))
                    }
                  />
                  <Label htmlFor="isFeatured">Featured</Label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="submit"
                onClick={handleCreateCollection}
                disabled={!formData.name || !formData.slug}
              >
                Create Collection
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search collections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Collections Table */}
      <Card>
        <CardHeader>
          <CardTitle>Collections</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCollections.map((col) => (
                <TableRow key={col.id}>
                  <TableCell>{col.name}</TableCell>
                  <TableCell>{col.slug}</TableCell>
                  <TableCell>{col.productCount}</TableCell>
                  <TableCell>
                    {col.isFeatured ? <Star /> : <EyeOff />}
                  </TableCell>
                  <TableCell>
                    {col.isActive ? (
                      <Badge>Active</Badge>
                    ) : (
                      <Badge>Hidden</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        onClick={() => openEditDialog(col)}
                      >
                        <Edit />
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleDeleteCollection(col.id)}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
