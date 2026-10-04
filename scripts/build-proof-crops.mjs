// Keep every source pixel unchanged; SVG viewBoxes clip only the irrelevant UI.
import fs from "node:fs";
const root = new URL("../public/images/", import.meta.url);
const crops = [
  ["youtube-short-clean", "youtube-short-source", 980, 836, 280, 108, 700, 225],
  [
    "youtube-channel-clean",
    "youtube-channel-source",
    1648,
    1080,
    240,
    279,
    1190,
    690,
  ],
  [
    "youtube-channel-avatar",
    "youtube-channel-source",
    1648,
    1080,
    630,
    280,
    420,
    365,
  ],
  [
    "youtube-short-avatar",
    "youtube-short-source",
    980,
    836,
    281,
    198,
    624,
    127,
  ],
  [
    "instagram-3m-clean",
    "instagram-3m-source",
    1179,
    2556,
    20,
    1090,
    1139,
    1070,
  ],
  [
    "instagram-2m-clean",
    "instagram-2m-source",
    1179,
    2556,
    20,
    1090,
    1139,
    1070,
  ],
  [
    "instagram-1m-clean",
    "instagram-1m-source",
    1179,
    2556,
    20,
    1090,
    1139,
    1070,
  ],
  [
    "instagram-engagement-clean",
    "instagram-engagement-source",
    1179,
    2556,
    20,
    475,
    1139,
    775,
  ],
  [
    "instagram-retention-clean",
    "instagram-retention",
    830,
    1800,
    0,
    332,
    830,
    1468,
  ],
];
for (const [
  out,
  input,
  originalWidth,
  originalHeight,
  x,
  y,
  width,
  height,
] of crops) {
  const bytes = fs
    .readFileSync(new URL(`${input}.webp`, root))
    .toString("base64");
  fs.writeFileSync(
    new URL(`${out}.svg`, root),
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${x} ${y} ${width} ${height}"><image width="${originalWidth}" height="${originalHeight}" href="data:image/webp;base64,${bytes}"/></svg>`,
  );
}
console.log(
  `Prepared ${crops.length} stats-only crops without changing the source figures.`,
);
