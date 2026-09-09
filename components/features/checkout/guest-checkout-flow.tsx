"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { lazy, Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { checkoutContactSchema } from "@/lib/validations/checkout";
import { SHIPPING_COST, TAX_RATE } from "@/lib/constants/checkout";
import type { EnhancedCartItem } from "@/types/cart";
import { CheckoutProgress } from "./checkout-progress";

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

const guestCheckoutSchema = checkoutContactSchema.extend({
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
    payment: z.object({
      cardNumber: z.string().min(16, "Card number must be 16 digits"),
      expiryDate: z
        .string()
        .regex(/^\d{2}\/\d{2}$/, "Expiry date must be MM/YY format"),
      cvv: z.string().min(3, "CVV must be at least 3 digits"),
      cardName: z.string().min(1, "Cardholder name is required"),
    }),
  })
  .refine(
    (data) => {
      if (data.createAccount) {
        return Boolean(data.password && data.password.length >= 8);
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

export type GuestCheckoutFormData = z.infer<typeof guestCheckoutSchema>;

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
  const [currentStep, setCurrentStep] = useState<
    "contact" | "shipping" | "payment" | "review"
  >("contact");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);

  const form = useForm<GuestCheckoutFormData>({
    resolver: zodResolver(guestCheckoutSchema as any),
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
      payment: {
        cardNumber: "",
        expiryDate: "",
        cvv: "",
        cardName: "",
      },
      createAccount: false,
      password: "",
      confirmPassword: "",
    },
  });


  const handleFinalSubmit = form.handleSubmit(async (data) => {
    setIsSubmitting(true);

    try {
      const tax = cartTotal * TAX_RATE;
      const total = cartTotal + SHIPPING_COST + tax;

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
        payment: data.payment,
        items: cartItems,
        totals: {
          subtotal: cartTotal,
          shipping: SHIPPING_COST,
          tax,
          total,
        },
      };

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

  const LoadingStep = () => (
    <div className="animate-pulse">
      <div className="h-96 rounded-lg bg-muted" />
    </div>
  );

  return (
    <div data-testid="guest-checkout-flow" className="mx-auto max-w-2xl space-y-6">
      <div data-testid="guest-checkout-indicator" className="sr-only">Guest Checkout</div>
      <CheckoutProgress currentStep={currentStep} />

      <Suspense fallback={<LoadingStep />}>
        {currentStep === "contact" && (
          <ContactStep form={form as any} onNext={() => setCurrentStep("shipping")} />
        )}

        {currentStep === "shipping" && (
          <ShippingStep
            form={form as any}
            billingSameAsShipping={billingSameAsShipping}
            setBillingSameAsShipping={setBillingSameAsShipping}
            onNext={() => setCurrentStep("payment")}
            onPrevious={goToPreviousStep}
          />
        )}

        {currentStep === "payment" && (
          <PaymentStep
            form={form as any}
            onNext={() => setCurrentStep("review")}
            onPrevious={goToPreviousStep}
          />
        )}

        {currentStep === "review" && (
          <ReviewStep
            cartItems={cartItems}
            cartTotal={cartTotal}
            shippingCost={SHIPPING_COST}
            tax={cartTotal * TAX_RATE}
            isSubmitting={isSubmitting}
            onSubmit={handleFinalSubmit}
            onPrevious={goToPreviousStep}
          />
        )}
      </Suspense>

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



