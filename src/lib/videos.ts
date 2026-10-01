export type LongVideo = { id: string; title: string; shortTitle: string };
export type ShortVideo = { id: string; title: string; shortTitle: string; views: string };

// Public long-form videos from Rakshit Jain's own YouTube channel.
export const longVideos: LongVideo[] = [
  { id: "FQaeje7tR4Q", title: "I Bought A Cheap Laptop From Chor Bazaar… BIG SCAM!", shortTitle: "The Chor Bazaar laptop" },
  { id: "wfYEneT8FEM", title: "I Tested Cheapest Gaming Gadgets From Gaffar Market — Scam or Legit?", shortTitle: "Gaffar Market gadgets" },
  { id: "TDrqort1eUM", title: "Can A ₹99 CPU Run Minecraft?", shortTitle: "The ₹99 CPU test" },
  { id: "LNLdDROF-Z0", title: "I Built the CHEAPEST Gaming Setup Possible", shortTitle: "The cheapest gaming setup" },
  { id: "mw9m2QCiwdA", title: "I Challenged Non-Gaming YouTubers For a Gaming Match", shortTitle: "The creator gaming match" },
  { id: "8u7DpHDqhSI", title: "I Tried Gaming In EVERY Bus Seat", shortTitle: "Gaming in every bus seat" },
];

// Selected from the channel's public Popular Shorts list on 2 October 2026.
// These rounded view counts are snapshots, not live counters.
export const shortVideos: ShortVideo[] = [
  { id: "aIoVDZAW85w", title: "I Played Minecraft on the World's Cheapest Laptop (₹400)", shortTitle: "Minecraft on a ₹400 laptop", views: "19M" },
  { id: "JwkTl4vUG8w", title: "Thank You for Letting Me Achieve My Dreams!", shortTitle: "A dream, made real", views: "16M" },
  { id: "r-wAO7PDjJQ", title: "I Played Minecraft on Amazon's Cheapest Phone", shortTitle: "Amazon's cheapest phone", views: "13M" },
  { id: "_PaNmz3GGR0", title: "I Made Lava and Water Touch Each Other (Without Mods)", shortTitle: "Lava meets water", views: "11M" },
  { id: "MA57PwobhGE", title: "I Tried Underrated Gaming Cafes", shortTitle: "Underrated gaming cafes", views: "10M" },
  { id: "EsAf8BOaQ-k", title: "I Played Minecraft on the World's Cheapest Gaming PC", shortTitle: "The cheapest gaming PC", views: "8.9M" },
];
