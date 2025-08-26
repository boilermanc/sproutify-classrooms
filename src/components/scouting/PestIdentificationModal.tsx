// src/components/scouting/PestIdentificationModal.tsx
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Bug } from "lucide-react";

interface PestIdentificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (pest: string) => void;
}

export function PestIdentificationModal({ 
  isOpen,
  onClose,
  onSelect
}: PestIdentificationModalProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const commonPests = [
    "Aphids",
    "Spider Mites",
    "Whiteflies", 
    "Thrips",
    "Fungus Gnats",
    "Scale Insects",
    "Mealybugs",
    "Root Aphids"
  ];

  const filteredPests = commonPests.filter(pest =>
    pest.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Pest Identification
          </DialogTitle>
          <DialogDescription>
            Search and select a pest from our database or enter a custom observation.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pest-search">Search for pest</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="pest-search"
                placeholder="Type to search pests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Common Hydroponic Pests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {filteredPests.map((pest) => (
                  <Button
                    key={pest}
                    variant="ghost"
                    className="justify-start h-auto p-2 text-left"
                    onClick={() => {
                      onSelect(pest);
                      onClose();
                    }}
                  >
                    <Bug className="h-4 w-4 mr-2 text-muted-foreground" />
                    {pest}
                  </Button>
                ))}
                {filteredPests.length === 0 && searchTerm && (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    No pests found. Try a different search term.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button 
              className="flex-1"
              onClick={() => {
                onSelect(searchTerm || "Custom pest");
                onClose();
              }}
            >
              Use Custom
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default PestIdentificationModal;