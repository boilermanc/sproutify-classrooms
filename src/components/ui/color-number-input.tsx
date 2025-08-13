import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// pH color mapping (6.0-8.0 range for hydroponics)
const PH_COLOR_MAP = [
  { value: 5.0, color: "#ff0000", name: "Red (Very Acidic)" },
  { value: 5.5, color: "#ff6600", name: "Orange (Acidic)" },
  { value: 6.0, color: "#ffcc00", name: "Yellow (Slightly Acidic)" },
  { value: 6.5, color: "#66ff00", name: "Light Green (Optimal)" },
  { value: 7.0, color: "#00ff00", name: "Green (Neutral)" },
  { value: 7.5, color: "#00ccff", name: "Light Blue (Slightly Basic)" },
  { value: 8.0, color: "#0066ff", name: "Blue (Basic)" },
  { value: 8.5, color: "#6600ff", name: "Purple (Very Basic)" },
];

// EC color mapping (0.8-2.4 mS/cm range for hydroponics)
const EC_COLOR_MAP = [
  { value: 0.5, color: "#ff0000", name: "Red (Too Low)" },
  { value: 0.8, color: "#ff6600", name: "Orange (Low)" },
  { value: 1.2, color: "#ffcc00", name: "Yellow (Good)" },
  { value: 1.6, color: "#00ff00", name: "Green (Optimal)" },
  { value: 2.0, color: "#66ccff", name: "Light Blue (High)" },
  { value: 2.4, color: "#0066ff", name: "Blue (Very High)" },
  { value: 3.0, color: "#6600ff", name: "Purple (Too High)" },
];

interface ColorNumberInputProps {
  type: "ph" | "ec";
  value?: number;
  onChange: (value: number | undefined) => void;
  placeholder?: string;
  label: string;
}

export function ColorNumberInput({ type, value, onChange, placeholder, label }: ColorNumberInputProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const colorMap = type === "ph" ? PH_COLOR_MAP : EC_COLOR_MAP;
  
  // Find closest color for current value
  const getCurrentColor = (val?: number) => {
    if (!val) return "#e5e7eb";
    const closest = colorMap.reduce((prev, curr) => 
      Math.abs(curr.value - val) < Math.abs(prev.value - val) ? curr : prev
    );
    return closest.color;
  };

  const handleColorSelect = (colorValue: number) => {
    onChange(colorValue);
    setShowColorPicker(false);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value === "" ? undefined : parseFloat(e.target.value);
    onChange(val);
  };

  const currentColor = getCurrentColor(value);

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="relative">
        <Input
          type="number"
          step="0.1"
          value={value ?? ""}
          onChange={handleNumberChange}
          placeholder={placeholder}
          className="pr-16"
          style={{ borderLeftColor: currentColor, borderLeftWidth: '4px' }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="absolute right-1 top-1 h-8 w-12 p-0"
          style={{ backgroundColor: currentColor }}
          onClick={() => setShowColorPicker(!showColorPicker)}
          title="Pick by color"
        />
        
        {showColorPicker && (
          <div className="absolute top-full left-0 mt-1 p-2 bg-background border rounded-lg shadow-lg z-10 w-full">
            <div className="grid grid-cols-2 gap-1">
              {colorMap.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  className="flex items-center gap-2 p-2 text-xs hover:bg-muted rounded text-left"
                  onClick={() => handleColorSelect(item.value)}
                >
                  <div 
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: item.color }}
                  />
                  <div>
                    <div className="font-medium">{item.value}</div>
                    <div className="text-muted-foreground">{item.name.split(' (')[1]?.replace(')', '')}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {value && (
        <div className="text-xs text-muted-foreground">
          {type === "ph" && (
            <>
              {value < 6.0 && "⚠️ Too acidic for most plants"}
              {value >= 6.0 && value <= 7.0 && "✅ Good for hydroponics"}
              {value > 7.0 && value <= 7.5 && "⚠️ Slightly high"}
              {value > 7.5 && "❌ Too basic for most plants"}
            </>
          )}
          {type === "ec" && (
            <>
              {value < 0.8 && "⚠️ Nutrients too low"}
              {value >= 0.8 && value <= 2.0 && "✅ Good nutrient level"}
              {value > 2.0 && "⚠️ High nutrients - may burn plants"}
            </>
          )}
        </div>
      )}
    </div>
  );
}