import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Simulated MLS feed. Swap this for a real RESO Web API call later.
type FeedListing = {
  mls_id: string;
  address: string;
  city: string;
  type: string;
  beds: number;
  baths: number;
  sqft: number;
  price: number;
  status: "active" | "pending" | "under-offer" | "sold" | "withdrawn";
};

const today = () =>
  new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });

// Deterministic "feed" with small randomized price/status drift on each call,
// so users see the sync actually do something.
function buildFeed(): FeedListing[] {
  const base: FeedListing[] = [
    { mls_id: "MLS-44120", address: "210 Steiner St", city: "Alamo Square, SF", type: "Victorian", beds: 4, baths: 3, sqft: 2800, price: 2_650_000, status: "active" },
    { mls_id: "MLS-44121", address: "88 King St · #1402", city: "South Beach, SF", type: "High-Rise Condo", beds: 2, baths: 2, sqft: 1320, price: 1_495_000, status: "active" },
    { mls_id: "MLS-44122", address: "47 Perry St", city: "West Village, NYC", type: "Brownstone", beds: 5, baths: 4, sqft: 4100, price: 8_900_000, status: "active" },
    { mls_id: "MLS-44123", address: "1500 Mission Bay Blvd", city: "Mission Bay, SF", type: "Modern Condo", beds: 3, baths: 2, sqft: 1680, price: 2_100_000, status: "pending" },
    { mls_id: "MLS-44124", address: "9 Alta Mesa Cir", city: "Atherton, CA", type: "Estate", beds: 7, baths: 6, sqft: 8400, price: 14_200_000, status: "active" },
    { mls_id: "MLS-44125", address: "330 Townsend St · #210", city: "SoMa, SF", type: "Loft", beds: 1, baths: 1, sqft: 940, price: 925_000, status: "under-offer" },
  ];
  const statuses: FeedListing["status"][] = ["active", "active", "active", "pending", "under-offer"];
  return base.map((l) => {
    const drift = 1 + (Math.random() * 0.06 - 0.03); // ±3%
    return {
      ...l,
      price: Math.round((l.price * drift) / 1000) * 1000,
      status: Math.random() < 0.25 ? statuses[Math.floor(Math.random() * statuses.length)] : l.status,
    };
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const feed = buildFeed();

    const { data: existing, error: fetchErr } = await supabase
      .from("properties")
      .select("id, mls_id, price, status")
      .not("mls_id", "is", null);
    if (fetchErr) throw fetchErr;

    const byMls = new Map((existing ?? []).map((p: any) => [p.mls_id, p]));
    let added = 0;
    let priceChanges = 0;
    let statusChanges = 0;
    const activityRows: any[] = [];
    const now = new Date().toISOString();

    for (const l of feed) {
      const prev = byMls.get(l.mls_id);
      if (!prev) {
        const newId = `P-${String(Date.now()).slice(-5)}-${Math.floor(Math.random() * 99)}`;
        const { error } = await supabase.from("properties").insert({
          id: newId,
          mls_id: l.mls_id,
          address: l.address,
          city: l.city,
          type: l.type,
          beds: l.beds,
          baths: l.baths,
          sqft: l.sqft,
          price: l.price,
          status: l.status,
          listed_date: today(),
          last_synced_at: now,
        });
        if (!error) {
          added++;
          activityRows.push({
            type: "mls-sync",
            title: `New MLS listing · ${l.address}`,
            description: `${l.type} · ${l.beds}bd / ${l.baths}ba · $${l.price.toLocaleString()}`,
            property_id: newId,
          });
        }
        continue;
      }

      const updates: Record<string, any> = { last_synced_at: now };
      const notes: string[] = [];
      if (Number(prev.price) !== l.price) {
        updates.price = l.price;
        const delta = l.price - Number(prev.price);
        notes.push(
          `Price ${delta > 0 ? "↑" : "↓"} $${Math.abs(delta).toLocaleString()} → $${l.price.toLocaleString()}`
        );
        priceChanges++;
      }
      if (prev.status !== l.status) {
        updates.status = l.status;
        notes.push(`Status: ${prev.status} → ${l.status}`);
        statusChanges++;
      }

      await supabase.from("properties").update(updates).eq("id", prev.id);

      if (notes.length) {
        activityRows.push({
          type: "mls-sync",
          title: `MLS update · ${l.address}`,
          description: notes.join(" · "),
          property_id: prev.id,
        });
      }
    }

    if (activityRows.length) {
      await supabase.from("activities").insert(activityRows);
    }

    return new Response(
      JSON.stringify({
        ok: true,
        synced: feed.length,
        added,
        priceChanges,
        statusChanges,
        syncedAt: now,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("mls-sync error", e);
    return new Response(
      JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
