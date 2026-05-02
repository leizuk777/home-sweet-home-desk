import { useEffect, useState } from "react";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useClients } from "@/context/ClientsContext";
import { useActivity } from "@/context/ActivityContext";
import { useToast } from "@/hooks/use-toast";
import type { Client, ClientStage, ClientType } from "@/data/clients";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const schema = z.object({
  name: z.string().trim().min(2, "Name is required").max(80),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().min(5, "Phone is required").max(40),
  type: z.enum(["buyer", "seller", "renter", "investor"]),
  stage: z.enum(["lead", "viewing", "negotiating", "closing", "closed"]),
  budget: z.coerce.number().nonnegative("Budget must be positive").max(1_000_000_000),
  location: z.string().trim().min(2, "Location is required").max(120),
  property: z.string().trim().min(2, "Property is required").max(160),
  notes: z.string().trim().max(500).default(""),
  rating: z.number().int().min(1).max(5),
});

type FormValues = {
  name: string;
  email: string;
  phone: string;
  type: ClientType;
  stage: ClientStage;
  budget: number;
  location: string;
  property: string;
  notes: string;
  rating: number;
};

const fromClient = (c: Client): FormValues => ({
  name: c.name,
  email: c.email,
  phone: c.phone,
  type: c.type,
  stage: c.stage,
  budget: c.budget,
  location: c.location,
  property: c.property,
  notes: c.notes,
  rating: c.rating,
});

interface Props {
  client: Client;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditClientDialog = ({ client, open, onOpenChange }: Props) => {
  const { updateClient } = useClients();
  const { logActivity } = useActivity();
  const { toast } = useToast();
  const [values, setValues] = useState<FormValues>(() => fromClient(client));
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});

  useEffect(() => {
    if (open) {
      setValues(fromClient(client));
      setErrors({});
    }
  }, [open, client]);

  const set = <K extends keyof FormValues>(key: K, v: FormValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse(values);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof FormValues, string>> = {};
      result.error.issues.forEach((i) => {
        const k = i.path[0] as keyof FormValues;
        if (!fieldErrors[k]) fieldErrors[k] = i.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    const data = { ...result.data, notes: result.data.notes ?? "" };
    const changed: string[] = [];
    (Object.keys(data) as Array<keyof typeof data>).forEach((k) => {
      if ((client as any)[k] !== (data as any)[k]) changed.push(String(k));
    });
    updateClient(client.id, data);
    if (changed.length) {
      const stageChanged = changed.includes("stage");
      logActivity({
        who: data.name,
        what: stageChanged
          ? `details updated · stage → ${data.stage}`
          : `details updated (${changed.slice(0, 3).join(", ")}${changed.length > 3 ? "…" : ""})`,
        type: stageChanged ? "negotiation" : "edit",
        clientId: client.id,
      });
    }
    toast({
      title: "Client updated",
      description: `${result.data.name}'s details were saved.`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="text-[10px] uppercase tracking-[0.25em] text-gold mb-1">
            Edit Client · {client.id}
          </div>
          <DialogTitle className="font-display text-2xl">
            Refine <span className="text-gradient-gold italic">the details</span>
          </DialogTitle>
          <DialogDescription>
            Update any field below. Changes save instantly to the pipeline.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full name" error={errors.name}>
              <Input value={values.name} onChange={(e) => set("name", e.target.value)} maxLength={80} />
            </Field>
            <Field label="Email" error={errors.email}>
              <Input type="email" value={values.email} onChange={(e) => set("email", e.target.value)} maxLength={255} />
            </Field>
            <Field label="Phone" error={errors.phone}>
              <Input value={values.phone} onChange={(e) => set("phone", e.target.value)} maxLength={40} />
            </Field>
            <Field label="Budget (USD)" error={errors.budget}>
              <Input
                type="number"
                min={0}
                value={values.budget || ""}
                onChange={(e) => set("budget", Number(e.target.value))}
              />
            </Field>
            <Field label="Client type" error={errors.type}>
              <Select value={values.type} onValueChange={(v) => set("type", v as ClientType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="buyer">Buyer</SelectItem>
                  <SelectItem value="seller">Seller</SelectItem>
                  <SelectItem value="renter">Renter</SelectItem>
                  <SelectItem value="investor">Investor</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Pipeline stage" error={errors.stage}>
              <Select value={values.stage} onValueChange={(v) => set("stage", v as ClientStage)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead">New Lead</SelectItem>
                  <SelectItem value="viewing">Viewing</SelectItem>
                  <SelectItem value="negotiating">Negotiating</SelectItem>
                  <SelectItem value="closing">Closing</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Location" error={errors.location}>
              <Input value={values.location} onChange={(e) => set("location", e.target.value)} maxLength={120} />
            </Field>
            <Field label="Property interest" error={errors.property}>
              <Input value={values.property} onChange={(e) => set("property", e.target.value)} maxLength={160} />
            </Field>
          </div>

          <Field label="Priority rating">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  type="button"
                  key={n}
                  onClick={() => set("rating", n)}
                  className="p-1 rounded hover:bg-secondary transition-colors"
                  aria-label={`${n} star${n > 1 ? "s" : ""}`}
                >
                  <Star className={cn("h-5 w-5", n <= values.rating ? "fill-gold text-gold" : "text-muted-foreground")} />
                </button>
              ))}
            </div>
          </Field>

          <Field label="Notes" error={errors.notes}>
            <Textarea
              value={values.notes}
              onChange={(e) => set("notes", e.target.value)}
              rows={3}
              maxLength={500}
            />
          </Field>

          <DialogFooter className="pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="bg-gradient-gold text-primary-foreground hover:opacity-90 shadow-glow font-medium">
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const Field = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
    {children}
    {error && <p className="text-xs text-destructive">{error}</p>}
  </div>
);
