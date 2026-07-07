import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { GuestCheckoutFormData } from "../guest-checkout-flow";

interface PaymentStepProps {
  form: any;
  onNext: () => void;
  onPrevious: () => void;
}

export function PaymentStep({ form, onNext, onPrevious }: PaymentStepProps) {
  const handleNext = async () => {
    const isValid = await form.trigger([
      "payment.cardNumber",
      "payment.expiryDate",
      "payment.cvv",
      "payment.cardName",
    ]);

    if (isValid) {
      onNext();
    }
  };

  return (
    <Card className="rounded-[2rem] border border-primary/20 shadow-xl shadow-primary/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-black text-foreground">
          <CreditCard className="h-5 w-5 text-primary" />
          Payment Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form>
          <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4">
            <p className="text-sm font-medium text-foreground">
              Demo checkout only. Enter any valid-looking card details; no real
              payment will be processed.
            </p>
          </div>

          <div>
            <Label htmlFor="payment.cardNumber">Card Number</Label>
            <Input
              id="payment.cardNumber"
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              {...form.register("payment.cardNumber")}
              className={
                form.formState.errors.payment?.cardNumber ? "border-destructive" : ""
              }
            />
            {form.formState.errors.payment?.cardNumber && (
              <p className="mt-1 text-sm text-destructive">
                {form.formState.errors.payment.cardNumber.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="payment.expiryDate">Expiry Date</Label>
              <Input
                id="payment.expiryDate"
                placeholder="MM/YY"
                maxLength={5}
                {...form.register("payment.expiryDate")}
                className={
                  form.formState.errors.payment?.expiryDate
                    ? "border-destructive"
                    : ""
                }
              />
              {form.formState.errors.payment?.expiryDate && (
                <p className="mt-1 text-sm text-destructive">
                  {form.formState.errors.payment.expiryDate.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="payment.cvv">CVV</Label>
              <Input
                id="payment.cvv"
                placeholder="123"
                maxLength={4}
                {...form.register("payment.cvv")}
                className={form.formState.errors.payment?.cvv ? "border-destructive" : ""}
              />
              {form.formState.errors.payment?.cvv && (
                <p className="mt-1 text-sm text-destructive">
                  {form.formState.errors.payment.cvv.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="payment.cardName">Cardholder Name</Label>
            <Input
              id="payment.cardName"
              placeholder="John Doe"
              {...form.register("payment.cardName")}
              className={
                form.formState.errors.payment?.cardName ? "border-destructive" : ""
              }
            />
            {form.formState.errors.payment?.cardName && (
              <p className="mt-1 text-sm text-destructive">
                {form.formState.errors.payment.cardName.message}
              </p>
            )}
          </div>

          <div className="flex justify-between gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onPrevious}
              className="rounded-full"
            >
              Back to Shipping
            </Button>
            <Button
              type="button"
              onClick={handleNext}
              className="rounded-full"
            >
              Review Order
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
