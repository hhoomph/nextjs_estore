import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface ShippingStepProps {
  form: any;
  billingSameAsShipping: boolean;
  setBillingSameAsShipping: (value: boolean) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function ShippingStep({
  form,
  billingSameAsShipping,
  setBillingSameAsShipping,
  onNext,
  onPrevious,
}: ShippingStepProps) {
  const handleSubmit = form.handleSubmit((data: any) => {
    if (!billingSameAsShipping && !data.billingAddress) {
      form.setError("billingAddress.address_line1", {
        message: "Billing address is required",
      });
      return;
    }
    onNext();
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Shipping Address
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="shippingAddress.address_line1">Address Line 1</Label>
          <Input
            id="shippingAddress.address_line1"
            {...form.register("shippingAddress.address_line1")}
            className={
              form.formState.errors.shippingAddress?.address_line1
                ? "border-destructive"
                : ""
            }
          />
          {form.formState.errors.shippingAddress?.address_line1 && (
            <p className="text-sm text-destructive mt-1">
              {form.formState.errors.shippingAddress.address_line1.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="shippingAddress.address_line2">
            Address Line 2 (Optional)
          </Label>
          <Input
            id="shippingAddress.address_line2"
            {...form.register("shippingAddress.address_line2")}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="shippingAddress.city">City</Label>
            <Input
              id="shippingAddress.city"
              {...form.register("shippingAddress.city")}
              className={
                form.formState.errors.shippingAddress?.city
                  ? "border-destructive"
                  : ""
              }
            />
            {form.formState.errors.shippingAddress?.city && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.shippingAddress.city.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="shippingAddress.state">State/Province</Label>
            <Input
              id="shippingAddress.state"
              {...form.register("shippingAddress.state")}
              className={
                form.formState.errors.shippingAddress?.state
                  ? "border-destructive"
                  : ""
              }
            />
            {form.formState.errors.shippingAddress?.state && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.shippingAddress.state.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="shippingAddress.postal_code">Postal Code</Label>
            <Input
              id="shippingAddress.postal_code"
              {...form.register("shippingAddress.postal_code")}
              className={
                form.formState.errors.shippingAddress?.postal_code
                  ? "border-destructive"
                  : ""
              }
            />
            {form.formState.errors.shippingAddress?.postal_code && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.shippingAddress.postal_code.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="shippingAddress.country">Country</Label>
            <Input
              id="shippingAddress.country"
              {...form.register("shippingAddress.country")}
              className={
                form.formState.errors.shippingAddress?.country
                  ? "border-destructive"
                  : ""
              }
            />
            {form.formState.errors.shippingAddress?.country && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.shippingAddress.country.message}
              </p>
            )}
          </div>
        </div>

        <Separator />

        <div className="flex items-center space-x-2">
          <Checkbox
            id="billingSame"
            checked={billingSameAsShipping}
            onCheckedChange={(checked) =>
              setBillingSameAsShipping(checked === true)
            }
          />
          <Label htmlFor="billingSame" className="text-sm">
            Billing address is the same as shipping address
          </Label>
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onPrevious}>
            Back to Contact
          </Button>
          <Button onClick={handleSubmit}>Continue to Payment</Button>
        </div>
      </CardContent>
    </Card>
  );
}
