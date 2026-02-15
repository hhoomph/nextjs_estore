import { Check, CreditCard, MapPin, User } from "lucide-react";

interface CheckoutProgressProps {
  currentStep: "contact" | "shipping" | "payment" | "review";
}

const steps = [
  { key: "contact", label: "Contact", icon: User },
  { key: "shipping", label: "Shipping", icon: MapPin },
  { key: "payment", label: "Payment", icon: CreditCard },
  { key: "review", label: "Review", icon: Check },
] as const;

export function CheckoutProgress({ currentStep }: CheckoutProgressProps) {
  return (
    <div className="flex items-center justify-center space-x-4 mb-8">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = step.key === currentStep;
        const isCompleted =
          steps.findIndex((s) => s.key === currentStep) > index;

        return (
          <div key={step.key} className="flex items-center">
            <div
              className={`
              flex items-center justify-center w-10 h-10 rounded-full border-2
              ${
                isCompleted
                  ? "bg-primary border-primary text-primary-foreground"
                  : isActive
                    ? "border-primary text-primary"
                    : "border-muted-foreground text-muted-foreground"
              }
            `}
            >
              {isCompleted ? (
                <Check className="h-5 w-5" />
              ) : (
                <Icon className="h-5 w-5" />
              )}
            </div>
            <span
              className={`ml-2 text-sm font-medium ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <div
                className={`w-12 h-0.5 mx-4 ${
                  isCompleted ? "bg-primary" : "bg-muted-foreground"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
