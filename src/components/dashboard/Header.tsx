import { Search, Bell, Plus, Command } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Header = () => {
  return (
    <header className="sticky top-0 z-20 backdrop-blur-xl bg-background/70 border-b border-border">
      <div className="flex items-center gap-4 px-6 lg:px-10 h-16">
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Thursday, April 30</div>
          <h1 className="font-display text-xl leading-none mt-1">Good afternoon, Elena</h1>
        </div>

        <div className="flex-1 max-w-xl mx-auto">
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search clients, listings, or addresses…"
              className="w-full h-10 pl-10 pr-16 rounded-lg bg-secondary/60 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition-all"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 text-[10px] text-muted-foreground bg-background px-1.5 py-0.5 rounded border border-border">
              <Command className="h-3 w-3" /> K
            </kbd>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="relative h-10 w-10 rounded-lg hover:bg-secondary flex items-center justify-center transition-colors">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-gold" />
          </button>
          <Button className="bg-gradient-gold text-primary-foreground hover:opacity-90 shadow-glow font-medium">
            <Plus className="h-4 w-4 mr-1" /> New Client
          </Button>
        </div>
      </div>
    </header>
  );
};
