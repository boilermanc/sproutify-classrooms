// src/components/ui/color-number-input.tsx (Enhanced with Color Picker)

import { useState, useEffect } from "react";
import { Input, InputProps } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Palette } from "lucide-react";

interface ColorNumberInputProps extends Omit<InputProps, 'onChange' | 'value'> {
  type: "ph" | "ec";
  label: string;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
}

// Color mapping for pH test strips
const PH_COLORS = [
  { color: "#ef4444", bgColor: "bg-red-500", name: "Red", value: 4.5, range: "Very Acidic (4.0-5.0)", description: "Too acidic for most plants" },
  { color: "#f97316", bgColor: "bg-orange-500", name: "Orange", value: 5.2, range: "Acidic (5.0-5.5)", description: "Getting close to ideal" },
  { color: "#eab308", bgColor: "bg-yellow-500", name: "Yellow-Green", value: 5.5, range: "Ideal (5.2-5.8)", description: "Perfect for aeroponic plants!" },
  { color: "#22c55e", bgColor: "bg-green-500", name: "Green", value: 6.0, range: "Slightly Basic (5.8-6.5)", description: "Still acceptable" },
  { color: "#3b82f6", bgColor: "bg-blue-500", name: "Blue", value: 6.8, range: "Basic (6.5-7.0)", description: "Too basic for most plants" },
  { color: "#8b5cf6", bgColor: "bg-purple-500", name: "Purple", value: 7.2, range: "Very Basic (7.0+)", description: "Much too high" }
];

// Color mapping for EC test strips
const EC_COLORS = [
  { color: "#f8fafc", bgColor: "bg-slate-100 border border-slate-300", name: "Clear", value: 0.5, range: "Very Low (0.0-0.8)", description: "No nutrients - plants will starve" },
  { color: "#bfdbfe", bgColor: "bg-blue-200", name: "Light Blue", value: 1.0, range: "Low (0.8-1.2)", description: "Low nutrients - may need feeding" },
  { color: "#3b82f6", bgColor: "bg-blue-500", name: "Blue", value: 1.6, range: "Ideal (1.2-2.0)", description: "Perfect nutrient levels!" },
  { color: "#1e40af", bgColor: "bg-blue-700", name: "Dark Blue", value: 2.2, range: "High (2.0-2.4)", description: "High nutrients - dilute if needed" },
  { color: "#8b5cf6", bgColor: "bg-purple-500", name: "Purple", value: 2.8, range: "Very High (2.4+)", description: "Too high - plants may burn" }
];

const getColorForValue = (type: "ph" | "ec", value: number | undefined): string => {
  if (value === undefined || isNaN(value)) {
    return "border-input"; // Default border
  }

  if (type === "ph") {
    if (value >= 5.2 && value <= 5.8) {
      return "border-green-500 focus-visible:ring-green-500"; // Ideal range
    }
    if ((value >= 5.0 && value < 5.2) || (value > 5.8 && value <= 6.2)) {
      return "border-yellow-500 focus-visible:ring-yellow-500"; // Warning range
    }
    return "border-red-500 focus-visible:ring-red-500"; // Danger range
  }

  if (type === "ec") {
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
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);

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

  const handleColorSelect = (colorValue: number) => {
    onChange(colorValue);
    setIsColorPickerOpen(false);
  };

  const colors = type === "ph" ? PH_COLORS : EC_COLORS;
  const unitLabel = type === "ph" ? "pH" : "EC (mS/cm)";

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          type="number"
          inputMode="decimal"
          step={type === "ph" ? "0.1" : "0.1"}
          value={value ?? ""}
          onChange={handleChange}
          className={cn("transition-colors flex-1", borderColorClass)}
          {...props}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setIsColorPickerOpen(true)}
          className="shrink-0"
          title={`Select ${unitLabel} by color`}
        >
          <Palette className="h-4 w-4" />
        </Button>
      </div>

      <Dialog open={isColorPickerOpen} onOpenChange={setIsColorPickerOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select {unitLabel} by Color</DialogTitle>
            <DialogDescription>
              Choose the color that matches your {type.toUpperCase()} test strip or meter reading.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-3 py-4">
            {colors.map((colorData, index) => (
              <button
                key={index}
                onClick={() => handleColorSelect(colorData.value)}
                className="flex items-center gap-4 p-3 rounded-lg border hover:bg-accent transition-colors text-left"
              >
                <div 
                  className={cn("w-8 h-8 rounded-full shrink-0", colorData.bgColor)}
                  style={{ backgroundColor: colorData.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">
                    {colorData.name} - {type.toUpperCase()} {colorData.value}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {colorData.range}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {colorData.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
          
          <div className="text-xs text-muted-foreground mt-2 p-3 bg-muted rounded-md">
            <strong>Tip:</strong> Compare your test strip color to these options. If you're between colors, choose the closest match or use the numeric input above.
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}