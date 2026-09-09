import { Mail } from "lucide-react";
import { checkoutContactSchema } from "@/lib/validations/checkout";
import type { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type ContactFormData = z.infer<typeof checkoutContactSchema>;

interface ContactStepProps {
  form: UseFormReturn<ContactFormData>;
  onNext: () => void;
}

export function ContactStep({ form, onNext }: ContactStepProps) {
  const watchedCreateAccount = form.watch("createAccount");

  const handleNext = async () => {
    const fields = watchedCreateAccount
      ? [
          "firstName",
          "lastName",
          "email",
          "phone",
          "password",
          "confirmPassword",
        ]
      : ["firstName", "lastName", "email", "phone"];

    const isValid = await form.trigger(fields as Array<keyof ContactFormData>);
    if (isValid) {
      onNext();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Contact Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input data-testid="first-name"
                id="firstName"
                {...form.register("firstName")}
                className={
                  form.formState.errors.firstName ? "border-destructive" : ""
                }
              />
              {form.formState.errors.firstName && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.firstName.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input data-testid="last-name"
                id="lastName"
                {...form.register("lastName")}
                className={
                  form.formState.errors.lastName ? "border-destructive" : ""
                }
              />
              {form.formState.errors.lastName && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input data-testid="email"
              id="email"
              type="email"
              {...form.register("email")}
              className={form.formState.errors.email ? "border-destructive" : ""}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input data-testid="phone"
              id="phone"
              type="tel"
              {...form.register("phone")}
              className={form.formState.errors.phone ? "border-destructive" : ""}
            />
            {form.formState.errors.phone && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.phone.message}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox data-testid="create-account-checkbox"
              id="createAccount"
              checked={watchedCreateAccount}
              onCheckedChange={(checked) =>
                form.setValue("createAccount", checked === true)
              }
            />
            <Label htmlFor="createAccount" className="text-sm">
              Create an account for faster checkout next time
            </Label>
          </div>

          {watchedCreateAccount && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="password">Password</Label>
                <Input data-testid="password"
                  id="password"
                  type="password"
                  {...form.register("password")}
                  className={
                    form.formState.errors.password ? "border-destructive" : ""
                  }
                />
                {form.formState.errors.password && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input data-testid="confirm-password"
                  id="confirmPassword"
                  type="password"
                  {...form.register("confirmPassword")}
                  className={
                    form.formState.errors.confirmPassword
                      ? "border-destructive"
                      : ""
                  }
                />
                {form.formState.errors.confirmPassword && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button data-testid="continue-to-shipping" type="button" onClick={handleNext}>Continue to Shipping</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}



