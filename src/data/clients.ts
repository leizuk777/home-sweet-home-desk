export type ClientStage = "lead" | "viewing" | "negotiating" | "closing" | "closed";
export type ClientType = "buyer" | "seller" | "renter" | "investor";

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: ClientType;
  stage: ClientStage;
  budget: number;
  location: string;
  property: string;
  lastContact: string;
  avatar: string;
  notes: string;
  rating: number;
}

export const stages: { id: ClientStage; label: string; color: string }[] = [
  { id: "lead", label: "New Leads", color: "text-info" },
  { id: "viewing", label: "Viewing", color: "text-warning" },
  { id: "negotiating", label: "Negotiating", color: "text-gold" },
  { id: "closing", label: "Closing", color: "text-success" },
  { id: "closed", label: "Closed", color: "text-muted-foreground" },
];

export const clients: Client[] = [
  {
    id: "C-001",
    name: "Amelia Hartwood",
    email: "amelia.h@hartwood.co",
    phone: "+1 (415) 555-0142",
    type: "buyer",
    stage: "negotiating",
    budget: 2_450_000,
    location: "Pacific Heights, SF",
    property: "Victorian · 4 bed · 3.5 bath",
    lastContact: "2h ago",
    avatar: "AH",
    notes: "Pre-approved. Wants south-facing garden.",
    rating: 5,
  },
  {
    id: "C-002",
    name: "Marcus Okafor",
    email: "m.okafor@okaforcap.com",
    phone: "+1 (212) 555-0198",
    type: "investor",
    stage: "viewing",
    budget: 8_200_000,
    location: "Tribeca, NYC",
    property: "Loft portfolio · 3 units",
    lastContact: "Yesterday",
    avatar: "MO",
    notes: "Cash buyer. Prefers off-market deals.",
    rating: 5,
  },
  {
    id: "C-003",
    name: "Sofia Lindqvist",
    email: "sofia.l@nordic.se",
    phone: "+46 70 555 0193",
    type: "buyer",
    stage: "closing",
    budget: 1_180_000,
    location: "Mission District, SF",
    property: "Modern condo · 2 bed · 2 bath",
    lastContact: "5h ago",
    avatar: "SL",
    notes: "Closing scheduled May 14.",
    rating: 4,
  },
  {
    id: "C-004",
    name: "David Chen",
    email: "d.chen@chenholdings.com",
    phone: "+1 (650) 555-0167",
    type: "seller",
    stage: "lead",
    budget: 3_750_000,
    location: "Atherton, CA",
    property: "Estate · 6 bed · 5 bath",
    lastContact: "3 days ago",
    avatar: "DC",
    notes: "Wants market analysis before listing.",
    rating: 4,
  },
  {
    id: "C-005",
    name: "Isabella Romano",
    email: "isabella@romano.it",
    phone: "+39 333 555 0184",
    type: "renter",
    stage: "viewing",
    budget: 12_000,
    location: "Nob Hill, SF",
    property: "Furnished penthouse · 12mo",
    lastContact: "1h ago",
    avatar: "IR",
    notes: "Relocating from Milan. Move-in June 1.",
    rating: 5,
  },
  {
    id: "C-006",
    name: "James Whitmore",
    email: "j.whitmore@whitmore.co",
    phone: "+44 20 7555 0123",
    type: "buyer",
    stage: "lead",
    budget: 5_600_000,
    location: "Belgravia, London",
    property: "Townhouse · 5 bed",
    lastContact: "Today",
    avatar: "JW",
    notes: "Referred by Hartwood family.",
    rating: 4,
  },
  {
    id: "C-007",
    name: "Priya Raman",
    email: "priya@ramantech.io",
    phone: "+1 (408) 555-0156",
    type: "buyer",
    stage: "negotiating",
    budget: 1_950_000,
    location: "Palo Alto, CA",
    property: "Eichler · 3 bed · 2 bath",
    lastContact: "4h ago",
    avatar: "PR",
    notes: "Counter-offer pending.",
    rating: 5,
  },
  {
    id: "C-008",
    name: "Hugo Bertrand",
    email: "hugo@bertrand.fr",
    phone: "+33 6 12 55 0193",
    type: "seller",
    stage: "closed",
    budget: 4_300_000,
    location: "Le Marais, Paris",
    property: "Haussmann apt · 4 bed",
    lastContact: "1 week ago",
    avatar: "HB",
    notes: "Closed Apr 22. Possible future listings.",
    rating: 5,
  },
];

export const stats = {
  totalClients: 142,
  activeListings: 38,
  pendingDeals: 12,
  closedThisMonth: 7,
  pipelineValue: 47_300_000,
  avgDaysToClose: 34,
};

export const activity = [
  { id: 1, who: "Amelia Hartwood", what: "submitted a counter-offer", when: "2h ago", type: "negotiation" },
  { id: 2, who: "Sofia Lindqvist", what: "signed disclosures", when: "5h ago", type: "closing" },
  { id: 3, who: "Marcus Okafor", what: "scheduled viewing for 4 properties", when: "Yesterday", type: "viewing" },
  { id: 4, who: "Priya Raman", what: "requested inspection report", when: "Yesterday", type: "negotiation" },
  { id: 5, who: "Hugo Bertrand", what: "closed sale · €4.3M", when: "1 week ago", type: "closed" },
];
