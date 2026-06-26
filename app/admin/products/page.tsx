"use client";

export const dynamic = "force-dynamic";

import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";
import Image from "next/image";
import { useSession, type Session } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Package,
  AlertTriangle,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  desc: z.string().min(1, "Description is required"),
  categoryId: z.string().min(1, "Category is required"),
  quantity: z.number().min(0, "Quantity must be 0 or more"),
  price: z.number().min(0.01, "Price must be greater than 0"),
  discountPrice: z.number().optional(),
  status: z.number().min(0).max(1),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface Product {
  id: string;
  name: string;
  desc: string;
  slug: string;
  categoryId: string;
  quantity: number;
  price: number;
  discountPrice: number | null;
  status: number;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
  category?: { id?: string; name: string } | null;
}

interface Category {
  id: string;
  name: string;
}

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_IMAGES = 5;
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

function isAdminSession(session: Session | null | undefined) {
  return session?.user?.role === "ADMIN";
}

async function readErrorMessage(response: Response, fallback: string) {
  try {
    const data = await response.json();
    return data?.error || fallback;
  } catch {
    return fallback;
  }
}

function extractProductImages(product: {
  productPictures?: Array<{
    displayOrder?: number;
    picture: { url: string };
  }>;
  ogImage?: string | null;
}) {
  const images = (product.productPictures || [])
    .slice()
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
    .map((productPicture) => productPicture.picture.url);

  if (images.length > 0) return images;
  return product.ogImage ? [product.ogImage] : [];
}

async function uploadImageFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.error || "Upload failed");
  }

  if (typeof data?.url !== "string") {
    throw new Error("Upload did not return an image URL");
  }

  return data.url;
}

