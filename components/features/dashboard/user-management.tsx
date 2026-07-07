/**
 * Module for user-management
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
"use client";

import { useCallback, useEffect, useState } from "react";
import type * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { User } from "@/types/user";

interface UserWithCounts extends User {
  _count: {
    order: number;
    address: number;
  };
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export function UserManagement() {
  const [users, setUsers] = useState<UserWithCounts[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithCounts | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search,
        role: roleFilter,
      });

      const response = await fetch(`/api/users?${params}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setPagination(data.pagination);
      } else {
        console.error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreateUser = async (userData: {
    name: string;
    email: string;
    password?: string;
    phone_number?: string;
    role?: string;
    active?: boolean;
  }) => {
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        setShowCreateModal(false);
        fetchUsers();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create user");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      alert("An unexpected error occurred");
    }
  };

  const handleUpdateUser = async (
    userId: string,
    userData: {
      name?: string;
      email?: string;
      phone_number?: string;
      role?: "USER" | "ADMIN";
      active?: boolean;
    },
  ) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        setEditingUser(null);
        fetchUsers();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      alert("An unexpected error occurred");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to deactivate this user?")) return;

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchUsers();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("An unexpected error occurred");
    }
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-border bg-card p-6 shadow-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              User administration
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
              User Management
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Search, filter, create, and maintain customer accounts from a clean
              Apex-inspired table surface.
            </p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="rounded-xl bg-primary text-primary-foreground px-5 text-sm font-semibold shadow-primary/25 hover:bg-primary/90"
          >
            Add User
          </Button>
        </div>
      </section>

      <Card className="apex-stat-card">
        <CardContent>
          <div className="grid gap-4 md:grid-cols-[1fr_14rem]">
            <Input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="rounded-xl"
            />
            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
              className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="">All Roles</option>
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card className="apex-stat-card overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full caption-bottom text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/40 text-left">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    User
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Role
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Orders
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Joined
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">
                      Loading users...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-border/50 last:border-b-0 transition hover:bg-muted/50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-sm font-bold text-primary-foreground">
                            {user.name?.charAt(0)?.toUpperCase() || "U"}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-foreground">
                              {user.name || "No name"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          className={
                            user.active
                              ? "border-transparent bg-success/10 text-success"
                              : "border-transparent bg-destructive/10 text-destructive"
                          }
                        >
                          {user.active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-foreground">
                        {user._count?.order || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="mr-4 text-sm font-semibold text-primary hover:text-primary/80"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-sm font-semibold text-destructive hover:text-destructive/80"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {pagination.pages > 1 && (
        <div className="flex flex-col gap-4 rounded-[1.5rem] border border-border bg-card p-4 shadow-lg md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} users
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
              }
              disabled={pagination.page === 1}
              className="rounded-xl"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
              }
              disabled={pagination.page === pagination.pages}
              className="rounded-xl"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {showCreateModal && (
        <UserModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateUser}
          title="Create New User"
        />
      )}

      {editingUser && (
        <UserModal
          onClose={() => setEditingUser(null)}
          onSubmit={(data) => handleUpdateUser(editingUser.id, data)}
          title="Edit User"
          initialData={editingUser}
        />
      )}
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  return (
    <Badge
      className={
        role === "ADMIN"
          ? "border-transparent bg-primary/10 text-primary"
          : "border-transparent bg-secondary text-secondary-foreground"
      }
    >
      {role}
    </Badge>
  );
}

// User Modal Component
interface UserModalProps {
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    email: string;
    password?: string;
    phone_number?: string;
    role?: "USER" | "ADMIN";
    active?: boolean;
  }) => void;
  title: string;
  initialData?: Partial<UserWithCounts>;
}

function UserModal({ onClose, onSubmit, title, initialData }: UserModalProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    email: initialData?.email || "",
    password: "",
    phone_number: initialData?.phone_number || "",
    role: initialData?.role || "USER",
    active: initialData?.active ?? true,
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit({
      ...formData,
      role: formData.role as "USER" | "ADMIN" | undefined,
    });
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = event.target;
    setFormData((current) => ({
      ...current,
      [name]:
        type === "checkbox" ? (event.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-xl">
      <div className="w-full max-w-md overflow-hidden rounded-[2rem] border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border p-6">
          <h3 className="text-lg font-bold text-foreground">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground transition hover:text-foreground"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <FormField label="Name">
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required={true}
              className="rounded-xl"
            />
          </FormField>

          <FormField label="Email">
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required={true}
              className="rounded-xl"
            />
          </FormField>

          {!initialData && (
            <FormField label="Password">
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required={!initialData}
                className="rounded-xl"
              />
            </FormField>
          )}

          <FormField label="Phone Number">
            <Input
              type="tel"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              className="rounded-xl"
            />
          </FormField>

          <FormField label="Role">
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </select>
          </FormField>

          <label className="flex items-center gap-3 rounded-2xl border border-border bg-muted p-3 text-sm text-foreground">
            <input
              type="checkbox"
              name="active"
              checked={formData.active}
              onChange={handleChange}
              className="h-4 w-4 accent-primary"
            />
            Active
          </label>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {initialData ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}
