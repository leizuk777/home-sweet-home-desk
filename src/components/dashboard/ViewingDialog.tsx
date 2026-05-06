import { useMemo, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useClients } from "@/context/ClientsContext";
import { useProperties } from "@/context/PropertiesContext";
import { useViewings, type Viewing, type ViewingStatus } from "@/context/ViewingsContext";
import { useActivity } from "@/context/ActivityContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: Viewing | null;
  defaultDate?: Date;
}

export const ViewingDialog = ({ open, onOpenChange, initial, defaultDate }: Props) => {
  const { clients } = useClients();
  const { properties } = useProperties();
  const { addViewing, updateViewing } = useViewings();
  const { logActivity } = useActivity();
  const { toast } = useToast();

  const isEdit = !!initial;
  const initialDate = initial ? new Date(initial.scheduledAt) : defaultDate ?? new Date();

  const [date, setDate] = useState<Date>(initialDate);
  const [time, setTime] = useState<string>(format(initialDate, "HH:mm"));
  const [clientId, setClientId] = useState<string>(initial?.clientId ?? "");
  const [propertyId, setPropertyId] = useState<string>(initial?.propertyId ?? "");
  const [duration, setDuration] = useState<number>(initial?.duration ?? 30);
  const [status, setStatus] = useState<ViewingStatus>(initial?.status ?? "scheduled");
  const [notes, setNotes] = useState<string>(initial?.notes ?? "");
  const [feedback, setFeedback] = useState<string>(initial?.feedback ?? "");

  const submit = () => {
    if (!clientId || !propertyId) {
      toast({ title: "Missing info", description: "Choose a client and a property.", variant: "destructive" });
      return;
    }
    const [h, m] = time.split(":").map(Number);
    const scheduled = new Date(date);
    scheduled.setHours(h || 0, m || 0, 0, 0);

    const client = clients.find((c) => c.id === clientId);
    const property = properties.find((p) => p.id === propertyId);

    if (isEdit && initial) {
      updateViewing(initial.id, {
        clientId, propertyId, scheduledAt: scheduled.toISOString(), duration, status, notes, feedback,
      });
      logActivity({
        type: "viewing", who: client?.name ?? "Viewing",
        what: `viewing updated · ${property?.address ?? ""}`, clientId,
      });
      toast({ title: "Viewing updated" });
    } else {
      addViewing({ clientId, propertyId, scheduledAt: scheduled.toISOString(), duration, status, notes, feedback });
      logActivity({
        type: "viewing", who: client?.name ?? "Viewing",
        what: `scheduled a viewing at ${property?.address ?? ""} on ${format(scheduled, "MMM d, p")}`,
        clientId,
      });
      toast({ title: "Viewing scheduled" });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {isEdit ? "Edit viewing" : "Schedule a viewing"}
          </DialogTitle>
          <DialogDescription>
            Pair a client with a property and pick a time.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Client</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Property</Label>
              <Select value={propertyId} onValueChange={setPropertyId}>
                <SelectTrigger><SelectValue placeholder="Select property" /></SelectTrigger>
                <SelectContent>
                  {properties.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.address}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5 col-span-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start font-normal", !date && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} initialFocus className={cn("p-3 pointer-events-auto")} />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1.5">
              <Label>Time</Label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Duration (min)</Label>
              <Input type="number" min={15} step={15} value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as ViewingStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="no-show">No-show</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything to prep before the viewing…" rows={2} />
          </div>

          {(status === "completed" || isEdit) && (
            <div className="space-y-1.5">
              <Label>Feedback</Label>
              <Textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Client reaction, follow-ups…" rows={2} />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit}>{isEdit ? "Save changes" : "Schedule"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
