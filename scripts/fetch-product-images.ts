/**
 * Resolves real product photography for the catalog and stores it locally.
 *
 * Images are sourced from Wikimedia Commons (freely licensed) through its public
 * search API, filtered for photographic bitmaps, and written to
 * `public/products/<productId>-<n>.jpg` so the storefront never depends on a
 * third-party CDN at runtime. Attribution for every downloaded image is written
 * to `scripts/data/image-credits.json`.
 *
 * Usage:  bun run scripts/fetch-product-images.ts [--force]
 */
import { mkdir, writeFile, access, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import { catalogProducts } from "./data/catalog";

const OUT_DIR = path.join(process.cwd(), "public", "products");
const MANIFEST_PATH = path.join(process.cwd(), "scripts", "data", "product-images.json");
const CREDITS_PATH = path.join(process.cwd(), "scripts", "data", "image-credits.json");
const CACHE_PATH = path.join(process.cwd(), "scripts", "data", "commons-cache.json");
const IMAGES_PER_PRODUCT = 3;
const USER_AGENT = "NextjsEstoreSeed/1.0 (storefront content tooling; contact: dev@example.com)";

type CommonsImage = {
  title: string;
  thumbUrl: string;
  sourceUrl: string;
  license: string;
  artist: string;
  width: number;
  height: number;
  mime: string;
};

type ResolvedImage = {
  path: string;
  title: string;
  license: string;
  artist: string;
  sourceUrl: string;
};

const BLOCKED_TITLE_PATTERNS = [
  "logo", "screenshot", "diagram", "chart", "graph", "map of", "icon",
  "infographic", "poster", "brochure", "manual", "advertisement", "flyer",
  "menu", "price tag", "clip art", "clipart", "vector", "icon set",
  "drawing of", "painting", "engraving", "stamp", "coin", "banknote",
  "cover of", "title page", "plaque", "statue",
];

const CATEGORY_FALLBACK_QUERIES: Record<string, string[]> = {
  audio: ["headphones", "wireless earbuds", "bluetooth speaker"],
  computers: ["computer mouse", "mechanical keyboard", "computer monitor", "usb hub", "external ssd"],
  smartphones: ["smartphone", "smartwatch", "fitness tracker"],
  "home-kitchen": ["espresso machine", "air fryer", "vacuum cleaner", "cookware pot", "smart light bulb"],
  fashion: ["running shoes", "jeans", "sunglasses", "jacket", "backpack"],
  sports: ["yoga mat", "dumbbells", "hiking backpack", "camping tent", "water bottle"],
  beauty: ["hair dryer", "electric toothbrush", "face cream", "serum bottle", "electric shaver"],
  books: ["programming book", "software engineering book", "self help book"],
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function stripHtml(value: string | undefined): string {
  if (!value) return "";
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function readJsonCache<T>(filePath: string): Promise<Record<string, T>> {
  try {
    return JSON.parse(await readFile(filePath, "utf8")) as Record<string, T>;
  } catch {
    return {};
  }
}

let searchCache: Record<string, CommonsImage[]> = {};
let cacheDirty = false;

async function fetchJson(url: string, attempts = 4): Promise<any> {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
        signal: AbortSignal.timeout(40_000),
      });
      if (response.status === 429) {
        const wait = 3000 * (attempt + 1) + Math.random() * 1500;
        console.warn(`  … rate limited, waiting ${Math.round(wait / 1000)}s`);
        await sleep(wait);
        lastError = new Error("429 Too Many Requests");
        continue;
      }
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      lastError = error as Error;
      await sleep(1200 * (attempt + 1));
    }
  }
  throw lastError ?? new Error("request failed");
}

async function searchCommons(query: string): Promise<CommonsImage[]> {
  if (searchCache[query]) return searchCache[query];

  const params = new URLSearchParams({
    action: "query",
    format: "json",
    generator: "search",
    gsrnamespace: "6",
    gsrsearch: `${query} filetype:bitmap`,
    gsrlimit: "20",
    prop: "imageinfo",
    iiprop: "url|size|mime|extmetadata",
    iiurlwidth: "1600",
  });

  const payload = await fetchJson(`https://commons.wikimedia.org/w/api.php?${params}`);

  const pages: Record<
    string,
    {
      title: string;
      imageinfo?: Array<{
        thumburl?: string;
        url: string;
        descriptionurl?: string;
        width: number;
        height: number;
        mime: string;
        extmetadata?: Record<string, { value?: string }>;
      }>;
    }
  > = payload?.query?.pages ?? {};

  const images: CommonsImage[] = [];
  for (const page of Object.values(pages)) {
    const info = page.imageinfo?.[0];
    if (!info) continue;
    if (!/^image\/(jpeg|png)$/.test(info.mime)) continue;
    if (info.width < 800) continue;
    const ratio = info.width / info.height;
    if (ratio < 0.4 || ratio > 3) continue;
    const title = page.title.replace(/^File:/i, "");
    const lower = title.toLowerCase();
    if (BLOCKED_TITLE_PATTERNS.some((blocked) => lower.includes(blocked))) continue;

    images.push({
      title,
      thumbUrl: info.thumburl ?? info.url,
      sourceUrl: info.descriptionurl ?? "",
      license: stripHtml(info.extmetadata?.LicenseShortName?.value) || "see source",
      artist: stripHtml(info.extmetadata?.Artist?.value) || "unknown",
      width: info.width,
      height: info.height,
      mime: info.mime,
    });
  }

  searchCache[query] = images;
  cacheDirty = true;
  await sleep(900 + Math.random() * 500);
  return images;
}

