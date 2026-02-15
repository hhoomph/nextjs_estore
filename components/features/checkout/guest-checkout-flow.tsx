/**
 * Guest Checkout Flow Component
 *
 * Allows users to complete checkout without authentication,
 * with form validation and enhanced user experience.
 * Uses lazy loading for step components to optimize bundle size.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { lazy, Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useCheckoutSession } from "@/lib/hooks/use-cart-sync";
import type { EnhancedCartItem } from "@/types/cart";
import { CheckoutProgress } from "./checkout-progress";

// Lazy load step components for better performance
const ContactStep = lazy(() =>
  import("./steps/contact-step").then((m) => ({ default: m.ContactStep })),
);
const ShippingStep = lazy(() =>
  import("./steps/shipping-step").then((m) => ({ default: m.ShippingStep })),
);
const PaymentStep = lazy(() =>
  import("./steps/payment-step").then((m) => ({ default: m.PaymentStep })),
);
const ReviewStep = lazy(() =>
  import("./steps/review-step").then((m) => ({ default: m.ReviewStep })),
);

// Validation schemas
const guestCheckoutSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    phone: z.string().min(10, "Please enter a valid phone number"),
    shippingAddress: z.object({
      address_line1: z.string().min(1, "Address is required"),
      address_line2: z.string().optional(),
      city: z.string().min(1, "City is required"),
      state: z.string().min(1, "State/Province is required"),
      postal_code: z.string().min(1, "Postal code is required"),
      country: z.string().min(1, "Country is required"),
    }),
    billingAddress: z
      .object({
        address_line1: z.string().min(1, "Address is required"),
        address_line2: z.string().optional(),
        city: z.string().min(1, "City is required"),
        state: z.string().min(1, "State/Province is required"),
        postal_code: z.string().min(1, "Postal code is required"),
        country: z.string().min(1, "Country is required"),
      })
      .optional(),
    createAccount: z.boolean(),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.createAccount) {
        return data.password && data.password.length >= 8;
      }
      return true;
    },
    {
      message: "Password must be at least 8 characters",
      path: ["password"],
    },
  )
  .refine(
    (data) => {
      if (data.createAccount && data.password && data.confirmPassword) {
        return data.password === data.confirmPassword;
      }
      return true;
    },
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    },
  );

type GuestCheckoutFormData = z.infer<typeof guestCheckoutSchema>;

interface GuestCheckoutFlowProps {
  cartItems: EnhancedCartItem[];
  cartTotal: number;
  onSuccess?: (orderId: string) => void;
  onError?: (error: string) => void;
}

export function GuestCheckoutFlow({
  cartItems,
  cartTotal,
  onSuccess,
  onError,
}: GuestCheckoutFlowProps) {
  const router = useRouter();
  const { createCheckoutSession } = useCheckoutSession();

  const [currentStep, setCurrentStep] = useState<
    "contact" | "shipping" | "payment" | "review"
  >("contact");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);

  const form = useForm<GuestCheckoutFormData>({
    resolver: zodResolver(guestCheckoutSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      phone: "",
      shippingAddress: {
        address_line1: "",
        address_line2: "",
        city: "",
        state: "",
        postal_code: "",
        country: "United States",
      },
      billingAddress: undefined,
      createAccount: false,
      password: "",
      confirmPassword: "",
    },
  });

  // Watch form values for conditional rendering
  const watchedCreateAccount = form.watch("createAccount");

  const handleContactSubmit = form.handleSubmit((data) => {
    setCurrentStep("shipping");
  });

  const handleShippingSubmit = form.handleSubmit((data) => {
    if (!billingSameAsShipping && !data.billingAddress) {
      form.setError("billingAddress.address_line1", {
        message: "Billing address is required",
      });
      return;
    }
    setCurrentStep("payment");
  });

  const handlePaymentSubmit = form.handleSubmit(async (data) => {
    setCurrentStep("review");
  });

  const handleFinalSubmit = form.handleSubmit(async (data) => {
    setIsSubmitting(true);

    try {
      // Create checkout session
      const session = await createCheckoutSession(cartItems);

      // Prepare order data
      const orderData = {
        guestInfo: {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          createAccount: data.createAccount,
          password: data.createAccount ? data.password : undefined,
        },
        shippingAddress: data.shippingAddress,
        billingAddress: data.billingAddress || data.shippingAddress,
        items: cartItems,
        sessionId: session.id,
        totals: {
          subtotal: cartTotal,
          shipping: 5.99, // Default shipping
          tax: cartTotal * 0.08, // 8% tax
          total: cartTotal + 5.99 + cartTotal * 0.08,
        },
      };

      // Submit order
      const response = await fetch("/api/orders/guest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create order");
      }

      const result = await response.json();

      // Clear checkout session
      sessionStorage.removeItem("checkout_session");

      // Redirect to success page
      router.push(`/checkout/success?order=${result.orderId}`);

      onSuccess?.(result.orderId);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      onError?.(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  });

  const goToPreviousStep = () => {
    switch (currentStep) {
      case "shipping":
        setCurrentStep("contact");
        break;
      case "payment":
        setCurrentStep("shipping");
        break;
      case "review":
        setCurrentStep("payment");
        break;
    }
  };

  // Loading fallback component
  const LoadingStep = () => (
    <div className="animate-pulse">
      <div className="h-96 bg-muted rounded-lg"></div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress Indicator */}
      <CheckoutProgress currentStep={currentStep} />

      {/* Step Content with Lazy Loading */}
      <Suspense fallback={<LoadingStep />}>
        {currentStep === "contact" && (
          <ContactStep form={form} onNext={() => setCurrentStep("shipping")} />
        )}

        {currentStep === "shipping" && (
          <ShippingStep
            form={form}
            billingSameAsShipping={billingSameAsShipping}
            setBillingSameAsShipping={setBillingSameAsShipping}
            onNext={() => setCurrentStep("payment")}
            onPrevious={goToPreviousStep}
          />
        )}

        {currentStep === "payment" && (
          <PaymentStep
            onNext={() => setCurrentStep("review")}
            onPrevious={goToPreviousStep}
          />
        )}

        {currentStep === "review" && (
          <ReviewStep
            cartItems={cartItems}
            cartTotal={cartTotal}
            isSubmitting={isSubmitting}
            onSubmit={handleFinalSubmit}
            onPrevious={goToPreviousStep}
          />
        )}
      </Suspense>

      {/* Sign in prompt */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/auth/signin" className="text-primary hover:underline">
            Sign in
          </Link>{" "}
          for faster checkout.
        </p>
      </div>
    </div>
  );
}
