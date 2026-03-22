export interface ZenythProduct {
  id: string;
  name: string;
  sku: string;
  image: string;
  price: number;
  currency: string;
  unitsPerPackage: number;
  unitLabel: string;
  category: string;
  description: string;
  url: string;
  // Simulated refill data
  unitsPerIntake: number;
  frequencyPerDay: number;
  daysRemaining: number;
  totalDays: number;
}

const legacyZenythProducts: ZenythProduct[] = [
  {
    id: 'zp-1',
    name: 'Vitamina C 1000mg Zenyth',
    sku: 'ZEN-VC1000',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop',
    price: 45.00,
    currency: 'RON',
    unitsPerPackage: 30,
    unitLabel: 'capsule',
    category: 'Vitamine',
    description: 'Vitamina C cu eliberare prelungită pentru imunitate optimă.',
    url: '#',
    unitsPerIntake: 1,
    frequencyPerDay: 1,
    daysRemaining: 6,
    totalDays: 30,
  },
  {
    id: 'zp-2',
    name: 'Omega 3 Premium Zenyth',
    sku: 'ZEN-OM3P',
    image: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=400&h=400&fit=crop',
    price: 69.00,
    currency: 'RON',
    unitsPerPackage: 60,
    unitLabel: 'capsule',
    category: 'Acizi grași',
    description: 'Acizi grași Omega 3 din ulei de pește premium.',
    url: '#',
    unitsPerIntake: 1,
    frequencyPerDay: 2,
    daysRemaining: 3,
    totalDays: 30,
  },
  {
    id: 'zp-3',
    name: 'Colagen Marin Zenyth',
    sku: 'ZEN-CM500',
    image: 'https://images.unsplash.com/photo-1556227702-d1e4e7b5c232?w=400&h=400&fit=crop',
    price: 89.00,
    currency: 'RON',
    unitsPerPackage: 30,
    unitLabel: 'capsule',
    category: 'Frumusețe',
    description: 'Colagen marin hidrolizat pentru piele, păr și unghii.',
    url: '#',
    unitsPerIntake: 2,
    frequencyPerDay: 1,
    daysRemaining: 12,
    totalDays: 15,
  },
  {
    id: 'zp-4',
    name: 'Probiotice Zenyth',
    sku: 'ZEN-PRB20',
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=400&fit=crop',
    price: 55.00,
    currency: 'RON',
    unitsPerPackage: 20,
    unitLabel: 'capsule',
    category: 'Digestie',
    description: '20 miliarde CFU pentru flora intestinală sănătoasă.',
    url: '#',
    unitsPerIntake: 1,
    frequencyPerDay: 1,
    daysRemaining: 0,
    totalDays: 20,
  },
  {
    id: 'zp-5',
    name: 'Vitamina D3 2000 UI Zenyth',
    sku: 'ZEN-VD32K',
    image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&h=400&fit=crop',
    price: 35.00,
    currency: 'RON',
    unitsPerPackage: 60,
    unitLabel: 'capsule',
    category: 'Vitamine',
    description: 'Vitamina D3 pentru oase puternice și imunitate.',
    url: '#',
    unitsPerIntake: 1,
    frequencyPerDay: 1,
    daysRemaining: 45,
    totalDays: 60,
  },
  {
    id: 'zp-6',
    name: 'Magneziu Bisglicinat Zenyth',
    sku: 'ZEN-MGB',
    image: 'https://images.unsplash.com/photo-1559757175-7cb057fba93c?w=400&h=400&fit=crop',
    price: 52.00,
    currency: 'RON',
    unitsPerPackage: 30,
    unitLabel: 'comprimate',
    category: 'Minerale',
    description: 'Magneziu cu absorbție superioară pentru relaxare musculară.',
    url: '#',
    unitsPerIntake: 2,
    frequencyPerDay: 1,
    daysRemaining: 8,
    totalDays: 15,
  },
  {
    id: 'zp-7',
    name: 'Zinc + Seleniu Zenyth',
    sku: 'ZEN-ZNSE',
    image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400&h=400&fit=crop',
    price: 38.00,
    currency: 'RON',
    unitsPerPackage: 30,
    unitLabel: 'capsule',
    category: 'Minerale',
    description: 'Complex de zinc și seleniu pentru imunitate și tiroidă.',
    url: '#',
    unitsPerIntake: 1,
    frequencyPerDay: 1,
    daysRemaining: 22,
    totalDays: 30,
  },
  {
    id: 'zp-8',
    name: 'Curcumin C3 Complex Zenyth',
    sku: 'ZEN-CRC3',
    image: 'https://images.unsplash.com/photo-1615485500710-aa71300612aa?w=400&h=400&fit=crop',
    price: 75.00,
    currency: 'RON',
    unitsPerPackage: 40,
    unitLabel: 'capsule',
    category: 'Antiinflamatoare',
    description: 'Curcumină standardizată cu biodisponibilitate crescută.',
    url: '#',
    unitsPerIntake: 2,
    frequencyPerDay: 1,
    daysRemaining: 15,
    totalDays: 20,
  },
];

