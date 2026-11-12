/**
 * Authentic storefront catalog data.
 *
 * Real products, real market pricing (USD), and accurate merchandising copy.
 * Images are resolved locally (see scripts/fetch-product-images.ts) so the
 * storefront never depends on third-party CDNs at runtime.
 */

export type CatalogCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
};

export type CatalogProduct = {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  brand: string;
  price: number;
  discountPrice?: number;
  stock: number;
  /** Full marketing description used on the product page. */
  description: string;
  /** Short summary used in cards and meta descriptions. */
  summary: string;
  features: string[];
  specs: { label: string; value: string }[];
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  /** Search phrases used to resolve product photography, most specific first. */
  imageQueries: string[];
};

export const catalogCategories: CatalogCategory[] = [
  {
    id: "audio",
    name: "Audio",
    slug: "audio",
    description:
      "Headphones, earbuds and speakers tuned for everyday listening, calls and travel.",
  },
  {
    id: "computers",
    name: "Computers & Accessories",
    slug: "computers-accessories",
    description:
      "Desk upgrades, peripherals and storage built for focused work and play.",
  },
  {
    id: "smartphones",
    name: "Phones & Wearables",
    slug: "phones-wearables",
    description:
      "Flagship phones, smartwatches and trackers that keep you connected.",
  },
  {
    id: "home-kitchen",
    name: "Home & Kitchen",
    slug: "home-kitchen",
    description:
      "Kitchen workhorses and home essentials chosen for daily reliability.",
  },
  {
    id: "fashion",
    name: "Fashion",
    slug: "fashion",
    description:
      "Everyday footwear, denim and outerwear from labels people actually wear.",
  },
  {
    id: "sports",
    name: "Sports & Outdoors",
    slug: "sports-outdoors",
    description:
      "Training gear, packs and camp equipment for the gym and the trail.",
  },
  {
    id: "beauty",
    name: "Beauty & Personal Care",
    slug: "beauty-personal-care",
    description:
      "Skincare, grooming tools and haircare that earn their shelf space.",
  },
  {
    id: "books",
    name: "Books",
    slug: "books",
    description:
      "Engineering classics and bestsellers worth reading twice.",
  },
];

