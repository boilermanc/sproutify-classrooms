// src/components/ui/color-number-input.tsx (Fully Updated)

import { useState, useEffect } from "react";
import { Input, InputProps } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface ColorNumberInputProps extends Omit<InputProps, 'onChange' | 'value'> {
  type: "ph" | "ec";
  label: string;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
}

const getColorForValue = (type: "ph" | "ec", value: number | undefined): string => {
  if (value === undefined || isNaN(value)) {
    return "border-input"; // Default border
  }

  if (type === "ph") {
    // BEFORE (example of old logic):
    // if (value >= 6.0 && value <= 7.0) return "border-green-500 focus-visible:ring-green-500";
    // if (value >= 5.5 && value < 6.0 || value > 7.0 && value <= 7.5) return "border-yellow-500 focus-visible:ring-yellow-500";
    
    // AFTER: Ideal is now 5.5
    if (value >= 5.2 && value <= 5.8) {
      return "border-green-500 focus-visible:ring-green-500"; // Ideal range
    }
    if ((value >= 5.0 && value < 5.2) || (value > 5.8 && value <= 6.2)) {
      return "border-yellow-500 focus-visible:ring-yellow-500"; // Warning range
    }
    return "border-red-500 focus-visible:ring-red-500"; // Danger range
  }

  if (type === "ec") {
    // This logic remains the same, assuming an ideal range of 1.2 to 2.0 for EC
    if (value >= 1.2 && value <= 2.0) {
      return "border-green-500 focus-visible:ring-green-500";
    }
    if ((value >= 0.8 && value < 1.2) || (value > 2.0 && value <= 2.4)) {
      return "border-yellow-500 focus-visible:ring-yellow-500";
    }
    return "border-red-500 focus-visible:ring-red-500";
  }

  return "border-input";
};

export function ColorNumberInput({ type, label, value, onChange, ...props }: ColorNumberInputProps) {
  const [borderColorClass, setBorderColorClass] = useState("border-input");

  useEffect(() => {
    setBorderColorClass(getColorForValue(type, value));
  }, [value, type]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numValue = e.target.valueAsNumber;
    if (isNaN(numValue)) {
      onChange(undefined);
    } else {
      onChange(numValue);
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        type="number"
        inputMode="decimal"
        step={type === "ph" ? "0.1" : "0.1"}
        value={value ?? ""}
        onChange={handleChange}
        className={cn("transition-colors", borderColorClass)}
        {...props}
      />
    </div>
  );
}
