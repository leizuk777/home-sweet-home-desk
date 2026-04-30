export type PropertyStatus = "active" | "pending" | "under-offer" | "sold" | "withdrawn";

export interface Property {
  id: string;
  clientId: string;
  address: string;
  city: string;
  type: string; // e.g. "Condo", "Townhouse"
  beds: number;
  baths: number;
  sqft: number;
  price: number;
  status: PropertyStatus;
  listedDate: string;
  image?: string;
}

export const propertyStatusMeta: Record<
  PropertyStatus,
  { label: string; className: string }
> = {
  active: { label: "Active", className: "bg-success/10 text-success border-success/20" },
  pending: { label: "Pending", className: "bg-warning/10 text-warning border-warning/20" },
  "under-offer": { label: "Under Offer", className: "bg-gold/10 text-gold border-gold/30" },
  sold: { label: "Sold", className: "bg-muted text-muted-foreground border-border" },
  withdrawn: { label: "Withdrawn", className: "bg-destructive/10 text-destructive border-destructive/20" },
};

export const properties: Property[] = [
  {
    id: "P-1001",
    clientId: "C-001",
    address: "1428 Broadway Ave",
    city: "Pacific Heights, SF",
    type: "Victorian",
    beds: 4,
    baths: 3.5,
    sqft: 3200,
    price: 2_450_000,
    status: "under-offer",
    listedDate: "Mar 12, 2026",
  },
  {
    id: "P-1002",
    clientId: "C-001",
    address: "78 Lyon St",
    city: "Pacific Heights, SF",
    type: "Edwardian",
    beds: 3,
    baths: 2,
    sqft: 2400,
    price: 1_980_000,
    status: "active",
    listedDate: "Apr 02, 2026",
  },
  {
    id: "P-1003",
    clientId: "C-002",
    address: "12 Greenwich St · Unit 4B",
    city: "Tribeca, NYC",
    type: "Loft",
    beds: 2,
    baths: 2,
    sqft: 1850,
    price: 3_100_000,
    status: "active",
    listedDate: "Feb 22, 2026",
  },
  {
    id: "P-1004",
    clientId: "C-002",
    address: "12 Greenwich St · Unit 5A",
    city: "Tribeca, NYC",
    type: "Loft",
    beds: 3,
    baths: 2,
    sqft: 2200,
    price: 4_200_000,
    status: "pending",
    listedDate: "Feb 22, 2026",
  },
  {
    id: "P-1005",
    clientId: "C-003",
    address: "555 Valencia St · #602",
    city: "Mission District, SF",
    type: "Modern Condo",
    beds: 2,
    baths: 2,
    sqft: 1180,
    price: 1_180_000,
    status: "pending",
    listedDate: "Jan 18, 2026",
  },
  {
    id: "P-1006",
    clientId: "C-004",
    address: "32 Tuscaloosa Rd",
    city: "Atherton, CA",
    type: "Estate",
    beds: 6,
    baths: 5,
    sqft: 7800,
    price: 12_500_000,
    status: "active",
    listedDate: "Apr 15, 2026",
  },
  {
    id: "P-1007",
    clientId: "C-007",
    address: "240 Greenmeadow Way",
    city: "Palo Alto, CA",
    type: "Eichler",
    beds: 3,
    baths: 2,
    sqft: 1950,
    price: 1_950_000,
    status: "under-offer",
    listedDate: "Mar 28, 2026",
  },
  {
    id: "P-1008",
    clientId: "C-008",
    address: "14 Rue des Rosiers",
    city: "Le Marais, Paris",
    type: "Haussmann Apt",
    beds: 4,
    baths: 2,
    sqft: 2100,
    price: 4_300_000,
    status: "sold",
    listedDate: "Nov 04, 2025",
  },
];
