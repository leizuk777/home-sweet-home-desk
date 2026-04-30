import { useState } from "react";
import {
  Building2,
  Plus,
  BedDouble,
  Bath,
  Ruler,
  MapPin,
  Calendar,
  Trash2,
  MoreVertical,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useProperties } from "@/context/PropertiesContext";
import {
  propertyStatusMeta,
  type Property,
  type PropertyStatus,
} from "@/data/properties";
import { cn } from "@/lib/utils";

const formatPrice = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(2)}M` : `$${(n / 1000).toFixed(0)}K`;

const STATUSES: PropertyStatus[] = [
  "active",
  "pending",
  "under-offer",
  "sold",
  "withdrawn",
];

interface Props {
  clientId: string;
  defaultCity?: string;
}

export const PropertyListings = ({ clientId, defaultCity }: Props) => {
  const { byClient, addProperty, updateStatus, removeProperty } = useProperties();
  const list = byClient(clientId);
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
      <div className="px-6 py-5 border-b border-border flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-gold" />
            <h3 className="font-display text-lg">Property listings</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {list.length
              ? `${list.length} associated propert${list.length > 1 ? "ies" : "y"}`
              : "No properties linked to this client yet"}
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-gold text-primary-foreground text-xs uppercase tracking-wider font-medium shadow-elegant hover:opacity-90 transition-opacity">
              <Plus className="h-3.5 w-3.5" /> Add property
            </button>
          </DialogTrigger>
          <AddPropertyDialog
            clientId={clientId}
            defaultCity={defaultCity}
            onCreate={(data) => {
              addProperty(data);
              setOpen(false);
              toast({ title: "Property added", description: data.address });
            }}
          />
        </Dialog>
      </div>

      {list.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <div className="mx-auto h-12 w-12 rounded-xl bg-secondary/60 border border-border flex items-center justify-center mb-3">
            <Building2 className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            Link properties to track viewings, offers, and closings for this client.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {list.map((p) => (
            <PropertyRow
              key={p.id}
              property={p}
              onStatusChange={(s) => {
                updateStatus(p.id, s);
                toast({
                  title: "Status updated",
                  description: `${p.address} → ${propertyStatusMeta[s].label}`,
                });
              }}
              onRemove={() => {
                removeProperty(p.id);
                toast({ title: "Property removed", description: p.address });
              }}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

const PropertyRow = ({
  property,
  onStatusChange,
  onRemove,
}: {
  property: Property;
  onStatusChange: (s: PropertyStatus) => void;
  onRemove: () => void;
}) => {
  const status = propertyStatusMeta[property.status];
  return (
    <li className="px-6 py-4 flex items-start gap-4 hover:bg-secondary/30 transition-colors">
      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-secondary to-card border border-border flex items-center justify-center shrink-0">
        <Building2 className="h-5 w-5 text-gold" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-medium text-foreground truncate">
                {property.address}
              </h4>
              <span
                className={cn(
                  "inline-flex px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-medium border",
                  status.className
                )}
              >
                {status.label}
              </span>
            </div>
            <div className="flex items-center gap-x-4 gap-y-1 flex-wrap text-xs text-muted-foreground mt-1">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {property.city}
              </span>
              <span>{property.type}</span>
              <span className="inline-flex items-center gap-1">
                <BedDouble className="h-3 w-3" /> {property.beds} bd
              </span>
              <span className="inline-flex items-center gap-1">
                <Bath className="h-3 w-3" /> {property.baths} ba
              </span>
              <span className="inline-flex items-center gap-1">
                <Ruler className="h-3 w-3" /> {property.sqft.toLocaleString()} sqft
              </span>
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Listed {property.listedDate}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <div className="font-mono text-sm text-gold">{formatPrice(property.price)}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {property.id}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger className="h-8 w-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-gold hover:border-gold/40 transition-colors">
                <MoreVertical className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Set status
                </DropdownMenuLabel>
                {STATUSES.map((s) => (
                  <DropdownMenuItem
                    key={s}
                    onClick={() => onStatusChange(s)}
                    disabled={s === property.status}
                  >
                    {propertyStatusMeta[s].label}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onRemove}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-2" /> Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </li>
  );
};

const AddPropertyDialog = ({
  clientId,
  defaultCity,
  onCreate,
}: {
  clientId: string;
  defaultCity?: string;
  onCreate: (p: Omit<Property, "id" | "listedDate">) => void;
}) => {
  const [form, setForm] = useState({
    address: "",
    city: defaultCity ?? "",
    type: "Condo",
    beds: "2",
    baths: "2",
    sqft: "1200",
    price: "1000000",
    status: "active" as PropertyStatus,
  });

  const update = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.address.trim() || !form.city.trim()) {
      toast({
        title: "Missing details",
        description: "Address and city are required.",
        variant: "destructive",
      });
      return;
    }
    onCreate({
      clientId,
      address: form.address.trim(),
      city: form.city.trim(),
      type: form.type,
      beds: Number(form.beds) || 0,
      baths: Number(form.baths) || 0,
      sqft: Number(form.sqft) || 0,
      price: Number(form.price) || 0,
      status: form.status,
    });
  };

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle className="font-display text-2xl">Add property</DialogTitle>
        <DialogDescription>
          Link a new listing to this client's portfolio.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            placeholder="1428 Broadway Ave"
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="city">City / Area</Label>
            <Input
              id="city"
              placeholder="Pacific Heights, SF"
              value={form.city}
              onChange={(e) => update("city", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Input
              id="type"
              placeholder="Condo"
              value={form.type}
              onChange={(e) => update("type", e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-2">
            <Label htmlFor="beds">Beds</Label>
            <Input
              id="beds"
              type="number"
              min="0"
              value={form.beds}
              onChange={(e) => update("beds", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="baths">Baths</Label>
            <Input
              id="baths"
              type="number"
              min="0"
              step="0.5"
              value={form.baths}
              onChange={(e) => update("baths", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sqft">Sq ft</Label>
            <Input
              id="sqft"
              type="number"
              min="0"
              value={form.sqft}
              onChange={(e) => update("sqft", e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="price">Price (USD)</Label>
            <Input
              id="price"
              type="number"
              min="0"
              value={form.price}
              onChange={(e) => update("price", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={form.status}
              onValueChange={(v) => update("status", v as PropertyStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {propertyStatusMeta[s].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" className="bg-gradient-gold text-primary-foreground">
            Add property
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};
