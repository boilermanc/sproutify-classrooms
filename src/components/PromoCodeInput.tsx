import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, X, Tag } from 'lucide-react';

interface PromoCodeInputProps {
  onCodeApplied: (code: string, discount: string) => void;
  onCodeRemoved: () => void;
  appliedCode?: string;
  appliedDiscount?: string;
}

export const PromoCodeInput = ({ 
  onCodeApplied, 
  onCodeRemoved, 
  appliedCode, 
  appliedDiscount 
}: PromoCodeInputProps) => {
  const [code, setCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');

  // Your promo codes
  const quickCodes = [
    { code: 'EDUCATOR20', description: '20% off for educators' },
    { code: 'PILOT25', description: 'Free pilot program access' }
  ];

  const validatePromoCode = async (promoCode: string) => {
    setIsValidating(true);
    setError('');

    try {
      // Your specific promo codes
      const validCodes: Record<string, string> = {
        'EDUCATOR20': '20% off forever',
        'PILOT25': '100% free forever'
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (validCodes[promoCode.toUpperCase()]) {
        onCodeApplied(promoCode.toUpperCase(), validCodes[promoCode.toUpperCase()]);
        setCode('');
      } else {
        setError('Invalid promo code. Please check and try again.');
      }
    } catch (error) {
      setError('Failed to validate code. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      validatePromoCode(code.trim());
    }
  };

  const handleQuickCode = (quickCode: string) => {
    setCode(quickCode);
    validatePromoCode(quickCode);
  };

  const handleRemoveCode = () => {
    onCodeRemoved();
    setError('');
  };

  if (appliedCode) {
    return (
      <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-200">
        <CheckCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <strong>Code Applied: {appliedCode}</strong>
            <br />
            <span className="text-sm">{appliedDiscount}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemoveCode}
            className="text-green-800 hover:text-green-900 dark:text-green-200"
          >
            <X className="h-4 w-4" />
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
      <div className="flex items-center gap-2">
        <Tag className="h-4 w-4" />
        <Label className="text-sm font-medium">Have a promo code?</Label>
      </div>

      {/* Quick code buttons */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">Popular codes:</p>
        <div className="flex flex-wrap gap-2">
          {quickCodes.map((quick) => (
            <Button
              key={quick.code}
              variant="outline"
              size="sm"
              onClick={() => handleQuickCode(quick.code)}
              disabled={isValidating}
              className="text-xs"
            >
              {quick.code}
            </Button>
          ))}
        </div>
      </div>

      {/* Manual code entry */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          placeholder="Enter promo code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          disabled={isValidating}
          className="text-sm"
        />
        <Button 
          type="submit" 
          disabled={!code.trim() || isValidating}
          size="sm"
        >
          {isValidating ? 'Checking...' : 'Apply'}
        </Button>
      </form>

      {error && (
        <Alert className="border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
          <AlertDescription className="text-sm">
            {error}
          </AlertDescription>
        </Alert>
      )}

      <div className="text-xs text-muted-foreground">
        <p>Promo codes can also be entered during checkout.</p>
      </div>
    </div>
  );
};

// Banner component
export const PromoCodeBanner = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-4 py-2 text-center text-sm">
      <div className="flex items-center justify-center gap-4">
        <span>
          🎓 <strong>Educators Save 20%</strong> - Use code <Badge variant="secondary" className="text-green-800">EDUCATOR20</Badge> at checkout
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDismissed(true)}
          className="text-white hover:text-gray-200"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};