type RawZenythProduct = {
  id: number;
  name: string;
  sku: string;
  image: string;
  permalink: string;
  units_per_package: number | null;
  refill_enabled: boolean;
};

const rawZenythProducts: RawZenythProduct[] = [
  {
    id: 58278,
    name: "5-HTP 100 mg, 30 capsule",
    sku: "5HTP",
    image:
      "https://zenyth.work/staging11022026/wp-content/uploads/2021/08/5-HTP-Fara-reflexie-96DPI.jpg",
    permalink:
      "https://zenyth.work/staging11022026/produse/5-htp-100-mg/",
    units_per_package: null,
    refill_enabled: true,
  },
  {
    id: 41525,
    name: "Acerola BIO 400 mg, 60 capsule",
    sku: "BIOACR60CPS",
    image:
      "https://zenyth.work/staging11022026/wp-content/uploads/2016/03/Bio-Acerola-Capsule-Fara-reflexie-96DPI-1.jpg",
    permalink:
      "https://zenyth.work/staging11022026/produse/bio-acerola-60-capsule-x-400-mg/",
    units_per_package: null,
    refill_enabled: true,
  },
  {
    id: 5660,
    name: "Acid Alfa Lipoic 250 mg, 60 capsule",
    sku: "ALA60CPS",
    image:
      "https://zenyth.work/staging11022026/wp-content/uploads/2016/03/Alpha-Lipoic-Acid-Fara-reflexie-96DPI.jpg",
    permalink:
      "https://zenyth.work/staging11022026/produse/alpha-lipoic-acid/",
    units_per_package: null,
    refill_enabled: true,
  },
  {
    id: 54693,
    name: "Acid hialuronic si Colagen complex, 30 capsule",
    sku: "HYACD30CPS",
    image:
      "https://zenyth.work/staging11022026/wp-content/uploads/2020/05/Hyaluronic-Acid-NEW-30-CPS-Fara-reflexie-96DPI.jpg",
    permalink:
      "https://zenyth.work/staging11022026/produse/hyaluronic-acid-30-capsule/",
    units_per_package: null,
    refill_enabled: true,
  },
  {
    id: 40906,
    name: "Acid hialuronic si Colagen complex, 60 capsule",
    sku: "HYACD60CPS",
    image:
      "https://zenyth.work/staging11022026/wp-content/uploads/2018/04/Hyaluronic-Acid-60-CPS-Fara-reflexie-96DPI.jpg",
    permalink:
      "https://zenyth.work/staging11022026/produse/hyaluronic-acid-with-collagen-complex-60-cps-700-mg/",
    units_per_package: null,
    refill_enabled: true,
  },
  {
    id: 57265,
    name: "AdaptoHelp Complex, 30 capsule",
    sku: "ADAPTHELP30",
    image:
      "https://zenyth.work/staging11022026/wp-content/uploads/2021/01/AdaptoHelp-Fara-reflexie-96DPI.jpg",
    permalink:
      "https://zenyth.work/staging11022026/produse/adaptohelp-complex/",
    units_per_package: null,
    refill_enabled: true,
  },
  {
    id: 54542,
    name: "Andrographis, 30 capsule",
    sku: "ANDRO30CPS",
    image:
      "https://zenyth.work/staging11022026/wp-content/uploads/2020/04/Andrographis-Fara-reflexie-96DPI.jpg",
    permalink:
      "https://zenyth.work/staging11022026/produse/andrographis/",
    units_per_package: null,
    refill_enabled: true,
  },
  {
    id: 199449,
    name: "Anorexia si alte tulburari de alimentatie",
    sku: "ANOREXTLB",
    image:
      "https://zenyth.work/staging11022026/wp-content/uploads/2025/05/Eva-Musby-Anorexia-1.png",
    permalink:
      "https://zenyth.work/staging11022026/produse/anorexia-si-alte-tulburari-de-alimentatie/",
    units_per_package: null,
    refill_enabled: true,
  },
  {
    id: 185494,
    name: "Anti-Aging Support, 30 capsule",
    sku: "ANTIAGESUPPORT30CPS",
    image:
      "https://zenyth.work/staging11022026/wp-content/uploads/2025/03/Anti-Aging-Support-Fara-reflexie-96DPI.jpg",
    permalink:
      "https://zenyth.work/staging11022026/produse/anti-aging-support-30-capsule/",
    units_per_package: null,
    refill_enabled: true,
  },
  {
    id: 41484,
    name: "ArtroHelp Forte, 14 plicuri x 5 g",
    sku: "AHF14PL",
    image:
      "https://zenyth.work/staging11022026/wp-content/uploads/2018/09/ArtroHelp-Forte-14-plicuri-Fata-96-DPI.jpg",
    permalink:
      "https://zenyth.work/staging11022026/produse/artrohelp-forte-14plicuri-x-5-g-pulbere/",
    units_per_package: null,
    refill_enabled: true,
  },
];

