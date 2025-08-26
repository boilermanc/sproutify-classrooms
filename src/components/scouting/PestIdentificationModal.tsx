// src/components/scouting/PestIdentificationModal.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PestIdentificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (pest: string) => void;
}

export function PestIdentificationModal({ 
  isOpen,
  onClose,
  onSelect
}: PestIdentificationModalProps) {
  
  const testClick = (pestName: string) => {
    console.log("=== BUTTON CLICKED ===");
    console.log("Pest name:", pestName);
    console.log("onSelect function:", onSelect);
    
    // Test alert to see if click works at all
    alert(`Clicked: ${pestName}`);
    
    if (onSelect) {
      console.log("Calling onSelect...");
      onSelect(pestName);
      console.log("onSelect called");
    } else {
      console.log("ERROR: onSelect is undefined!");
    }
    
    console.log("Closing modal...");
    onClose();
    console.log("=== END CLICK ===");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Debug Pest Modal</DialogTitle>
          <DialogDescription>
            Click test - you should see alerts and console logs
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-2">
          <p>Modal is open: {isOpen ? 'YES' : 'NO'}</p>
          <p>onSelect function: {onSelect ? 'PROVIDED' : 'MISSING'}</p>
          
          <div className="space-y-2">
            <Button 
              onClick={() => testClick("Aphids")}
              className="w-full"
            >
              Test Click: Aphids
            </Button>
            
            <Button 
              onClick={() => testClick("Spider Mites")}
              className="w-full"
            >
              Test Click: Spider Mites
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => {
                console.log("Cancel clicked");
                onClose();
              }}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default PestIdentificationModal;