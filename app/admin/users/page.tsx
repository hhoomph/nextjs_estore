"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Eye, UserCheck, UserX, Plus, Edit, Loader2, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().optional(),
  role: z.enum(["USER", "ADMIN"]),
  active: z.boolean(),
});

type UserFormData = z.infer<typeof userSchema>;

interface User {
  id: string;
  name: string | null;
  email: string;
  phoneNumber: string | null;
  role: "USER" | "ADMIN";
  createdAt: string;
  active: boolean | null;
  _count?: {
    orders: number;
    reviews: number;
  };
}

export default function AdminUsersPage() {
  const t = useTranslations("Admin Users");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      role: "USER",
      active: true,
    },
  });

  const fetchUsers = useCallback(async (overrideQuery?: string) => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
      });

      const query = overrideQuery ?? debouncedSearchTerm;
      if (query) params.set("search", query);
      if (roleFilter !== "all") params.set("role", roleFilter);
      if (statusFilter !== "all") params.set("active", statusFilter);

      const response = await fetch(`/api/admin/users?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch users");
      }

      setUsers(data.users || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearchTerm, roleFilter, statusFilter]);

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      void fetchUsers(searchTerm);
    },
    [fetchUsers, searchTerm],
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update user role");
      }

      toast.success(t("userRoleUpdated"));
      fetchUsers(searchTerm);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update user");
    }
  };

  const toggleUserStatus = async (
    userId: string,
    currentStatus: boolean | null,
  ) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ active: !currentStatus }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update user status");
      }

      toast.success(t("userStatusUpdated"));
      fetchUsers(searchTerm);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update user");
    }
  };

  const handleSubmit = async (data: UserFormData) => {
    setSubmitting(true);
    try {
      const method = editingUser ? "PUT" : "POST";
      const url = editingUser ? `/api/admin/users/${editingUser.id}` : "/api/admin/users";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success(t(editingUser ? "userUpdated" : "userCreated"));
        setDialogOpen(false);
        form.reset();
        setEditingUser(null);
        fetchUsers(searchTerm);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to save user");
      }
    } catch (error) {
      console.error("Failed to save user:", error);
      toast.error("Failed to save user. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.reset({
      name: user.name || "",
      email: user.email,
      phoneNumber: user.phoneNumber || "",
      role: user.role,
      active: user.active ?? true,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (userId: string) => {
    if (
      !confirm(t("confirmDeleteUser"))
    )
      return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success(t("userDeleted"));
        fetchUsers(searchTerm);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to delete user");
      }
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast.error("Failed to delete user. Please try again.");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">{t("loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-border bg-card p-6 shadow-xl">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {t("userAdministration")}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
            {t("users")}
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {t("usersDescription")}
          </p>
        </div>
      </section>

      <Card className="apex-stat-card">
        <CardContent className="pt-6">
          <form onSubmit={handleSearchSubmit} className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("searchUsers")}
                  className="rounded-xl pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-32 rounded-xl border-border bg-background">
                <SelectValue placeholder={t("role")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allRoles")}</SelectItem>
                <SelectItem value="USER">{t("userRole")}</SelectItem>
                <SelectItem value="ADMIN">{t("adminRole")}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32 rounded-xl border-border bg-background">
                <SelectValue placeholder={t("status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allStatus")}</SelectItem>
                <SelectItem value="true">{t("active")}</SelectItem>
                <SelectItem value="false">{t("inactive")}</SelectItem>
              </SelectContent>
            </Select>
          </form>
        </CardContent>
      </Card>

      <Card className="apex-stat-card">
        <CardHeader>
          <CardTitle className="text-base font-semibold tracking-tight text-foreground">
            {t("usersCount", { count: users.length })}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {error && (
            <div className="rounded-2xl border border-border bg-destructive/10 p-4 text-center">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {users.length === 0 ? (
            <div className="py-12 text-center">
              <UserCheck className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{t("noUsersFound")}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("table.user")}</TableHead>
                    <TableHead>{t("table.email")}</TableHead>
                    <TableHead>{t("table.role")}</TableHead>
                    <TableHead>{t("table.status")}</TableHead>
                    <TableHead>{t("table.orders")}</TableHead>
                    <TableHead>{t("table.joined")}</TableHead>
                    <TableHead>{t("table.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-sm font-bold text-primary-foreground">
                            <span className="text-sm font-medium">
                              {(user.name || user.email).charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{user.name || t("noName")}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Select
                          value={user.role}
                          onValueChange={(value) => updateUserRole(user.id, value)}
                        >
                          <SelectTrigger className="w-24 rounded-xl border-border bg-background">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USER">{t("userRole")}</SelectItem>
                            <SelectItem value="ADMIN">{t("adminRole")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.active ? "default" : "secondary"}
                          className={
                            user.active
                              ? "border-transparent bg-success/10 text-success"
                              : "border-transparent bg-destructive/10 text-destructive"
                          }
                        >
                          {user.active ? t("active") : t("inactive")}
                        </Badge>
                      </TableCell>
                      <TableCell>{user._count?.orders || 0}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(user.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            className="rounded-xl"
                            onClick={() => handleEdit(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            className="rounded-xl"
                            onClick={() => toggleUserStatus(user.id, user.active)}
                          >
                            {user.active ? (
                              <UserX className="h-4 w-4" />
                            ) : (
                              <UserCheck className="h-4 w-4" />
                            )}
                          </Button>
                          <Button variant="ghost" className="rounded-xl">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            className="rounded-xl text-destructive hover:text-destructive/80"
                            onClick={() => handleDelete(user.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex justify-center rounded-[1.5rem] border border-border bg-card p-4 shadow-lg">
          <div className="flex flex-col gap-3 text-sm text-muted-foreground md:flex-row md:items-center">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="rounded-xl"
            >
              {t("previous")}
            </Button>
            <span className="flex items-center justify-center px-4">
              {t("pageXOfY", { current: currentPage, total: totalPages })}
            </span>
            <Button
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="rounded-xl"
            >
              {t("next")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