async function downloadImage(url: string, destination: string): Promise<boolean> {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { "User-Agent": USER_AGENT },
        signal: AbortSignal.timeout(90_000),
      });
      if (response.status === 429) {
        await sleep(4000 * (attempt + 1));
        continue;
      }
      if (!response.ok) return false;
      const buffer = Buffer.from(await response.arrayBuffer());
      if (buffer.byteLength < 12_000) return false;
      const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8;
      const isPng = buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
      if (!isJpeg && !isPng) return false;
      await writeFile(destination, buffer);
      return true;
    } catch {
      await sleep(1500 * (attempt + 1));
    }
  }
  return false;
}

function scoreImage(image: CommonsImage, queries: string[]): number {
  const title = image.title.toLowerCase();
  let score = 0;
  queries.forEach((query, index) => {
    const terms = query.toLowerCase().split(/\s+/).filter((term) => term.length > 2);
    const matches = terms.filter((term) => title.includes(term)).length;
    if (matches > 0) score += matches * 10 - index;
  });
  if (image.width >= 1200 && image.width <= 4000) score += 2;
  if (image.height > image.width) score -= 1;
  return score;
}

async function resolveForProduct(productId: string, queries: string[], force: boolean): Promise<ResolvedImage[]> {
  // Always resolve candidates so attribution can be recorded, then download only
  // the files that are missing.
  const candidates: CommonsImage[] = [];

  for (const query of queries) {
    if (candidates.length >= IMAGES_PER_PRODUCT * 3) break;
    let images: CommonsImage[] = [];
    try {
      images = await searchCommons(query);
    } catch (error) {
      console.warn(`  ! search failed for "${query}": ${(error as Error).message}`);
      continue;
    }
    if (images.length === 0) continue;
    const ranked = images
      .map((image) => ({ image, score: scoreImage(image, queries) }))
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.image);
    for (const image of ranked) {
      if (image.thumbUrl && !candidates.some((existing) => existing.thumbUrl === image.thumbUrl)) {
        candidates.push(image);
      }
    }
  }

  const selected: ResolvedImage[] = [];
  for (const image of candidates) {
    if (selected.length >= IMAGES_PER_PRODUCT) break;
    const index = selected.length + 1;
    const relativePath = `/products/${productId}-${index}.jpg`;
    const destination = path.join(OUT_DIR, `${productId}-${index}.jpg`);
    const exists = await fileExists(destination);
    if (!exists || force) {
      const ok = await downloadImage(image.thumbUrl, destination);
      if (!ok) continue;
      await sleep(200);
    }
    selected.push({
      path: relativePath,
      title: image.title,
      license: image.license,
      artist: image.artist,
      sourceUrl: image.sourceUrl,
    });
  }

  return selected;
}

async function main() {
  const force = process.argv.includes("--force");
  await mkdir(OUT_DIR, { recursive: true });
  await mkdir(path.dirname(MANIFEST_PATH), { recursive: true });
  searchCache = await readJsonCache<CommonsImage[]>(CACHE_PATH);

  const manifest: Record<string, string[]> = {};
  const credits: Record<string, { title: string; license: string; artist: string; sourceUrl: string }> = {};
  let weak = 0;

  for (const [index, product] of catalogProducts.entries()) {
    const fallback = CATEGORY_FALLBACK_QUERIES[product.categoryId] ?? [];
    const resolved = await resolveForProduct(product.id, [...product.imageQueries, ...fallback], force);
    const images = resolved.map((image) => image.path);

    if (images.length < 2) {
      const sibling = catalogProducts
        .slice(0, index)
        .find((candidate) => candidate.categoryId === product.categoryId && manifest[candidate.id]?.length);
      const siblingImages = sibling ? manifest[sibling.id] : undefined;
      if (siblingImages?.length) {
        for (const image of siblingImages) {
          if (images.length >= IMAGES_PER_PRODUCT) break;
          if (!images.includes(image)) images.push(image);
        }
      }
      weak += 1;
      console.warn(`  ~ ${product.id}: only ${images.length} image(s) resolved`);
    }

    manifest[product.id] = images;
    for (const image of resolved) {
      if (images.includes(image.path)) {
        credits[image.path] = {
          title: image.title,
          license: image.license,
          artist: image.artist,
          sourceUrl: image.sourceUrl,
        };
      }
    }

    console.log(`[${index + 1}/${catalogProducts.length}] ${product.id} -> ${images.length} image(s)`);

    if (cacheDirty) {
      await writeFile(CACHE_PATH, JSON.stringify(searchCache, null, 2) + "\n", "utf8");
      cacheDirty = false;
    }
  }

  await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n", "utf8");
  await writeFile(CREDITS_PATH, JSON.stringify(credits, null, 2) + "\n", "utf8");
  console.log(`\nWrote ${Object.keys(manifest).length} manifest entries and ${Object.keys(credits).length} credits.`);
  if (weak > 0) console.log(`Note: ${weak} product(s) needed fallbacks`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