const parseUnitsFromName = (productName: string) => {
  // Matches examples: "..., 30 capsule", "..., 14 plicuri x 5 g"
  const capsule = productName.match(/,\s*(\d+)\s*capsule/i);
  if (capsule) return { unitsPerPackage: Number(capsule[1]), unitLabel: "capsule" };

  const comprimate =
    productName.match(/,\s*(\d+)\s*comprimate/i) ||
    productName.match(/,\s*(\d+)\s*comprimat/i);
  if (comprimate) return { unitsPerPackage: Number(comprimate[1]), unitLabel: "comprimate" };

  const plicuri = productName.match(/,\s*(\d+)\s*plicuri/i);
  if (plicuri) return { unitsPerPackage: Number(plicuri[1]), unitLabel: "plicuri" };

  return { unitsPerPackage: 0, unitLabel: "" };
};

export const zenythProducts: ZenythProduct[] = rawZenythProducts.map((p) => {
  const { unitsPerPackage, unitLabel } = parseUnitsFromName(p.name);
  const totalDays = unitsPerPackage > 0 ? unitsPerPackage : 30;
  const daysRemaining = p.refill_enabled ? Math.max(0, Math.round(totalDays * 0.35)) : 0;
  // Deterministic dummy pricing for products without price in source JSON.
  const dummyPrice = 39 + (p.id % 9) * 7;

  return {
    id: String(p.id),
    name: p.name,
    sku: p.sku,
    image: p.image,
    // Pretul nu exista in JSON-ul furnizat de tine.
    price: dummyPrice,
    currency: "RON",
    unitsPerPackage,
    unitLabel,
    category: "",
    description: "Vezi detalii pe site.",
    url: p.permalink,
    unitsPerIntake: 1,
    frequencyPerDay: 1,
    daysRemaining,
    totalDays,
  };
});
