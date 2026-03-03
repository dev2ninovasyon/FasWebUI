import * as LucideIcons from "lucide-react";
import menuIconList from "../../Menuiconlist.json";

type MenuIconConfigItem = {
  name?: string;
  icon?: string;
  children?: MenuIconConfigItem[];
};

type KeywordRule = {
  pattern: RegExp;
  iconName: string;
};

const normalizeMenuName = (value?: string): string =>
  (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase();

const tryDecodeLatin1ToUtf8 = (value?: string): string => {
  if (!value) return "";
  try {
    const bytes = Uint8Array.from(
      Array.from(value).map((char) => char.charCodeAt(0) & 0xff)
    );
    return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  } catch {
    return value;
  }
};

const getNormalizedNameVariants = (value?: string): string[] => {
  const raw = value || "";
  const decoded = tryDecodeLatin1ToUtf8(raw);
  const variants = [normalizeMenuName(raw), normalizeMenuName(decoded)];
  return Array.from(new Set(variants.filter(Boolean)));
};

const iconNameByMenuTitle = new Map<string, string>();

// IFRS denetci kisa siniflandirma: her konu grubu icin temel bir icon
const keywordRules: KeywordRule[] = [
  { pattern: /(ifrs|tfrs|tms|ias|dipnot)/, iconName: "BookOpenCheck" },
  { pattern: /(maddi|maliyet|degerleme|degerdusuklugu)/, iconName: "Scale3d" },
  { pattern: /(stok|envanter)/, iconName: "Boxes" },
  { pattern: /(amortisman|varlik)/, iconName: "Building2" },
  { pattern: /(kidem|tazminat)/, iconName: "WalletCards" },
  { pattern: /(kredi|alacak|borc|supheli)/, iconName: "Landmark" },
  { pattern: /(test|kontrol|prosedur)/, iconName: "ClipboardCheck" },
  { pattern: /(donusum|kur|reeskont)/, iconName: "ArrowLeftRight" },
  { pattern: /(risk|hile|usulsuzluk)/, iconName: "ShieldAlert" },
  { pattern: /(rapor|yorum|belge|dokuman)/, iconName: "FileText" },
  { pattern: /(analiz|oran|trend)/, iconName: "LineChart" },
  { pattern: /(nakit|odeme|tahsilat|fatura)/, iconName: "ReceiptText" },
];

const distinctLucideIconPool = [
  "BookOpenCheck",
  "Scale3d",
  "Boxes",
  "Building2",
  "WalletCards",
  "Landmark",
  "ClipboardCheck",
  "ArrowLeftRight",
  "ShieldAlert",
  "FileText",
  "LineChart",
  "ReceiptText",
  "Compass",
  "TestTube",
  "ChartNoAxesCombined",
  "Target",
  "ScanSearch",
  "FileSearch",
  "BookCheck",
  "Gavel",
  "ShieldCheck",
  "BadgeCheck",
  "BarChart3",
  "Activity",
  "CircleDollarSign",
  "Calculator",
  "Workflow",
  "CheckCheck",
  "NotebookPen",
  "Presentation",
  "Building",
  "PieChart",
  "Network",
  "Radar",
  "Lightbulb",
  "BrainCircuit",
  "FileBarChart",
  "ListChecks",
  "Layers3",
  "MessagesSquare",
  "Globe",
  "Archive",
];

const registerIconConfig = (items: MenuIconConfigItem[] = []): void => {
  for (const item of items) {
    const keys = getNormalizedNameVariants(item.name);
    if (keys.length && item.icon) {
      for (const key of keys) {
        iconNameByMenuTitle.set(key, item.icon);
      }
    }
    if (item.children?.length) {
      registerIconConfig(item.children);
    }
  }
};

registerIconConfig((menuIconList as { menu?: MenuIconConfigItem[] })?.menu || []);

export const resolveIconNameByMenuTitle = (title?: string): string => {
  const keys = getNormalizedNameVariants(title);
  const exact = keys
    .map((key) => iconNameByMenuTitle.get(key))
    .find((name) => Boolean(name));
  if (exact) return exact;

  const normalized = normalizeMenuName(tryDecodeLatin1ToUtf8(title || ""));
  const keywordMatch = keywordRules.find((rule) => rule.pattern.test(normalized));
  if (keywordMatch) return keywordMatch.iconName;

  return "FileText";
};

export const resolveLucideIconByMenuTitle = (title?: string) => {
  const iconName = resolveIconNameByMenuTitle(title);
  const icon = (LucideIcons as Record<string, unknown>)[iconName];
  return icon || (LucideIcons as Record<string, unknown>).FileText;
};

const hashString = (value: string): number => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

export const resolveUniqueIconNamesForTitles = (titles: string[]): string[] => {
  const used = new Set<string>();

  return titles.map((title) => {
    const preferred = resolveIconNameByMenuTitle(title);
    if (!used.has(preferred)) {
      used.add(preferred);
      return preferred;
    }

    const start = hashString(title || "") % distinctLucideIconPool.length;
    for (let step = 0; step < distinctLucideIconPool.length; step += 1) {
      const candidate =
        distinctLucideIconPool[(start + step) % distinctLucideIconPool.length];
      if (!used.has(candidate)) {
        used.add(candidate);
        return candidate;
      }
    }

    return preferred;
  });
};

type AnyMenuItem = {
  title?: string;
  icon?: any;
  children?: AnyMenuItem[];
  [key: string]: any;
};

export const applyDynamicIconsToMenuItems = <T extends AnyMenuItem>(
  items: T[]
): T[] =>
  items.map((item) => {
    const resolvedIcon = resolveLucideIconByMenuTitle(item.title);
    return {
      ...item,
      icon: resolvedIcon || item.icon,
      children: item.children
        ? (applyDynamicIconsToMenuItems(item.children) as T["children"])
        : item.children,
    };
  });
