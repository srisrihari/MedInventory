
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Supplier {
  id: string;
  name: string;
  rating: number;
  responseTime: string;
  deliveryPerformance: string;
  priceCompetitiveness: string;
  onTimeDelivery: number;
  status: string;
}

interface EditPerformanceDialogProps {
  supplier: Supplier | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedData: Partial<Supplier>) => void;
}

export function EditPerformanceDialog({
  supplier,
  open,
  onOpenChange,
  onSave
}: EditPerformanceDialogProps) {
  const { toast } = useToast();
  const [rating, setRating] = useState(supplier?.rating || 0);
  const [deliveryPerformance, setDeliveryPerformance] = useState(supplier?.deliveryPerformance || "");
  const [responseTime, setResponseTime] = useState(supplier?.responseTime || "");
  const [priceCompetitiveness, setPriceCompetitiveness] = useState(supplier?.priceCompetitiveness || "");
  const [onTimeDelivery, setOnTimeDelivery] = useState(supplier?.onTimeDelivery || 0);
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Reset form when supplier changes
  if (supplier && (rating !== supplier.rating || 
                   deliveryPerformance !== supplier.deliveryPerformance || 
                   responseTime !== supplier.responseTime || 
                   priceCompetitiveness !== supplier.priceCompetitiveness || 
                   onTimeDelivery !== supplier.onTimeDelivery)) {
    setRating(supplier.rating);
    setDeliveryPerformance(supplier.deliveryPerformance);
    setResponseTime(supplier.responseTime);
    setPriceCompetitiveness(supplier.priceCompetitiveness);
    setOnTimeDelivery(supplier.onTimeDelivery);
    setNotes("");
  }

  const handleSave = () => {
    if (!supplier) return;
    
    setIsSaving(true);
    
    const updatedData: Partial<Supplier> = {
      rating,
      deliveryPerformance,
      responseTime,
      priceCompetitiveness,
      onTimeDelivery
    };
    
    // Simulate API call
    setTimeout(() => {
      onSave(updatedData);
      setIsSaving(false);
      onOpenChange(false);
      
      toast({
        title: "Performance updated",
        description: `${supplier.name}'s performance metrics have been updated.`,
      });
    }, 800);
  };

  const renderStarRating = () => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="focus:outline-none transition-transform hover:scale-110"
            onClick={() => setRating(star)}
          >
            <Star
              size={24}
              className={cn(
                "cursor-pointer transition-colors",
                star <= rating
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-300 hover:text-gray-400"
              )}
            />
          </button>
        ))}
        
        <span className="ml-2 text-sm font-medium">
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  if (!supplier) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Supplier Performance</DialogTitle>
          <DialogDescription>
            Update performance metrics for {supplier.name}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="rating">Rating</Label>
            {renderStarRating()}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="delivery-performance">Delivery Performance</Label>
              <Select
                value={deliveryPerformance}
                onValueChange={setDeliveryPerformance}
              >
                <SelectTrigger id="delivery-performance">
                  <SelectValue placeholder="Select performance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Excellent">Excellent</SelectItem>
                  <SelectItem value="Good">Good</SelectItem>
                  <SelectItem value="Average">Average</SelectItem>
                  <SelectItem value="Poor">Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="response-time">Response Time</Label>
              <Select
                value={responseTime}
                onValueChange={setResponseTime}
              >
                <SelectTrigger id="response-time">
                  <SelectValue placeholder="Select response time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">Within 24 hours</SelectItem>
                  <SelectItem value="48h">Within 48 hours</SelectItem>
                  <SelectItem value="72h">Within 72 hours</SelectItem>
                  <SelectItem value="1w">Over a week</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price-competitiveness">Price Competitiveness</Label>
              <Select
                value={priceCompetitiveness}
                onValueChange={setPriceCompetitiveness}
              >
                <SelectTrigger id="price-competitiveness">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="on-time-delivery">On-Time Delivery (%)</Label>
              <Input
                id="on-time-delivery"
                type="number"
                min="0"
                max="100"
                value={onTimeDelivery}
                onChange={(e) => setOnTimeDelivery(Number(e.target.value))}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Internal Only)</Label>
            <Textarea
              id="notes"
              placeholder="Add notes about recent performance changes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