export const catalogProducts: CatalogProduct[] = [
  // ─── Audio ────────────────────────────────────────────────────────────────
  {
    id: "sony-wh-1000xm5",
    name: "Sony WH-1000XM5 Wireless Headphones",
    slug: "sony-wh-1000xm5",
    categoryId: "audio",
    brand: "Sony",
    price: 399.99,
    discountPrice: 349.99,
    stock: 42,
    summary:
      "Industry-leading noise cancellation with a 30-hour battery and crystal-clear call quality.",
    description:
      "The WH-1000XM5 pairs Sony's Integrated Processor V1 with eight microphones to cancel engine drone, office chatter and aircraft cabin noise. The 30mm carbon-fibre drivers deliver a wide, detailed soundstage, while the lightweight synthetic-leather headband keeps marathon sessions comfortable. Multipoint pairing keeps you connected to a laptop and phone at the same time, and a 3-minute quick charge adds three hours of playback.",
    features: [
      "Adaptive noise cancellation with 8 microphones",
      "30-hour battery, 3-minute quick charge for 3 hours playback",
      "Multipoint Bluetooth 5.2 with LDAC and Hi-Res Audio Wireless",
      "Speak-to-Chat pauses music automatically when you talk",
      "Foldable design with hard travel case included",
    ],
    specs: [
      { label: "Driver", value: "30 mm carbon fibre composite" },
      { label: "Battery life", value: "Up to 30 hours (ANC on)" },
      { label: "Weight", value: "250 g" },
      { label: "Connectivity", value: "Bluetooth 5.2, 3.5 mm, USB-C" },
      { label: "Codecs", value: "SBC, AAC, LDAC" },
    ],
    seoTitle: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
    seoDescription:
      "Buy the Sony WH-1000XM5 with adaptive noise cancellation, 30-hour battery and LDAC. Free shipping and 2-year warranty.",
    seoKeywords: ["sony wh-1000xm5", "noise cancelling headphones", "wireless headphones", "ldac headphones"],
    imageQueries: ["Sony WH-1000XM5", "Sony WH-1000XM5 headphones", "wireless over-ear headphones"],
  },
  {
    id: "airpods-pro-2",
    name: "Apple AirPods Pro (2nd Generation)",
    slug: "airpods-pro-2",
    categoryId: "audio",
    brand: "Apple",
    price: 249.0,
    discountPrice: 219.0,
    stock: 65,
    summary:
      "Adaptive Audio and a re-engineered fit make these the default earbuds for iPhone owners.",
    description:
      "The second-generation AirPods Pro use the H2 chip to deliver Adaptive Audio that blends transparency and noise cancellation in real time. A redesigned vent system relieves pressure during long calls, and the MagSafe case now includes a U1 speaker for Find My. Up to six hours of listening with a single charge, and 30 hours total with the case.",
    features: [
      "Adaptive Audio with personalised spatial sound",
      "Up to 2x more noise cancellation than the first generation",
      "6 hours listening, 30 hours with the MagSafe case",
      "IP54 sweat and water resistance",
      "Touch control volume adjustment on the stem",
    ],
    specs: [
      { label: "Chip", value: "Apple H2" },
      { label: "Battery life", value: "Up to 6 hours (ANC on)" },
      { label: "Charging", value: "MagSafe, Lightning, Qi" },
      { label: "Water resistance", value: "IP54 (earbuds and case)" },
      { label: "Weight", value: "5.3 g per earbud" },
    ],
    seoTitle: "Apple AirPods Pro 2nd Generation with MagSafe Case",
    seoDescription:
      "Shop AirPods Pro (2nd generation) with Adaptive Audio, H2 chip and 30-hour total battery. Genuine Apple warranty included.",
    seoKeywords: ["airpods pro 2", "apple earbuds", "anc earbuds", "magsafe case"],
    imageQueries: ["AirPods Pro 2", "Apple AirPods Pro", "wireless earbuds case"],
  },
  {
    id: "jbl-flip-6",
    name: "JBL Flip 6 Portable Bluetooth Speaker",
    slug: "jbl-flip-6",
    categoryId: "audio",
    brand: "JBL",
    price: 129.95,
    discountPrice: 99.95,
    stock: 88,
    summary:
      "Punchy 2-way sound in an IP67 body that survives the pool, the beach and the trail.",
    description:
      "The Flip 6 splits its output between a racetrack-shaped woofer and a dedicated tweeter, so vocals stay clear even at volume. JBL's Original Pro Sound tuning keeps bass tight rather than muddy, and the IP67 rating means it keeps playing after a dunk in the pool. Twelve hours of battery covers a full day out, and PartyBoost links two speakers as a stereo pair.",
    features: [
      "2-way driver system with separate tweeter and woofer",
      "IP67 waterproof and dustproof",
      "12 hours of playtime",
      "PartyBoost stereo pairing",
      "USB-C charging, 2.5-hour full charge",
    ],
    specs: [
      { label: "Output", value: "30 W RMS" },
      { label: "Battery life", value: "Up to 12 hours" },
      { label: "Waterproof", value: "IP67" },
      { label: "Bluetooth", value: "5.1" },
      { label: "Weight", value: "550 g" },
    ],
    seoTitle: "JBL Flip 6 Waterproof Bluetooth Speaker",
    seoDescription:
      "JBL Flip 6 portable speaker with 12-hour battery, IP67 waterproofing and PartyBoost. Free two-day shipping.",
    seoKeywords: ["jbl flip 6", "waterproof speaker", "bluetooth speaker", "portable speaker"],
    imageQueries: ["JBL Flip 6", "JBL Flip speaker", "portable bluetooth speaker"],
  },
  {
    id: "sennheiser-hd-560s",
    name: "Sennheiser HD 560S Open-Back Headphones",
    slug: "sennheiser-hd-560s",
    categoryId: "audio",
    brand: "Sennheiser",
    price: 249.95,
    discountPrice: 199.0,
    stock: 31,
    summary:
      "Reference-grade open-back cans for mixing, mastering and critical listening at home.",
    description:
      "The HD 560S is voiced flat from 20 Hz to 20 kHz with a wide, uncoloured soundstage that makes it a favourite for mixing and mastering. The open-back design keeps the presentation airy and fatigue-free over long sessions, while the 120-ohm dynamic drivers stay easy to drive from a laptop or interface. A detachable steel-reinforced cable and velour pads round out the package.",
    features: [
      "Open-back acoustic design for an airy soundstage",
      "Flat 20 Hz - 20 kHz response for reference mixing",
      "120-ohm dynamic drivers, easy to drive",
      "Detachable 3 m cable with 6.35 mm adapter",
      "Replaceable velour ear pads",
    ],
    specs: [
      { label: "Type", value: "Open-back, over-ear" },
      { label: "Impedance", value: "120 ohm" },
      { label: "Frequency response", value: "6 Hz - 38 kHz" },
      { label: "Weight", value: "240 g" },
      { label: "Cable", value: "3 m detachable, 3.5 mm + adapter" },
    ],
    seoTitle: "Sennheiser HD 560S Open-Back Studio Headphones",
    seoDescription:
      "Sennheiser HD 560S reference headphones with flat response, open-back design and detachable cable. Ideal for mixing.",
    seoKeywords: ["sennheiser hd 560s", "open back headphones", "studio headphones", "mixing headphones"],
    imageQueries: ["Sennheiser HD 560S", "Sennheiser HD 560", "open back headphones"],
  },
  {
    id: "soundcore-life-q30",
    name: "Soundcore by Anker Life Q30 Headphones",
    slug: "soundcore-life-q30",
    categoryId: "audio",
    brand: "Anker",
    price: 79.99,
    discountPrice: 59.99,
    stock: 120,
    summary:
      "Budget noise cancellation that punches well above its price, with 40 hours of battery.",
    description:
      "The Life Q30 delivers hybrid noise cancellation, Hi-Res Audio over LDAC and 40 hours of playback for less than a third of the price of flagship models. Memory-foam earcups and a 9.8 oz frame keep it comfortable on long flights, while the companion app offers a custom EQ and three ANC modes for transport, indoor and outdoor use.",
    features: [
      "Hybrid ANC with three selectable modes",
      "40 hours of playback with ANC on",
      "Hi-Res Audio certified with LDAC",
      "Custom EQ through the Soundcore app",
      "USB-C charging with 5-hour quick charge",
    ],
    specs: [
      { label: "Driver", value: "40 mm dynamic" },
      { label: "Battery life", value: "Up to 40 hours" },
      { label: "Codecs", value: "SBC, AAC, LDAC" },
      { label: "Weight", value: "265 g" },
      { label: "Charging", value: "USB-C" },
    ],
    seoTitle: "Soundcore Life Q30 Noise Cancelling Headphones",
    seoDescription:
      "Soundcore Life Q30 with hybrid ANC, 40-hour battery and LDAC Hi-Res audio at an affordable price.",
    seoKeywords: ["soundcore life q30", "budget noise cancelling headphones", "anc headphones", "anker headphones"],
    imageQueries: ["Soundcore Life Q30", "Anker Soundcore headphones", "over ear headphones black"],
  },

  // ─── Computers & Accessories ─────────────────────────────────────────────
  {
    id: "mx-master-3s",
    name: "Logitech MX Master 3S Wireless Mouse",
    slug: "mx-master-3s",
    categoryId: "computers",
    brand: "Logitech",
    price: 99.99,
    discountPrice: 89.99,
    stock: 74,
    summary:
      "Quiet-click productivity mouse with an 8K DPI sensor and flow across three machines.",
    description:
      "The MX Master 3S keeps the sculpted shape that made its predecessor a desk staple, but swaps the loud switches for quiet clicks that are 90% softer. The 8,000 DPI sensor tracks on glass, the electromagnetic scroll wheel adapts between precision and free-spin, and Logitech Flow moves your cursor between up to three computers with a tap. A full charge lasts 70 days; one minute of USB-C charging gives three hours of use.",
    features: [
      "Quiet-click buttons, 90% less click noise",
      "8,000 DPI sensor that tracks on glass",
      "MagSpeed electromagnetic scroll wheel",
      "Multi-device Flow across three computers",
      "70-day battery with USB-C quick charge",
    ],
    specs: [
      { label: "Sensor", value: "Darkfield 8,000 DPI" },
      { label: "Connectivity", value: "Bluetooth Low Energy, Logi Bolt USB receiver" },
      { label: "Battery life", value: "Up to 70 days" },
      { label: "Buttons", value: "7 programmable" },
      { label: "Weight", value: "141 g" },
    ],
    seoTitle: "Logitech MX Master 3S Wireless Mouse",
    seoDescription:
      "Logitech MX Master 3S with quiet clicks, 8K DPI sensor and multi-device Flow. Free shipping and 1-year warranty.",
    seoKeywords: ["mx master 3s", "logitech mouse", "wireless mouse", "productivity mouse"],
    imageQueries: ["Logitech MX Master 3S", "Logitech MX Master 3", "wireless mouse product"],
  },
  {
    id: "keychron-k2",
    name: "Keychron K2 Wireless Mechanical Keyboard",
    slug: "keychron-k2",
    categoryId: "computers",
    brand: "Keychron",
    price: 89.99,
    discountPrice: 74.99,
    stock: 56,
    summary:
      "75% hot-swappable board with Mac and Windows layouts and four days of battery.",
    description:
      "The K2 packs a 75% layout into an aluminium frame that feels far more expensive than it costs. Gateron switches are hot-swappable, so you can change feel without soldering, and the double-shot keycaps resist shine. Bluetooth 5.1 pairs with three devices, while the 4,000 mAh battery runs for days with the backlight off and roughly a week with it on.",
    features: [
      "75% compact layout with dedicated function row",
      "Hot-swappable Gateron switches",
      "Bluetooth 5.1 for three devices plus USB-C",
      "4,000 mAh battery, up to 7 days with backlight",
      "Mac and Windows keycaps included",
    ],
    specs: [
      { label: "Layout", value: "75% (84 keys)" },
      { label: "Switches", value: "Gateron G Pro (hot-swappable)" },
      { label: "Connectivity", value: "Bluetooth 5.1, USB-C" },
      { label: "Battery", value: "4,000 mAh" },
      { label: "Frame", value: "Anodised aluminium" },
    ],
    seoTitle: "Keychron K2 Wireless Mechanical Keyboard",
    seoDescription:
      "Keychron K2 hot-swappable mechanical keyboard with Bluetooth, aluminium frame and Mac/Windows support.",
    seoKeywords: ["keychron k2", "mechanical keyboard", "wireless keyboard", "hot swappable keyboard"],
    imageQueries: ["Keychron K2", "Keychron mechanical keyboard", "mechanical keyboard rgb"],
  },
  {
    id: "dell-u2723qe",
    name: 'Dell UltraSharp 27" 4K USB-C Hub Monitor',
    slug: "dell-u2723qe",
    categoryId: "computers",
    brand: "Dell",
    price: 579.99,
    discountPrice: 519.99,
    stock: 18,
    summary:
      "Factory-calibrated 4K IPS Black panel with a built-in 90 W USB-C dock and RJ45.",
    description:
      "The U2723QE uses Dell's IPS Black panel for 2,000:1 contrast and 98% DCI-P3 coverage, calibrated at the factory to Delta E < 2. A single USB-C cable carries video, 90 W of laptop charging, Ethernet and the monitor's USB hub, which cuts desk clutter dramatically. The ComfortView Plus low-blue-light mode stays easy on the eyes through a full workday.",
    features: [
      "27-inch 4K IPS Black panel, 2,000:1 contrast",
      "USB-C hub with 90 W power delivery and RJ45",
      "Factory calibrated to Delta E < 2",
      "Fully adjustable stand with height, tilt, swivel and pivot",
      "Built-in KVM switch for two machines",
    ],
    specs: [
      { label: "Resolution", value: "3840 x 2160 at 60 Hz" },
      { label: "Panel", value: "IPS Black, 450 nits" },
      { label: "Colour", value: "98% DCI-P3, 100% sRGB" },
      { label: "Ports", value: "USB-C (90 W), 4x USB-A, RJ45, HDMI, DP" },
      { label: "VESA", value: "100 x 100 mm" },
    ],
    seoTitle: 'Dell UltraSharp U2723QE 27" 4K USB-C Monitor',
    seoDescription:
      "Dell UltraSharp U2723QE 4K monitor with IPS Black panel, 90 W USB-C dock and RJ45. Includes 3-year warranty.",
    seoKeywords: ["dell u2723qe", "4k monitor", "usb c monitor", "ips black monitor"],
    imageQueries: ["Dell UltraSharp U2723QE", "Dell UltraSharp monitor", "4k computer monitor desk"],
  },
  {
    id: "anker-555-usb-c-hub",
    name: "Anker 555 USB-C Hub (8-in-1)",
    slug: "anker-555-usb-c-hub",
    categoryId: "computers",
    brand: "Anker",
    price: 69.99,
    discountPrice: 54.99,
    stock: 95,
    summary:
      "Eight ports in an aluminium shell: 4K HDMI, 100 W passthrough, SD and Ethernet.",
    description:
      "The Anker 555 turns a single USB-C port into a full desktop: 4K 30 Hz HDMI, three USB-A 5 Gbps ports, USB-C data, SD and microSD readers, gigabit Ethernet and 100 W pass-through charging. The aluminium housing doubles as a heat sink, so sustained transfers stay fast instead of throttling.",
    features: [
      "8-in-1: HDMI, 3x USB-A, USB-C data, SD, microSD, RJ45",
      "100 W USB-C Power Delivery passthrough",
      "4K 30 Hz HDMI output",
      "Gigabit Ethernet port",
      "Anodised aluminium housing",
    ],
    specs: [
      { label: "Ports", value: "8 (see features)" },
      { label: "Power delivery", value: "100 W passthrough" },
      { label: "Video", value: "HDMI 4K @ 30 Hz" },
      { label: "Data", value: "USB 3.0 5 Gbps, SD UHS-I" },
      { label: "Cable", value: "6-inch integrated USB-C" },
    ],
    seoTitle: "Anker 555 USB-C Hub 8-in-1 with 100 W PD",
    seoDescription:
      "Anker 555 USB-C hub with 4K HDMI, 100 W passthrough, SD/microSD and gigabit Ethernet. 18-month warranty.",
    seoKeywords: ["anker 555 hub", "usb c hub", "usb c dock", "8 in 1 hub"],
    imageQueries: ["Anker 555 USB-C hub", "USB-C hub adapter", "usb hub ports closeup"],
  },
  {
    id: "samsung-t7-shield-2tb",
    name: "Samsung T7 Shield 2TB Portable SSD",
    slug: "samsung-t7-shield-2tb",
    categoryId: "computers",
    brand: "Samsung",
    price: 189.99,
    discountPrice: 159.99,
    stock: 63,
    summary:
      "1,050 MB/s USB 3.2 drive with a rubberised shell rated IP65 against dust and water.",
    description:
      "The T7 Shield moves 1,050 MB/s over USB 3.2 Gen 2, enough to cut a 4K timeline transfer from minutes to seconds. A textured rubber shell absorbs drops up to three metres and carries an IP65 rating, and the drive runs cool enough to avoid thermal throttling on long writes. Hardware AES-256 encryption protects the data if the drive goes missing.",
    features: [
      "1,050 MB/s read, 1,000 MB/s write over USB 3.2 Gen 2",
      "IP65 dust and water resistance",
      "Drop resistant up to 3 metres",
      "AES-256 hardware encryption",
      "Includes USB-C to C and USB-C to A cables",
    ],
    specs: [
      { label: "Capacity", value: "2 TB" },
      { label: "Interface", value: "USB 3.2 Gen 2 (10 Gbps)" },
      { label: "Read speed", value: "Up to 1,050 MB/s" },
      { label: "Encryption", value: "AES-256 hardware" },
      { label: "Weight", value: "98 g" },
    ],
    seoTitle: "Samsung T7 Shield 2TB Portable SSD",
    seoDescription:
      "Samsung T7 Shield 2TB portable SSD with 1,050 MB/s, IP65 rating and AES-256 encryption. 3-year warranty.",
    seoKeywords: ["samsung t7 shield", "portable ssd", "2tb ssd", "external ssd"],
    imageQueries: ["Samsung T7 Shield SSD", "portable SSD drive", "external solid state drive"],
  },

  // ─── Phones & Wearables ──────────────────────────────────────────────────
  {
    id: "iphone-15",
    name: "Apple iPhone 15 (128 GB)",
    slug: "iphone-15",
    categoryId: "smartphones",
    brand: "Apple",
    price: 799.0,
    discountPrice: 749.0,
    stock: 37,
    summary:
      "Dynamic Island, a 48 MP main camera and USB-C in Apple's most practical model.",
    description:
      "The iPhone 15 brings the Pro-line Dynamic Island and a 48 MP main sensor down to the base model, with sensor-shifting optical image stabilisation that keeps handheld shots sharp. The A16 Bionic chip handles console-style games and on-device photo processing without breaking a sweat, while the contoured aluminium frame and colour-infused back glass feel more premium than the price suggests. USB-C finally arrives, so one cable charges your phone, laptop and earbuds.",
    features: [
      "6.1-inch Super Retina XDR display with Dynamic Island",
      "48 MP main camera with 2x optical-quality zoom",
      "A16 Bionic chip with 5-core GPU",
      "USB-C with 20 W wired charging and MagSafe 15 W",
      "Ceramic Shield front and colour-infused back glass",
    ],
    specs: [
      { label: "Display", value: '6.1" Super Retina XDR, 2000 nits peak' },
      { label: "Chip", value: "A16 Bionic" },
      { label: "Storage", value: "128 GB" },
      { label: "Camera", value: "48 MP main + 12 MP ultra-wide" },
      { label: "Battery", value: "Up to 20 hours video playback" },
    ],
    seoTitle: "Apple iPhone 15 128 GB Unlocked",
    seoDescription:
      "Buy the iPhone 15 128 GB unlocked with Dynamic Island, 48 MP camera and USB-C. Genuine Apple warranty.",
    seoKeywords: ["iphone 15", "apple iphone", "unlocked iphone", "iphone 15 128gb"],
    imageQueries: ["iPhone 15", "Apple iPhone 15 back", "iphone smartphone product"],
  },
  {
    id: "galaxy-s24",
    name: "Samsung Galaxy S24 (256 GB)",
    slug: "galaxy-s24",
    categoryId: "smartphones",
    brand: "Samsung",
    price: 859.99,
    discountPrice: 749.99,
    stock: 44,
    summary:
      "Galaxy AI, a 120 Hz AMOLED screen and seven years of OS updates in a compact frame.",
    description:
      "The Galaxy S24 pairs a 6.2-inch 120 Hz Dynamic AMOLED 2X display with the Snapdragon 8 Gen 3 for Galaxy, keeping games smooth and thermals in check. Galaxy AI adds live translation on calls, circle-to-search and generative photo editing, and Samsung promises seven generations of OS upgrades plus seven years of security patches. The titanium frame is lighter than it looks and the 4,000 mAh battery comfortably lasts a day.",
    features: [
      '6.2" Dynamic AMOLED 2X, 120 Hz, 2,600 nits peak',
      "Galaxy AI: live translate, circle to search, photo assist",
      "Snapdragon 8 Gen 3 for Galaxy",
      "50 MP main, 12 MP ultra-wide, 10 MP 3x telephoto",
      "7 years of OS and security updates",
    ],
    specs: [
      { label: "Display", value: '6.2" AMOLED 120 Hz, 2,600 nits' },
      { label: "Chipset", value: "Snapdragon 8 Gen 3 for Galaxy" },
      { label: "Storage", value: "256 GB, 8 GB RAM" },
      { label: "Battery", value: "4,000 mAh, 25 W wired" },
      { label: "Durability", value: "IP68, Gorilla Glass Victus 2" },
    ],
    seoTitle: "Samsung Galaxy S24 256 GB Unlocked",
    seoDescription:
      "Samsung Galaxy S24 256 GB with Galaxy AI, 120 Hz AMOLED and seven years of updates. Unlocked and warranty-backed.",
    seoKeywords: ["galaxy s24", "samsung galaxy s24", "galaxy ai phone", "android flagship"],
    imageQueries: ["Samsung Galaxy S24", "Galaxy S24 smartphone", "samsung phone product photo"],
  },
  {
    id: "pixel-8",
    name: "Google Pixel 8 (128 GB)",
    slug: "pixel-8",
    categoryId: "smartphones",
    brand: "Google",
    price: 699.0,
    discountPrice: 599.0,
    stock: 52,
    summary:
      "The best point-and-shoot camera on Android, with seven years of updates.",
    description:
      "Pixel 8 leans on computational photography: Magic Editor rewrites backgrounds, Best Take fixes blinking eyes, and Real Tone renders skin tones accurately across the spectrum. The Tensor G3 chip runs on-device AI for call screening and live captions, and Google's seven-year update promise makes it one of the longest-supported phones you can buy. The 6.2-inch Actua display hits 2,000 nits outdoors, so it stays readable in direct sun.",
    features: [
      "6.2-inch Actua OLED, 120 Hz, 2,000 nits peak",
      "50 MP Octa-Pixel main camera with Magic Editor",
      "Google Tensor G3 with on-device AI",
      "7 years of OS, security and Feature Drop updates",
      "Wireless charging and IP68 water resistance",
    ],
    specs: [
      { label: "Display", value: '6.2" Actua OLED, 120 Hz' },
      { label: "Chipset", value: "Google Tensor G3" },
      { label: "Storage", value: "128 GB, 8 GB RAM" },
      { label: "Battery", value: "4,575 mAh, 27 W wired" },
      { label: "Durability", value: "IP68, Gorilla Glass Victus" },
    ],
    seoTitle: "Google Pixel 8 128 GB Unlocked",
    seoDescription:
      "Google Pixel 8 128 GB with Magic Editor camera, Tensor G3 and seven years of updates. Factory unlocked.",
    seoKeywords: ["pixel 8", "google pixel 8", "android camera phone", "pixel 8 unlocked"],
    imageQueries: ["Google Pixel 8", "Pixel 8 phone back", "google pixel smartphone"],
  },
  {
    id: "apple-watch-series-9",
    name: "Apple Watch Series 9 (45 mm, GPS)",
    slug: "apple-watch-series-9",
    categoryId: "smartphones",
    brand: "Apple",
    price: 399.0,
    discountPrice: 349.0,
    stock: 48,
    summary:
      "Brighter display, double-tap gesture and on-device Siri in the everyday Apple Watch.",
    description:
      "The Series 9's S9 chip makes the display twice as bright as the Series 8 and enables Double Tap, a gesture that pinches your index finger and thumb together to answer calls or stop timers. On-device Siri now processes requests without sending audio to the cloud, so it works on a plane or in a tunnel. Blood oxygen, ECG and temperature sensing stay available, and the always-on Retina display remains legible in bright sun.",
    features: [
      "45 mm always-on Retina display, 2,000 nits peak",
      "Double Tap gesture with S9 SiP",
      "On-device Siri for offline requests",
      "ECG, blood oxygen and temperature sensing",
      "Up to 18 hours battery, 36 hours in low power mode",
    ],
    specs: [
      { label: "Case", value: "45 mm aluminium" },
      { label: "Display", value: "Always-on Retina LTPO OLED, 2,000 nits" },
      { label: "Chip", value: "Apple S9 SiP" },
      { label: "Battery", value: "Up to 18 hours" },
      { label: "Water resistance", value: "50 m (WR50)" },
    ],
    seoTitle: "Apple Watch Series 9 45 mm GPS",
    seoDescription:
      "Apple Watch Series 9 45 mm with Double Tap, brighter display and on-device Siri. Genuine Apple warranty.",
    seoKeywords: ["apple watch series 9", "apple watch", "smartwatch", "watch series 9 gps"],
    imageQueries: ["Apple Watch Series 9", "Apple Watch smartwatch", "smartwatch product photo"],
  },
  {
    id: "fitbit-charge-6",
    name: "Fitbit Charge 6 Fitness Tracker",
    slug: "fitbit-charge-6",
    categoryId: "smartphones",
    brand: "Fitbit",
    price: 159.95,
    discountPrice: 129.95,
    stock: 71,
    summary:
      "Heart-rate accuracy you can trust, built-in GPS and seven days of battery.",
    description:
      "Charge 6 uses an improved optical sensor tuned against chest straps for accurate heart-rate tracking during intervals and steady-state cardio. Built-in GPS maps runs without carrying a phone, Active Zone Minutes nudges you into the right intensity, and the colour touchscreen stays readable outdoors. Seven days of battery means you can wear it overnight for sleep tracking without hunting for a charger.",
    features: [
      "Built-in GPS with run, hike and bike modes",
      "40% more accurate heart-rate tracking",
      "Up to 7 days battery life",
      "Sleep profile and personalised sleep guidance",
      "Google Maps, Wallet and YouTube Music controls",
    ],
    specs: [
      { label: "Display", value: "1.04-inch colour AMOLED touchscreen" },
      { label: "Battery", value: "Up to 7 days" },
      { label: "GPS", value: "Built-in" },
      { label: "Water resistance", value: "5 ATM" },
      { label: "Compatibility", value: "iOS 15+, Android 10+" },
    ],
    seoTitle: "Fitbit Charge 6 Fitness Tracker",
    seoDescription:
      "Fitbit Charge 6 with built-in GPS, accurate heart-rate tracking and 7-day battery. Free shipping.",
    seoKeywords: ["fitbit charge 6", "fitness tracker", "fitbit tracker", "gps tracker"],
    imageQueries: ["Fitbit Charge 6", "Fitbit Charge fitness tracker", "fitness tracker wrist"],
  },

  // ─── Home & Kitchen ──────────────────────────────────────────────────────
  {
    id: "breville-barista-express",
    name: "Breville Barista Express Espresso Machine",
    slug: "breville-barista-express",
    categoryId: "home-kitchen",
    brand: "Breville",
    price: 699.95,
    discountPrice: 599.95,
    stock: 22,
    summary:
      "Built-in conical burr grinder and 54 mm portafilter for café-style espresso at home.",
    description:
      "The Barista Express grinds beans directly into the portafilter, so you go from whole beans to a shot in under a minute. A low-pressure pre-infusion soaks the puck before full pressure, which reduces channeling and gives beginners a far more forgiving extraction. The steam wand is powerful enough for latte-art microfoam, and the integrated PID keeps brew temperature stable shot after shot.",
    features: [
      "Integrated conical burr grinder with 16 grind settings",
      "54 mm stainless steel portafilter with razor dose trimming tool",
      "Low-pressure pre-infusion and PID temperature control",
      "Professional steam wand for microfoam",
      "2 L water tank with volumetric shot control",
    ],
    specs: [
      { label: "Grinder", value: "Conical burr, 16 settings" },
      { label: "Portafilter", value: "54 mm stainless steel" },
      { label: "Pressure", value: "15 bar Italian pump" },
      { label: "Water tank", value: "2 L" },
      { label: "Warranty", value: "2 years limited" },
    ],
    seoTitle: "Breville Barista Express Espresso Machine",
    seoDescription:
      "Breville Barista Express with built-in conical burr grinder, PID control and steam wand. Espresso at home.",
    seoKeywords: ["breville barista express", "espresso machine", "home espresso", "coffee machine grinder"],
    imageQueries: ["Breville Barista Express", "espresso machine portafilter", "espresso machine kitchen"],
  },
  {
    id: "ninja-air-fryer-max-xl",
    name: "Ninja Air Fryer Max XL (6 qt)",
    slug: "ninja-air-fryer-max-xl",
    categoryId: "home-kitchen",
    brand: "Ninja",
    price: 149.99,
    discountPrice: 119.99,
    stock: 84,
    summary:
      "Six-quart basket, 450 °F max heat and four functions in one countertop appliance.",
    description:
      "The Max XL's 6-quart basket fits a whole chicken or two pounds of fries, and the 450 °F ceiling crisps wings and roasted vegetables faster than a 400 °F model. Air fry, roast, bake and reheat modes cover most weeknight cooking, while the nonstick ceramic basket releases food cleanly and goes in the dishwasher. A wide temperature range and 60-minute timer make it forgiving for beginners.",
    features: [
      "6-quart nonstick ceramic basket",
      "Up to 450 °F max temperature",
      "Air fry, roast, bake and reheat functions",
      "Dishwasher-safe basket and crisper plate",
      "60-minute timer with auto shut-off",
    ],
    specs: [
      { label: "Capacity", value: "6 qt / 5.7 L" },
      { label: "Power", value: "1,750 W" },
      { label: "Temperature range", value: "105 °F - 450 °F" },
      { label: "Functions", value: "Air fry, roast, bake, reheat" },
      { label: "Warranty", value: "1 year limited" },
    ],
    seoTitle: "Ninja Air Fryer Max XL 6-Quart",
    seoDescription:
      "Ninja Air Fryer Max XL 6 qt with 450 °F max heat, four cooking functions and dishwasher-safe basket.",
    seoKeywords: ["ninja air fryer max xl", "air fryer", "6 quart air fryer", "air fryer 450"],
    imageQueries: ["Ninja Air Fryer Max XL", "air fryer basket", "air fryer kitchen countertop"],
  },
  {
    id: "dyson-v15-detect",
    name: "Dyson V15 Detect Cordless Vacuum",
    slug: "dyson-v15-detect",
    categoryId: "home-kitchen",
    brand: "Dyson",
    price: 749.99,
    discountPrice: 649.99,
    stock: 15,
    summary:
      "Laser dust detection, 60 minutes of runtime and a HEPA-sealed filtration system.",
    description:
      "A green laser on the cleaner head reveals dust you would normally miss on hard floors, while the piezo sensor counts and sizes particles to adjust suction automatically. The Hyperdymium motor spins up to 125,000 rpm for deep cleaning on carpet, and the five-stage HEPA filtration captures 99.99% of particles down to 0.3 microns. Run time stretches to 60 minutes in eco mode, and the whole unit converts to a handheld for stairs and cars.",
    features: [
      "Laser Slim Fluffy cleaner head reveals fine dust",
      "Piezo sensor with automatic suction adjustment",
      "Up to 60 minutes of run time",
      "HEPA filtration captures 99.99% of particles",
      "Converts to handheld with four included tools",
    ],
    specs: [
      { label: "Motor", value: "Hyperdymium, 125,000 rpm" },
      { label: "Suction", value: "230 AW" },
      { label: "Run time", value: "Up to 60 minutes" },
      { label: "Bin capacity", value: "0.77 L" },
      { label: "Weight", value: "3.0 kg" },
    ],
    seoTitle: "Dyson V15 Detect Cordless Vacuum Cleaner",
    seoDescription:
      "Dyson V15 Detect with laser dust sensing, 60-minute runtime and HEPA filtration. Free delivery and warranty.",
    seoKeywords: ["dyson v15 detect", "cordless vacuum", "dyson vacuum", "laser vacuum"],
    imageQueries: ["Dyson V15 Detect", "Dyson cordless vacuum", "cordless stick vacuum"],
  },
  {
    id: "le-creuset-dutch-oven",
    name: "Le Creuset 5.5 qt Enameled Dutch Oven",
    slug: "le-creuset-dutch-oven",
    categoryId: "home-kitchen",
    brand: "Le Creuset",
    price: 420.0,
    discountPrice: 369.95,
    stock: 19,
    summary:
      "Cast-iron heat retention with a chip-resistant enamel finish, oven-safe to 500 °F.",
    description:
      "Each Dutch oven is cast in a single piece and finished with two coats of enamel, which gives you the heat retention of cast iron without the seasoning ritual. The 5.5-quart size handles a whole chicken, a batch of no-knead bread or a pot of chili for six, and the tight-fitting lid keeps moisture in for braises. The stainless-steel knob and enamel interior are oven-safe to 500 °F, and the light interior makes it easy to see when fond is developing.",
    features: [
      "5.5 qt capacity, 26 cm diameter",
      "Chip-resistant enamel over cast iron",
      "Oven-safe to 500 °F / 260 °C",
      "Compatible with all cooktops including induction",
      "Lifetime limited warranty",
    ],
    specs: [
      { label: "Capacity", value: "5.5 qt / 5.2 L" },
      { label: "Material", value: "Enameled cast iron" },
      { label: "Oven safe", value: "Up to 260 °C / 500 °F" },
      { label: "Weight", value: "5.0 kg" },
      { label: "Dishwasher safe", value: "Yes" },
    ],
    seoTitle: "Le Creuset 5.5 qt Enameled Cast Iron Dutch Oven",
    seoDescription:
      "Le Creuset 5.5 qt Dutch oven in enameled cast iron, oven-safe to 500 °F and induction ready. Lifetime warranty.",
    seoKeywords: ["le creuset dutch oven", "enameled cast iron", "dutch oven 5.5 qt", "braising pot"],
    imageQueries: ["Le Creuset Dutch oven", "enameled cast iron pot", "dutch oven cookware"],
  },
  {
    id: "philips-hue-starter-kit",
    name: "Philips Hue White & Color Starter Kit (3 bulbs)",
    slug: "philips-hue-starter-kit",
    categoryId: "home-kitchen",
    brand: "Philips Hue",
    price: 199.99,
    discountPrice: 169.99,
    stock: 46,
    summary:
      "Three color bulbs, a Hue Bridge and 16 million colours controlled from your phone.",
    description:
      "The starter kit bundles three A19 bulbs and the Hue Bridge, the hub that makes Hue worth owning: schedules, routines and automations run locally without a cloud round-trip. The bulbs cover 16 million colours and white tones from 2,200 K candlelight to 6,500 K daylight, and they work with Alexa, Google Home and Apple Home. The Bridge supports up to 50 lights, so the system grows with you.",
    features: [
      "3x A19 white and color ambiance bulbs",
      "Hue Bridge included for local automation",
      "16 million colours, 2,200 K - 6,500 K white",
      "Works with Alexa, Google Home and Apple Home",
      "Expandable to 50 lights and 12 accessories",
    ],
    specs: [
      { label: "Bulbs", value: "3x A19, 800 lumens each" },
      { label: "Bridge", value: "Zigbee, up to 50 lights" },
      { label: "Colour", value: "16 million colours" },
      { label: "White range", value: "2,200 K - 6,500 K" },
      { label: "Warranty", value: "2 years" },
    ],
    seoTitle: "Philips Hue White & Color Starter Kit",
    seoDescription:
      "Philips Hue White and Color Ambiance starter kit with 3 bulbs and bridge. Works with Alexa, Google and HomeKit.",
    seoKeywords: ["philips hue starter kit", "smart bulb", "hue bridge", "smart lighting"],
    imageQueries: ["Philips Hue starter kit", "smart light bulb box", "smart home lighting bulb"],
  },

  // ─── Fashion ─────────────────────────────────────────────────────────────
  {
    id: "nike-pegasus-41",
    name: "Nike Air Zoom Pegasus 41 Running Shoes",
    slug: "nike-pegasus-41",
    categoryId: "fashion",
    brand: "Nike",
    price: 140.0,
    discountPrice: 119.99,
    stock: 96,
    summary:
      "Daily trainer with dual Air Zoom units and a breathable engineered mesh upper.",
    description:
      "The Pegasus 41 is the workhorse daily trainer: a ReactX foam midsole returns more energy than the foam it replaces, and two Air Zoom units in the forefoot and heel keep the ride responsive on tempo days. The engineered mesh upper breathes well on long runs, and the reinforced heel counter holds the foot without pressure points. It is a neutral shoe that works for most runners on most days.",
    features: [
      "ReactX foam midsole for energy return",
      "Dual Air Zoom units at forefoot and heel",
      "Engineered mesh upper with reinforced midfoot band",
      "Neutral support, 10 mm heel-to-toe drop",
      "Rubber waffle outsole for road traction",
    ],
    specs: [
      { label: "Support", value: "Neutral" },
      { label: "Drop", value: "10 mm" },
      { label: "Weight", value: "283 g (men's 10)" },
      { label: "Surface", value: "Road" },
      { label: "Upper", value: "Engineered mesh" },
    ],
    seoTitle: "Nike Air Zoom Pegasus 41 Running Shoes",
    seoDescription:
      "Nike Pegasus 41 with ReactX foam and dual Air Zoom units. Neutral daily trainer with free returns.",
    seoKeywords: ["nike pegasus 41", "running shoes", "nike running shoes", "daily trainer"],
    imageQueries: ["Nike Pegasus 41", "Nike running shoes", "running shoes product photo"],
  },
  {
    id: "levis-501-original",
    name: "Levi's 501 Original Fit Jeans",
    slug: "levis-501-original",
    categoryId: "fashion",
    brand: "Levi's",
    price: 69.5,
    discountPrice: 54.0,
    stock: 132,
    summary:
      "The original straight-leg jean, cut from 14 oz denim with a button fly.",
    description:
      "The 501 has been in production since 1873 and still uses the same five-pocket layout and button fly that made it a workwear standard. The 14 oz denim is stiff enough to hold its shape and softens with wear, and the straight leg sits at the ankle without stacking. It is the pair you can wear with boots, sneakers or a suit jacket and not think twice.",
    features: [
      "14 oz rigid cotton denim",
      "Original button fly and five-pocket styling",
      "Straight leg with a mid rise",
      "Arcuate stitching at the back pockets",
      "Made with 100% cotton",
    ],
    specs: [
      { label: "Fit", value: "Straight, mid rise" },
      { label: "Fabric", value: "100% cotton, 14 oz" },
      { label: "Closure", value: "Button fly" },
      { label: "Care", value: "Machine wash cold, hang dry" },
      { label: "Origin", value: "Imported" },
    ],
    seoTitle: "Levi's 501 Original Fit Jeans",
    seoDescription:
      "Levi's 501 Original Fit jeans in 14 oz rigid denim with button fly. Free shipping and returns.",
    seoKeywords: ["levis 501", "501 original jeans", "straight leg jeans", "denim jeans"],
    imageQueries: ["Levi's 501 jeans", "Levi's 501 original", "blue jeans product photo"],
  },
  {
    id: "rayban-aviator-classic",
    name: "Ray-Ban Aviator Classic Sunglasses",
    slug: "rayban-aviator-classic",
    categoryId: "fashion",
    brand: "Ray-Ban",
    price: 171.0,
    discountPrice: 149.0,
    stock: 58,
    summary:
      "The teardrop aviator in metal, with G-15 lenses that cut glare without dulling colour.",
    description:
      "The Aviator has been the same silhouette since 1937 because it works: thin metal frames, a double bridge and a teardrop lens that covers the brow line. G-15 lenses absorb 85% of visible light and block 100% of UVA/UVB, keeping colours natural while cutting glare. Adjustable nose pads and temple tips let you dial in the fit, and the frame holds up to daily wear.",
    features: [
      "Lightweight metal frame with double bridge",
      "G-15 lenses absorb 85% of visible light",
      "100% UVA/UVB protection",
      "Adjustable nose pads for a custom fit",
      "Includes case and cleaning cloth",
    ],
    specs: [
      { label: "Lens width", value: "58 mm" },
      { label: "Bridge", value: "14 mm" },
      { label: "Temple length", value: "140 mm" },
      { label: "Lens material", value: "G-15 mineral glass" },
      { label: "Protection", value: "100% UVA/UVB" },
    ],
    seoTitle: "Ray-Ban Aviator Classic Sunglasses",
    seoDescription:
      "Ray-Ban Aviator Classic with G-15 lenses and 100% UV protection. Authentic with case and warranty.",
    seoKeywords: ["ray-ban aviator", "aviator sunglasses", "ray ban classic", "metal sunglasses"],
    imageQueries: ["Ray-Ban Aviator Classic", "aviator sunglasses", "metal sunglasses product"],
  },
  {
    id: "patagonia-nano-puff-jacket",
    name: "Patagonia Men's Nano Puff Jacket",
    slug: "patagonia-nano-puff-jacket",
    categoryId: "fashion",
    brand: "Patagonia",
    price: 239.0,
    discountPrice: 199.0,
    stock: 27,
    summary:
      "Windproof, water-resistant synthetic insulation that packs into its own pocket.",
    description:
      "The Nano Puff uses 60 g of PrimaLoft Gold insulation that keeps you warm when wet and stops wind on exposed ridgelines. The recycled ripstop shell carries a DWR finish for light precipitation, and the whole jacket stuffs into its own chest pocket for travel. It layers cleanly under a shell, and the elasticised cuffs and hem seal out drafts without feeling tight.",
    features: [
      "60 g PrimaLoft Gold Eco insulation",
      "Windproof, water-resistant recycled ripstop shell",
      "Packs into its own chest pocket",
      "Two zippered handwarmer pockets",
      "Fair Trade Certified sewn",
    ],
    specs: [
      { label: "Insulation", value: "60 g PrimaLoft Gold Eco" },
      { label: "Shell", value: "100% recycled polyester ripstop, DWR" },
      { label: "Weight", value: "372 g" },
      { label: "Fit", value: "Regular" },
      { label: "Care", value: "Machine wash cold" },
    ],
    seoTitle: "Patagonia Men's Nano Puff Jacket",
    seoDescription:
      "Patagonia Nano Puff jacket with PrimaLoft Gold insulation, windproof shell and packable design.",
    seoKeywords: ["patagonia nano puff", "puffer jacket", "insulated jacket", "packable jacket"],
    imageQueries: ["Patagonia Nano Puff jacket", "puffer jacket product", "insulated jacket outdoors"],
  },
  {
    id: "herschel-classic-backpack",
    name: "Herschel Supply Classic Backpack (21.5 L)",
    slug: "herschel-classic-backpack",
    categoryId: "fashion",
    brand: "Herschel",
    price: 99.0,
    discountPrice: 79.0,
    stock: 64,
    summary:
      "Padded 15-inch laptop sleeve, signature striped liner and a lifetime warranty.",
    description:
      "The Classic Backpack is the one that made Herschel a commuter staple: a 21.5-litre main compartment, a padded sleeve that fits a 15-inch laptop, and the signature striped fabric liner. The contoured shoulder straps and air-mesh back panel keep it comfortable on a full load, and the magnetic strap closures open one-handed. It carries enough for a day of classes or a carry-on weekend.",
    features: [
      "21.5 L capacity with padded 15-inch laptop sleeve",
      "Signature striped fabric liner",
      "Contoured, padded shoulder straps",
      "Magnetic strap closures",
      "Lifetime warranty",
    ],
    specs: [
      { label: "Capacity", value: "21.5 L" },
      { label: "Laptop fit", value: "Up to 15 inches" },
      { label: "Dimensions", value: "45.7 x 29.2 x 15.2 cm" },
      { label: "Weight", value: "680 g" },
      { label: "Material", value: "Polyester, PVC-free" },
    ],
    seoTitle: "Herschel Classic Backpack 21.5 L",
    seoDescription:
      "Herschel Supply Classic Backpack 21.5 L with padded laptop sleeve and lifetime warranty. Free shipping.",
    seoKeywords: ["herschel classic backpack", "laptop backpack", "backpack 21.5l", "commuter backpack"],
    imageQueries: ["Herschel Classic backpack", "backpack product photo", "laptop backpack"],
  },

  // ─── Sports & Outdoors ───────────────────────────────────────────────────
  {
    id: "manduka-pro-yoga-mat",
    name: "Manduka PRO Yoga Mat (6 mm)",
    slug: "manduka-pro-yoga-mat",
    categoryId: "sports",
    brand: "Manduka",
    price: 138.0,
    discountPrice: 118.0,
    stock: 39,
    summary:
      "Dense 6 mm cushioning with a closed-cell surface that stays grippy through hot classes.",
    description:
      "The PRO mat uses a dense PVC-free base that cushions joints without bottoming out, and the closed-cell surface resists sweat so it does not get slick in a hot room. At 6 mm it is thick enough for kneeling poses and stable enough for standing balances, and the fabric-free top wipes clean with a damp cloth. Manduka backs it with a lifetime guarantee, which is why studios keep buying them.",
    features: [
      "6 mm dense cushioning, 4.7 kg",
      "Closed-cell surface resists moisture and bacteria",
      "Non-slip grip that improves as you warm up",
      "Lifetime guarantee",
      "Available in 71-inch and 85-inch lengths",
    ],
    specs: [
      { label: "Thickness", value: "6 mm" },
      { label: "Dimensions", value: "180 x 66 cm" },
      { label: "Weight", value: "4.7 kg" },
      { label: "Material", value: "PVC-free, closed-cell" },
      { label: "Warranty", value: "Lifetime" },
    ],
    seoTitle: "Manduka PRO Yoga Mat 6 mm",
    seoDescription:
      "Manduka PRO yoga mat with 6 mm dense cushioning and closed-cell grip. Lifetime guarantee.",
    seoKeywords: ["manduka pro mat", "yoga mat", "non slip yoga mat", "6mm yoga mat"],
    imageQueries: ["Manduka PRO yoga mat", "rolled yoga mat", "yoga mat studio"],
  },
  {
    id: "bowflex-selecttech-552",
    name: "Bowflex SelectTech 552 Adjustable Dumbbells",
    slug: "bowflex-selecttech-552",
    categoryId: "sports",
    brand: "Bowflex",
    price: 429.0,
    discountPrice: 349.0,
    stock: 14,
    summary:
      "Replaces 15 pairs of dumbbells, adjusting from 5 to 52.5 lb per hand with a dial.",
    description:
      "The SelectTech 552 replaces fifteen sets of weights with a single dial, so you can move from a 5 lb warm-up to a 52.5 lb press without swapping hardware. The moulded base keeps the plates contained when you set them down, and the handle stays comfortable at every weight. It is the practical choice for a home gym where floor space is the constraint.",
    features: [
      "Adjusts from 5 to 52.5 lb per dumbbell",
      "Replaces 15 pairs of traditional dumbbells",
      "Dial-a-weight mechanism with included base trays",
      "Moulded plates reduce clanging",
      "Two-year warranty on parts",
    ],
    specs: [
      { label: "Weight range", value: "5 - 52.5 lb (2.3 - 23.8 kg) each" },
      { label: "Increments", value: "2.5 lb" },
      { label: "Includes", value: "2 dumbbells and 2 base trays" },
      { label: "Dimensions", value: "43 x 20 x 20 cm per dumbbell" },
      { label: "Warranty", value: "2 years" },
    ],
    seoTitle: "Bowflex SelectTech 552 Adjustable Dumbbells",
    seoDescription:
      "Bowflex SelectTech 552 adjustable dumbbells, 5-52.5 lb each, replacing 15 sets. Free shipping.",
    seoKeywords: ["bowflex selecttech 552", "adjustable dumbbells", "home gym dumbbells", "selecttech"],
    imageQueries: ["Bowflex SelectTech 552", "adjustable dumbbells", "dumbbells home gym"],
  },
  {
    id: "osprey-talon-22",
    name: "Osprey Talon 22 Daypack",
    slug: "osprey-talon-22",
    categoryId: "sports",
    brand: "Osprey",
    price: 150.0,
    discountPrice: 129.95,
    stock: 33,
    summary:
      "22-litre daypack with an integrated BioStretch hipbelt and a lid pocket for quick access.",
    description:
      "The Talon 22 uses Osprey's BioStretch harness and hipbelt to move load onto your hips on longer day hikes, while the AirScape back panel keeps air moving against your shirt. The 22-litre main compartment swallows a shell, lunch and water, and the stretch lid pocket handles a wet jacket. An internal sleeve fits a 2 L reservoir, and the trekking-pole attachment keeps your hands free on scrambles.",
    features: [
      "22 L capacity with stretch mesh lid pocket",
      "BioStretch hipbelt and harness for load transfer",
      "AirScape back panel with spacer mesh",
      "Reservoir sleeve fits up to 2 L",
      "Trekking pole attachment points",
    ],
    specs: [
      { label: "Capacity", value: "22 L" },
      { label: "Weight", value: "1.0 kg" },
      { label: "Torso fit", value: "43 - 51 cm" },
      { label: "Fabric", value: "210D nylon dobby" },
      { label: "Warranty", value: "All Mighty Guarantee" },
    ],
    seoTitle: "Osprey Talon 22 Daypack",
    seoDescription:
      "Osprey Talon 22 daypack with BioStretch hipbelt, 22 L capacity and reservoir sleeve. Lifetime guarantee.",
    seoKeywords: ["osprey talon 22", "daypack", "hiking backpack", "22l backpack"],
    imageQueries: ["Osprey Talon 22", "hiking daypack", "hiking backpack product"],
  },
  {
    id: "coleman-sundome-4",
    name: "Coleman Sundome 4-Person Tent",
    slug: "coleman-sundome-4",
    categoryId: "sports",
    brand: "Coleman",
    price: 89.99,
    discountPrice: 69.99,
    stock: 47,
    summary:
      "WeatherTec 4-person dome that sets up in ten minutes and sleeps four sleeping bags.",
    description:
      "The Sundome's dome geometry sheds wind and rain, and the WeatherTec coating with welded corners keeps the interior dry through a night of steady rain. It sleeps four adults in sleeping bags with a little room for packs, and the large mesh roof vents heat while keeping bugs out. Setup is colour-coded and takes about ten minutes, and the whole tent packs into a carry bag that fits in a car boot.",
    features: [
      "Sleeps four adults in sleeping bags",
      "WeatherTec system with welded corners and inverted seams",
      "Colour-coded poles for a 10-minute setup",
      "Mesh roof for ventilation and stargazing",
      "Includes carry bag and guy lines",
    ],
    specs: [
      { label: "Capacity", value: "4 person" },
      { label: "Floor area", value: "2.7 m x 2.7 m" },
      { label: "Peak height", value: "1.5 m" },
      { label: "Weight", value: "5.3 kg" },
      { label: "Water resistance", value: "1500 mm" },
    ],
    seoTitle: "Coleman Sundome 4-Person Tent",
    seoDescription:
      "Coleman Sundome 4-person tent with WeatherTec waterproofing and 10-minute setup. Free shipping.",
    seoKeywords: ["coleman sundome 4", "4 person tent", "camping tent", "dome tent"],
    imageQueries: ["Coleman Sundome 4 tent", "camping tent outdoors", "dome tent product"],
  },
  {
    id: "hydro-flask-32oz",
    name: "Hydro Flask 32 oz Wide Mouth Bottle",
    slug: "hydro-flask-32oz",
    categoryId: "sports",
    brand: "Hydro Flask",
    price: 54.95,
    discountPrice: 44.95,
    stock: 110,
    summary:
      "TempShield double-wall insulation keeps drinks cold for 24 hours and hot for 12.",
    description:
      "The 32 oz Wide Mouth is the bottle that started the insulated-bottle trend, and TempShield still holds up: 24 hours cold, 12 hours hot, with a powder-coated exterior that does not sweat. The wide mouth takes ice cubes and fits a bottle brush, and the flex cap seals without dripping in a bag. It is dishwasher safe and backed by a lifetime warranty.",
    features: [
      "TempShield insulation: 24 h cold, 12 h hot",
      "18/8 pro-grade stainless steel",
      "Powder-coated, sweat-free exterior",
      "Wide mouth fits ice cubes and bottle brushes",
      "Lifetime warranty, BPA-free",
    ],
    specs: [
      { label: "Capacity", value: "32 oz / 946 ml" },
      { label: "Insulation", value: "TempShield double wall" },
      { label: "Cold retention", value: "24 hours" },
      { label: "Weight", value: "480 g" },
      { label: "Material", value: "18/8 stainless steel" },
    ],
    seoTitle: "Hydro Flask 32 oz Wide Mouth Water Bottle",
    seoDescription:
      "Hydro Flask 32 oz Wide Mouth with TempShield insulation, 24 h cold and lifetime warranty. Free shipping.",
    seoKeywords: ["hydro flask 32 oz", "insulated water bottle", "stainless steel bottle", "wide mouth bottle"],
    imageQueries: ["Hydro Flask 32 oz", "insulated water bottle", "stainless steel water bottle"],
  },

  // ─── Beauty & Personal Care ──────────────────────────────────────────────
  {
    id: "dyson-airwrap-multi-styler",
    name: "Dyson Airwrap Multi-Styler Complete",
    slug: "dyson-airwrap-multi-styler",
    categoryId: "beauty",
    brand: "Dyson",
    price: 599.99,
    discountPrice: 549.99,
    stock: 21,
    summary:
      "Styles hair with airflow instead of extreme heat, with six attachments for every finish.",
    description:
      "The Airwrap uses the Coanda effect to wrap hair around a barrel with airflow, so you get curls and waves without clamping or 200 °C plates. Intelligent heat control measures the air temperature 40 times a second and holds it below 150 °C, which limits heat damage on colour-treated hair. The Complete set includes barrels, smoothing brushes and a flyaway attachment for a salon finish at home.",
    features: [
      "Coanda airflow styling with no extreme heat",
      "Intelligent heat control up to 150 °C",
      "Six attachments: barrels, brushes and flyaway tool",
      "Three airflow speeds and four heat settings",
      "Cool shot to set the style",
    ],
    specs: [
      { label: "Attachments", value: "6 (2 barrels, 2 brushes, dryer, flyaway)" },
      { label: "Max temperature", value: "150 °C" },
      { label: "Power", value: "1,300 W" },
      { label: "Cord", value: "2.6 m" },
      { label: "Warranty", value: "2 years" },
    ],
    seoTitle: "Dyson Airwrap Multi-Styler Complete",
    seoDescription:
      "Dyson Airwrap Multi-Styler Complete with six attachments and heat control below 150 °C. Free delivery.",
    seoKeywords: ["dyson airwrap", "multi styler", "hair styler", "airwrap complete"],
    imageQueries: ["Dyson Airwrap", "hair styling tool", "hair dryer styler product"],
  },
  {
    id: "philips-sonicare-4100",
    name: "Philips Sonicare 4100 Electric Toothbrush",
    slug: "philips-sonicare-4100",
    categoryId: "beauty",
    brand: "Philips",
    price: 49.96,
    discountPrice: 39.99,
    stock: 143,
    summary:
      "Sonic vibration with a pressure sensor and 14-day battery for a better clean.",
    description:
      "The 4100 uses sonic technology to drive fluid between teeth, removing more plaque than a manual brush, while the pressure sensor warns you when you push too hard against the gums. A two-minute SmarterTimer with quadpacer keeps you honest about brushing time, and the 14-day battery means you charge it twice a month. The brush head is replaceable and widely available.",
    features: [
      "Sonic vibration with up to 31,000 brush strokes per minute",
      "Pressure sensor with visible warning",
      "Two-minute SmarterTimer with 30-second quadpacer",
      "Up to 14 days battery life",
      "Includes one brush head and travel case",
    ],
    specs: [
      { label: "Brushing modes", value: "Clean" },
      { label: "Battery", value: "Up to 14 days" },
      { label: "Charging", value: "USB, 24 hours" },
      { label: "Brush head", value: "C1 SimplyClean included" },
      { label: "Warranty", value: "2 years" },
    ],
    seoTitle: "Philips Sonicare 4100 Electric Toothbrush",
    seoDescription:
      "Philips Sonicare 4100 electric toothbrush with pressure sensor, quadpacer and 14-day battery.",
    seoKeywords: ["philips sonicare 4100", "electric toothbrush", "sonic toothbrush", "sonicare"],
    imageQueries: ["Philips Sonicare 4100", "electric toothbrush", "sonic toothbrush product"],
  },
  {
    id: "cerave-moisturizing-cream",
    name: "CeraVe Moisturizing Cream (19 oz)",
    slug: "cerave-moisturizing-cream",
    categoryId: "beauty",
    brand: "CeraVe",
    price: 18.99,
    discountPrice: 15.99,
    stock: 210,
    summary:
      "Ceramide-rich cream with hyaluronic acid for very dry skin, accepted by the National Eczema Association.",
    description:
      "CeraVe's Moisturizing Cream combines three essential ceramides with hyaluronic acid to restore the skin barrier and hold water in. The formula is fragrance-free, non-comedogenic and accepted by the National Eczema Association, which makes it a safe default for sensitive or eczema-prone skin. A 19 oz tub lasts months for full-body use.",
    features: [
      "Three essential ceramides plus hyaluronic acid",
      "Fragrance-free and non-comedogenic",
      "National Eczema Association accepted",
      "Rich, non-greasy texture for face and body",
      "Developed with dermatologists",
    ],
    specs: [
      { label: "Size", value: "19 oz / 539 g" },
      { label: "Skin type", value: "Very dry to dry" },
      { label: "Key ingredients", value: "Ceramides NP, AP, EOP; hyaluronic acid" },
      { label: "Fragrance", value: "None" },
      { label: "Use", value: "Face and body" },
    ],
    seoTitle: "CeraVe Moisturizing Cream 19 oz",
    seoDescription:
      "CeraVe Moisturizing Cream 19 oz with ceramides and hyaluronic acid for very dry skin. Fragrance-free.",
    seoKeywords: ["cerave moisturizing cream", "ceramide cream", "dry skin cream", "eczema cream"],
    imageQueries: ["CeraVe Moisturizing Cream", "moisturizer cream jar", "skincare cream tub"],
  },
  {
    id: "ordinary-niacinamide-serum",
    name: "The Ordinary Niacinamide 10% + Zinc 1% Serum",
    slug: "ordinary-niacinamide-serum",
    categoryId: "beauty",
    brand: "The Ordinary",
    price: 12.9,
    discountPrice: 9.9,
    stock: 188,
    summary:
      "High-strength vitamin B3 serum that visibly balances oil and reduces the look of blemishes.",
    description:
      "Niacinamide at 10% works on sebum production and the appearance of enlarged pores, and the 1% zinc PCA helps calm visible redness. The water-based serum layers under moisturiser without pilling, and the dropper makes it easy to use four to six drops across the face. It is fragrance-free and suitable for most skin types, though very sensitive skin should patch test first.",
    features: [
      "10% niacinamide with 1% zinc PCA",
      "Water-based, lightweight texture",
      "Fragrance-free and alcohol-free",
      "Vegan and cruelty-free formula",
      "30 ml with precision dropper",
    ],
    specs: [
      { label: "Size", value: "30 ml" },
      { label: "Key actives", value: "Niacinamide 10%, zinc PCA 1%" },
      { label: "Texture", value: "Water-based serum" },
      { label: "Skin type", value: "Oily, combination, blemish-prone" },
      { label: "Use", value: "AM or PM, before moisturiser" },
    ],
    seoTitle: "The Ordinary Niacinamide 10% + Zinc 1% Serum",
    seoDescription:
      "The Ordinary Niacinamide 10% + Zinc 1% serum for oily and blemish-prone skin. 30 ml, fragrance-free.",
    seoKeywords: ["the ordinary niacinamide", "niacinamide serum", "zinc serum", "oil control serum"],
    imageQueries: ["The Ordinary Niacinamide serum", "serum dropper bottle", "skincare serum product"],
  },
  {
    id: "braun-series-9",
    name: "Braun Series 9 Pro Electric Shaver",
    slug: "braun-series-9",
    categoryId: "beauty",
    brand: "Braun",
    price: 299.99,
    discountPrice: 249.99,
    stock: 26,
    summary:
      "Five shaving elements and a sonic motor for a close shave on three-day stubble.",
    description:
      "The Series 9 Pro uses five synchronised shaving elements to capture more hair in a single pass, and the sonic motor reads beard density 10 times per second to adjust power on the fly. The pivoting head follows the jaw and neck, and the AutoSense motor keeps the shave comfortable even on sensitive skin. It is fully washable, works wet or dry, and the charging stand holds a week of shaves.",
    features: [
      "Five synchronised shaving elements",
      "AutoSense motor adjusts to beard density",
      "10D pivoting head for jaw and neck",
      "Wet and dry, fully washable",
      "60-minute shave time with charging stand",
    ],
    specs: [
      { label: "Shaving elements", value: "5" },
      { label: "Battery", value: "Up to 60 minutes" },
      { label: "Charging", value: "Charging stand, 1 hour full charge" },
      { label: "Waterproof", value: "Yes, wet and dry" },
      { label: "Warranty", value: "2 years" },
    ],
    seoTitle: "Braun Series 9 Pro Electric Shaver",
    seoDescription:
      "Braun Series 9 Pro shaver with five shaving elements, AutoSense motor and charging stand. 2-year warranty.",
    seoKeywords: ["braun series 9", "electric shaver", "foil shaver", "braun shaver"],
    imageQueries: ["Braun Series 9 shaver", "electric shaver product", "foil shaver closeup"],
  },

  // ─── Books ───────────────────────────────────────────────────────────────
  {
    id: "clean-code",
    name: "Clean Code: A Handbook of Agile Software Craftsmanship",
    slug: "clean-code",
    categoryId: "books",
    brand: "Prentice Hall",
    price: 44.99,
    discountPrice: 34.99,
    stock: 76,
    summary:
      "Robert C. Martin's classic on naming, functions and the habits that keep code readable.",
    description:
      "Clean Code is the book most engineering teams hand to new hires. Martin walks through naming, function design, error handling and unit testing with before-and-after examples that make the difference between readable and merely working code obvious. The final chapters turn the lessons on the reader, asking you to refactor real Java listings and judge your own instincts.",
    features: [
      "Case studies in refactoring real Java code",
      "Chapters on naming, functions, comments and formatting",
      "Guidance on error handling and boundaries",
      "A full chapter on unit testing and test-driven development",
      "Includes a section on smells and heuristics",
    ],
    specs: [
      { label: "Author", value: "Robert C. Martin" },
      { label: "Publisher", value: "Prentice Hall" },
      { label: "Pages", value: "464" },
      { label: "Language", value: "English" },
      { label: "ISBN", value: "978-0132350884" },
    ],
    seoTitle: "Clean Code by Robert C. Martin",
    seoDescription:
      "Clean Code: A Handbook of Agile Software Craftsmanship by Robert C. Martin. Paperback, 464 pages.",
    seoKeywords: ["clean code book", "robert martin", "software craftsmanship", "programming book"],
    imageQueries: ["Clean Code Robert Martin book", "programming book cover", "software engineering book"],
  },
  {
    id: "design-patterns",
    name: "Design Patterns: Elements of Reusable Object-Oriented Software",
    slug: "design-patterns",
    categoryId: "books",
    brand: "Addison-Wesley",
    price: 54.95,
    discountPrice: 44.95,
    stock: 54,
    summary:
      "The Gang of Four catalog of 23 patterns, still the reference for object-oriented design.",
    description:
      "Design Patterns codified the vocabulary engineers use to talk about structure: factory, observer, adapter, strategy. Each pattern gets a problem statement, a structure diagram, participants, collaborations and a discussion of when not to use it. The examples are in C++ and Smalltalk, but the ideas translate directly to any object-oriented language.",
    features: [
      "23 classic patterns across creational, structural and behavioural categories",
      "Each pattern includes applicability, structure and consequences",
      "Sample code in C++ and Smalltalk",
      "Case study applying patterns to a document editor",
      "Written by Gamma, Helm, Johnson and Vlissides",
    ],
    specs: [
      { label: "Authors", value: "Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides" },
      { label: "Publisher", value: "Addison-Wesley" },
      { label: "Pages", value: "416" },
      { label: "Language", value: "English" },
      { label: "ISBN", value: "978-0201633610" },
    ],
    seoTitle: "Design Patterns: Elements of Reusable Object-Oriented Software",
    seoDescription:
      "Design Patterns by the Gang of Four, the definitive catalog of 23 object-oriented design patterns.",
    seoKeywords: ["design patterns book", "gang of four", "software design patterns", "oop patterns"],
    imageQueries: ["Design Patterns Gang of Four book", "software architecture book", "programming book cover"],
  },
  {
    id: "pragmatic-programmer",
    name: "The Pragmatic Programmer (20th Anniversary Edition)",
    slug: "pragmatic-programmer",
    categoryId: "books",
    brand: "Addison-Wesley",
    price: 49.99,
    discountPrice: 39.99,
    stock: 88,
    summary:
      "Hunt and Thomas on the habits, tools and attitudes that separate professionals from coders.",
    description:
      "The 20th-anniversary edition revisits the tips that made the original a classic, from source control and pragmatic paranoia to tracer bullets and contract design. New material covers concurrency, microservices and the realities of modern tooling without losing the book's practical tone. It reads like advice from a senior engineer who has shipped a lot of software.",
    features: [
      "Updated for modern tooling and concurrency",
      "70+ self-contained tips and checklists",
      "Chapters on contracts, concurrency and while-you-code habits",
      "Practical guidance on debugging and estimation",
      "Written by Andrew Hunt and David Thomas",
    ],
    specs: [
      { label: "Authors", value: "Andrew Hunt, David Thomas" },
      { label: "Publisher", value: "Addison-Wesley" },
      { label: "Pages", value: "352" },
      { label: "Edition", value: "20th Anniversary, 2nd" },
      { label: "ISBN", value: "978-0135957059" },
    ],
    seoTitle: "The Pragmatic Programmer 20th Anniversary Edition",
    seoDescription:
      "The Pragmatic Programmer by Andrew Hunt and David Thomas, 20th anniversary edition. Paperback.",
    seoKeywords: ["pragmatic programmer", "software development book", "andrew hunt", "programming career"],
    imageQueries: ["The Pragmatic Programmer book", "programming book cover", "software development book"],
  },
  {
    id: "atomic-habits",
    name: "Atomic Habits by James Clear",
    slug: "atomic-habits",
    categoryId: "books",
    brand: "Avery",
    price: 27.0,
    discountPrice: 18.99,
    stock: 164,
    summary:
      "A practical system for building good habits and breaking bad ones through tiny changes.",
    description:
      "Clear's argument is that results follow systems: make a habit obvious, attractive, easy and satisfying, and it sticks. The book pairs behavioural research with stories from athletes, artists and companies, and each chapter ends with rules you can apply the same day. It is the rare self-improvement book that stays concrete instead of motivational.",
    features: [
      "Four laws of behaviour change with practical tactics",
      "Habit scorecards and environment design templates",
      "Case studies from sport, business and art",
      "Frameworks for habit stacking and temptation bundling",
      "Over 15 million copies sold",
    ],
    specs: [
      { label: "Author", value: "James Clear" },
      { label: "Publisher", value: "Avery" },
      { label: "Pages", value: "320" },
      { label: "Language", value: "English" },
      { label: "ISBN", value: "978-0735211292" },
    ],
    seoTitle: "Atomic Habits by James Clear",
    seoDescription:
      "Atomic Habits by James Clear, the practical guide to building good habits and breaking bad ones.",
    seoKeywords: ["atomic habits", "james clear", "habit book", "self improvement book"],
    imageQueries: ["Atomic Habits James Clear book", "habit book cover", "self help book"],
  },
  {
    id: "deep-work",
    name: "Deep Work by Cal Newport",
    slug: "deep-work",
    categoryId: "books",
    brand: "Grand Central",
    price: 28.0,
    discountPrice: 19.99,
    stock: 121,
    summary:
      "Rules for focused success in a distracted world, with a practical training regimen.",
    description:
      "Newport argues that the ability to concentrate without distraction is becoming both rarer and more valuable. He lays out four philosophies of deep work, from monastic to journalistic, and pairs them with rituals for scheduling, embracing boredom and quitting social media. The final section offers a training plan for attention that is as concrete as a workout program.",
    features: [
      "Four depth philosophies with implementation guidance",
      "Rituals for scheduling and measuring focus",
      "Strategies for embracing boredom and reducing shallow work",
      "A structured attention-training regimen",
      "Case studies from academics, consultants and writers",
    ],
    specs: [
      { label: "Author", value: "Cal Newport" },
      { label: "Publisher", value: "Grand Central Publishing" },
      { label: "Pages", value: "304" },
      { label: "Language", value: "English" },
      { label: "ISBN", value: "978-1455586691" },
    ],
    seoTitle: "Deep Work by Cal Newport",
    seoDescription:
      "Deep Work by Cal Newport, rules for focused success in a distracted world. Paperback, 304 pages.",
    seoKeywords: ["deep work", "cal newport", "productivity book", "focus book"],
    imageQueries: ["Deep Work Cal Newport book", "productivity book cover", "focus book"],
  },
];

