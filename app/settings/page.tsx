/**
 * Module for page
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
"use client";

import { useState } from "react";

// Force dynamic rendering to avoid prerendering issues
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Camera,
  Eye,
  EyeOff,
  Globe,
  Save,
  Shield,
  User,
} from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "@/lib/auth-client";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  // Prevent prerendering during build time - return early
  if (typeof window === "undefined") {
    return null;
  }

  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("profile");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: session?.user?.name || "",
      email: session?.user?.email || "",
    },
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const [notifications, setNotifications] = useState({
    emailOrders: true,
    emailPromotions: false,
    emailNewsletter: true,
    pushOrders: true,
    pushPromotions: false,
  });

  if (!session?.user) {
    return (
      <div className="container px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
          <p className="text-muted-foreground mb-6">
            You need to be signed in to access your settings.
          </p>
          <div className="space-x-4">
            <Button asChild={true}>
              <Link href="/auth/signin?redirect=/settings">Sign In</Link>
            </Button>
            <Button variant="outline" asChild={true}>
              <Link href="/auth/signup?redirect=/settings">Sign Up</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const onProfileSubmit = async (data: ProfileForm) => {
    if (!session?.user?.id) return;
    try {
      const response = await fetch(`/api/users/${session.user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData: { error?: string } = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }
      // Can show a success toast here
      console.log("Profile updated successfully");
    } catch (error) {
      console.error(error);
      // Can show an error toast here
    }
  };

  const onPasswordSubmit = async (data: PasswordForm) => {
    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData: { error?: string } = await response.json();
        throw new Error(errorData.error || "Failed to change password");
      }
      // Can show a success toast here
      console.log("Password changed successfully");
      passwordForm.reset();
    } catch (error) {
      console.error(error);
      // Can show an error toast here
    }
  };

  return (
    <div className="bg-background">
      {/* Breadcrumb */}
      <div className="border-b">
        <div className="container px-4 py-3">
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
            <span>/</span>
            <Link href="/account" className="hover:text-foreground">
              Account
            </Link>
            <span>/</span>
            <span className="text-foreground">Settings</span>
          </nav>
        </div>
      </div>

      <div className="container px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="outline" size="sm" asChild={true}>
              <Link href="/account">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Account
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Settings</h1>
              <p className="text-muted-foreground">
                Manage your account preferences
              </p>
            </div>
          </div>

          {/* Settings Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1">
                  <CardHeader>
                    <CardTitle>Profile Picture</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col items-center">
                      <Avatar className="h-24 w-24">
                        <AvatarImage
                          src={session.user.image || ""}
                          alt={session.user.name || ""}
                        />
                        <AvatarFallback className="text-2xl">
                          {session.user.name?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <Button variant="outline" size="sm" className="mt-4">
                        <Camera className="h-4 w-4 mr-2" />
                        Change Photo
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form
                      onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            {...profileForm.register("name")}
                            placeholder="Enter your full name"
                          />
                          {profileForm.formState.errors.name && (
                            <p className="text-sm text-destructive">
                              {profileForm.formState.errors.name.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            {...profileForm.register("email")}
                            placeholder="Enter your email"
                          />
                          {profileForm.formState.errors.email && (
                            <p className="text-sm text-destructive">
                              {profileForm.formState.errors.email.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-4">
                        <Badge variant="secondary">
                          {session.user.role === "ADMIN"
                            ? "Administrator"
                            : "Customer"}
                        </Badge>
                        <Badge variant="outline">Verified</Badge>
                      </div>

                      <Button
                        type="submit"
                        disabled={profileForm.formState.isSubmitting}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="mt-6">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form
                      onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">
                          Current Password
                        </Label>
                        <div className="relative">
                          <Input
                            id="currentPassword"
                            type={showCurrentPassword ? "text" : "password"}
                            {...passwordForm.register("currentPassword")}
                            placeholder="Enter your current password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() =>
                              setShowCurrentPassword(!showCurrentPassword)
                            }
                          >
                            {showCurrentPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        {passwordForm.formState.errors.currentPassword && (
                          <p className="text-sm text-destructive">
                            {
                              passwordForm.formState.errors.currentPassword
                                .message
                            }
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="newPassword">New Password</Label>
                          <div className="relative">
                            <Input
                              id="newPassword"
                              type={showNewPassword ? "text" : "password"}
                              {...passwordForm.register("newPassword")}
                              placeholder="Enter new password"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() =>
                                setShowNewPassword(!showNewPassword)
                              }
                            >
                              {showNewPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          {passwordForm.formState.errors.newPassword && (
                            <p className="text-sm text-destructive">
                              {
                                passwordForm.formState.errors.newPassword
                                  .message
                              }
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">
                            Confirm New Password
                          </Label>
                          <div className="relative">
                            <Input
                              id="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              {...passwordForm.register("confirmPassword")}
                              placeholder="Confirm new password"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          {passwordForm.formState.errors.confirmPassword && (
                            <p className="text-sm text-destructive">
                              {
                                passwordForm.formState.errors.confirmPassword
                                  .message
                              }
                            </p>
                          )}
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={passwordForm.formState.isSubmitting}
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Update Password
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Two-Factor Authentication</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Enable 2FA</p>
                        <p className="text-sm text-muted-foreground">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <Button variant="outline">Enable</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Email Notifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Order Updates</p>
                      <p className="text-sm text-muted-foreground">
                        Receive emails about your order status
                      </p>
                    </div>
                    <Switch
                      checked={notifications.emailOrders}
                      onCheckedChange={(checked) =>
                        setNotifications((prev) => ({
                          ...prev,
                          emailOrders: checked,
                        }))
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Promotional Emails</p>
                      <p className="text-sm text-muted-foreground">
                        Get notified about sales and special offers
                      </p>
                    </div>
                    <Switch
                      checked={notifications.emailPromotions}
                      onCheckedChange={(checked) =>
                        setNotifications((prev) => ({
                          ...prev,
                          emailPromotions: checked,
                        }))
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Newsletter</p>
                      <p className="text-sm text-muted-foreground">
                        Weekly newsletter with product updates
                      </p>
                    </div>
                    <Switch
                      checked={notifications.emailNewsletter}
                      onCheckedChange={(checked) =>
                        setNotifications((prev) => ({
                          ...prev,
                          emailNewsletter: checked,
                        }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Push Notifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Order Updates</p>
                      <p className="text-sm text-muted-foreground">
                        Browser notifications for order updates
                      </p>
                    </div>
                    <Switch
                      checked={notifications.pushOrders}
                      onCheckedChange={(checked) =>
                        setNotifications((prev) => ({
                          ...prev,
                          pushOrders: checked,
                        }))
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Promotions</p>
                      <p className="text-sm text-muted-foreground">
                        Notifications about flash sales and deals
                      </p>
                    </div>
                    <Switch
                      checked={notifications.pushPromotions}
                      onCheckedChange={(checked) =>
                        setNotifications((prev) => ({
                          ...prev,
                          pushPromotions: checked,
                        }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences" className="mt-6">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Theme</p>
                        <p className="text-sm text-muted-foreground">
                          Choose your preferred theme
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant={theme === "light" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setTheme("light")}
                        >
                          Light
                        </Button>
                        <Button
                          variant={theme === "dark" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setTheme("dark")}
                        >
                          Dark
                        </Button>
                        <Button
                          variant={theme === "system" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setTheme("system")}
                        >
                          System
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Language & Region</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Language</p>
                        <p className="text-sm text-muted-foreground">
                          Select your preferred language
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        <span>English (US)</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Currency</p>
                        <p className="text-sm text-muted-foreground">
                          Display prices in your preferred currency
                        </p>
                      </div>
                      <span>USD ($)</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