export default function AdminProductsPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productImages, setProductImages] = useState<string[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      desc: "",
      categoryId: "",
      quantity: 0,
      price: 0,
      discountPrice: undefined,
      status: 1,
    },
  });

  const fetchProducts = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/products?limit=100");
      if (!response.ok) {
        throw new Error(await readErrorMessage(response, "Failed to fetch products"));
      }

      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true);
    try {
      const response = await fetch("/api/categories");
      if (!response.ok) {
        throw new Error(await readErrorMessage(response, "Failed to fetch categories"));
      }

      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      setCategories([]);
      toast.error("Failed to fetch categories");
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isPending) return;

    if (!isAdminSession(session)) {
      router.push("/");
      return;
    }

    fetchProducts();
    fetchCategories();
  }, [fetchCategories, fetchProducts, isPending, router, session]);

  const filteredProducts = (products || []).filter((product) => {
    const matchesSearch =
      (product.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.desc || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || (product.status ?? 1).toString() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = async (data: ProductFormData) => {
    if (productImages.length === 0) {
      toast.error("At least one product image is required");
      return;
    }

    setSubmitting(true);
    try {
      const method = editingProduct ? "PUT" : "POST";
      const url = editingProduct
        ? `/api/admin/products/${editingProduct.id}`
        : "/api/admin/products";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          images: productImages,
        }),
      });

      if (response.ok) {
        toast.success(editingProduct ? "Product updated" : "Product created");
        setDialogOpen(false);
        form.reset();
        setEditingProduct(null);
        setProductImages([]);
        await fetchProducts();
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData?.error || "Failed to save product");
      }
    } catch (error) {
      console.error("Failed to save product:", error);
      toast.error("Failed to save product. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (product: Product) => {
    try {
      const response = await fetch(`/api/admin/products/${product.id}`);
      if (!response.ok) {
        throw new Error(await readErrorMessage(response, "Failed to load product"));
      }

      const data = await response.json();
      if (!data.product) {
        throw new Error("Product not found");
      }

      setEditingProduct(product);
      form.reset({
        name: data.product.name || "",
        desc: data.product.desc || "",
        categoryId: data.product.categoryId,
        quantity: data.product.quantity,
        price: data.product.price,
        discountPrice: data.product.discountPrice || undefined,
        status: data.product.status ?? 1,
        seoTitle: data.product.seoTitle || "",
        seoDescription: data.product.seoDescription || "",
        seoKeywords: data.product.seoKeywords || "",
      });
      setProductImages(extractProductImages(data.product));
      setDialogOpen(true);
    } catch (error) {
      console.error("Failed to load product:", error);
      toast.error("Failed to load product details");
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Product deleted");
        await fetchProducts();
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData?.error || "Failed to delete product");
      }
    } catch (error) {
      console.error("Failed to delete product:", error);
      toast.error("Failed to delete product. Please try again.");
    }
  };

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const selectedFiles = Array.from(files);
    const totalAfterUpload = productImages.length + selectedFiles.length;
    if (totalAfterUpload > MAX_IMAGES) {
      const canAdd = MAX_IMAGES - productImages.length;
      toast.error(
        canAdd <= 0
          ? `Maximum ${MAX_IMAGES} images allowed. Remove some before adding more.`
          : `Maximum ${MAX_IMAGES} images allowed. You can only add ${canAdd} more.`,
      );
      event.target.value = "";
      return;
    }

    const invalidFiles = selectedFiles.filter(
      (file) =>
        !ALLOWED_IMAGE_TYPES.includes(file.type) || file.size > MAX_IMAGE_BYTES,
    );

    if (invalidFiles.length > 0) {
      toast.error("Use JPEG, PNG, or WebP images under 5MB each");
      event.target.value = "";
      return;
    }

    setUploadingImage(true);
    try {
      const uploadResults = await Promise.allSettled(
        selectedFiles.map((file) => uploadImageFile(file)),
      );

      const uploadedUrls = uploadResults
        .filter(
          (result): result is PromiseFulfilledResult<string> =>
            result.status === "fulfilled",
        )
        .map((result) => result.value);

      const failedUploads = uploadResults.filter(
        (result) => result.status === "rejected",
      );

      if (uploadedUrls.length > 0) {
        setProductImages((prev) =>
          Array.from(new Set([...prev, ...uploadedUrls])),
        );
      }

      if (failedUploads.length > 0) {
        toast.error(`${failedUploads.length} image upload failed`);
      }
    } catch (error) {
      console.error("Failed to upload images:", error);
      toast.error("Failed to upload images. Please try again.");
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  };

  const removeImage = (index: number) => {
    setProductImages((prev) => prev.filter((_, i) => i !== index));
  };

  if (isPending || loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">Loading products...</p>
        </div>
      </div>
    );
  }

  if (!isAdminSession(session)) {
    return null;
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-border bg-card p-6 shadow-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Commerce workspace
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
              Product Management
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Manage your store&apos;s products with Apex-style cards and tables.
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingProduct(null);
                form.reset({
                  name: "",
                  desc: "",
                  categoryId: "",
                  quantity: 0,
                  price: 0,
                  discountPrice: undefined,
                  status: 1,
                });
                setProductImages([]);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? "Edit Product" : "Add New Product"}
              </DialogTitle>
            </DialogHeader>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="desc"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            value={field.value ?? 0}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            value={field.value ?? 0}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="discountPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount Price ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            value={(field.value ?? "") as number | string}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  ? parseFloat(e.target.value)
                                  : undefined,
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={(field.value ?? 1).toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">Active</SelectItem>
                          <SelectItem value="0">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <details className="rounded-2xl border border-border p-4">
                  <summary className="cursor-pointer text-sm font-semibold text-muted-foreground hover:text-foreground">
                    SEO Settings
                  </summary>
                  <div className="mt-4 space-y-4">
                    <FormField
                      control={form.control}
                      name="seoTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SEO Title</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value ?? ""} placeholder="Leave blank to use product name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="seoDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SEO Description</FormLabel>
                          <FormControl>
                            <Textarea rows={2} {...field} value={field.value ?? ""} placeholder="Meta description for search engines" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="seoKeywords"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SEO Keywords</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value ?? ""} placeholder="Comma-separated keywords" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </details>

                <div>
                  <FormLabel>Product Images ({productImages.length}/{MAX_IMAGES})</FormLabel>
                  <div className="mt-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="w-full"
                    >
                      {uploadingImage ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Images
                        </>
                      )}
                    </Button>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                      You can upload multiple images (JPEG, PNG, WebP, max 5MB each)
                    </p>
                  </div>

                  {productImages.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-4">
                      {productImages.map((imageUrl, index) => (
                        <div key={`${imageUrl}-${index}`} className="relative group">
                            <div className="aspect-square overflow-hidden rounded-2xl bg-muted">
                            <Image
                              src={imageUrl}
                              alt={`Product image ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            className="absolute top-2 right-2 h-6 w-6 p-0 opacity-100 bg-destructive/90 shadow-sm transition-opacity hover:bg-destructive focus-visible:ring-2 focus-visible:ring-offset-2"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : editingProduct ? (
                      "Update Product"
                    ) : (
                      "Create Product"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="apex-stat-card">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="rounded-xl pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48 rounded-xl border-border bg-background">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="1">Active</SelectItem>
                <SelectItem value="0">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="apex-stat-card">
        <CardHeader>
          <CardTitle className="text-base font-semibold tracking-tight text-foreground">
            Products ({filteredProducts.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {product.desc}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{product.category?.name ?? "-"}</TableCell>
                  <TableCell>
                    <div>
                      {product.discountPrice ? (
                        <>
                          <span>${Number(product.discountPrice).toFixed(2)}</span>
                          <span className="ml-2 text-sm text-muted-foreground line-through">
                            ${Number(product.price).toFixed(2)}
                          </span>
                        </>
                      ) : (
                        <span>${Number(product.price).toFixed(2)}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      <span>{product.quantity}</span>
                      {product.quantity < 10 && (
                        <AlertTriangle className="h-4 w-4 text-warning" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        (product.status ?? 1) === 1 ? "default" : "destructive"
                      }
                    >
                      {(product.status ?? 1) === 1 ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(product)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        aria-label={`View ${product.name}`}
                        onClick={() => router.push(`/products/${product.slug}`)}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(product.id)}
                        className="text-destructive hover:text-destructive/80"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredProducts.length === 0 && (
            <div className="py-12 text-center">
              <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold text-foreground">No products found</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your filters."
                  : "Get started by adding your first product."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      </section>
    </div>
  );
}
