import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PaymentStepProps {
  onNext: () => void;
  onPrevious: () => void;
}

export function PaymentStep({ onNext, onPrevious }: PaymentStepProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted/50 border border-border rounded-md p-4">
          <p className="text-sm text-muted-foreground">
            For demo purposes, you can enter any card details. No real payment
            will be processed.
          </p>
        </div>

        <div>
          <Label htmlFor="cardNumber">Card Number</Label>
          <Input
            id="cardNumber"
            placeholder="1234 5678 9012 3456"
            maxLength={19}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="expiryDate">Expiry Date</Label>
            <Input id="expiryDate" placeholder="MM/YY" maxLength={5} />
          </div>
          <div>
            <Label htmlFor="cvv">CVV</Label>
            <Input id="cvv" placeholder="123" maxLength={4} />
          </div>
        </div>

        <div>
          <Label htmlFor="cardName">Cardholder Name</Label>
          <Input id="cardName" placeholder="John Doe" />
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onPrevious}>
            Back to Shipping
          </Button>
          <Button onClick={onNext}>Review Order</Button>
        </div>
      </CardContent>
    </Card>
  );
}
