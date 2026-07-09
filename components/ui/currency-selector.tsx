"use client";

import { useCurrencyStore, CURRENCIES, type CurrencyCode } from "@/lib/stores/currency-store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";

const CURRENCY_LIST = Object.values(CURRENCIES);

export function CurrencySelector() {
  const { currency, setCurrency } = useCurrencyStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <Select value={currency} disabled>
        <SelectTrigger className="h-8 w-[100px] text-xs">
          <SelectValue placeholder="…" />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select value={currency} onValueChange={(val) => setCurrency(val as CurrencyCode)}>
      <SelectTrigger className="h-8 w-[100px] text-xs" aria-label="Select currency">
        <SelectValue placeholder="Currency" />
      </SelectTrigger>
      <SelectContent>
        {CURRENCY_LIST.map((c) => (
          <SelectItem key={c.code} value={c.code} className="text-xs">
            <span className="flex items-center gap-2">
              <span className="font-medium">{c.symbol}</span>
              <span>{c.name}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
