export interface ColorPreset {
  name: string;
  hex: string;
}

const HEX_PATTERN = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

const COLOR_KEYWORD_MAP: Array<{ keywords: string[]; hex: string }> = [
  { keywords: ['black', 'den', 'noir'], hex: '#111827' },
  { keywords: ['white', 'trang', 'ivory'], hex: '#f8fafc' },
  { keywords: ['grey', 'gray', 'xam', 'charcoal'], hex: '#6b7280' },
  { keywords: ['navy', 'midnight', 'indigo'], hex: '#1f3a8a' },
  { keywords: ['blue', 'xanh duong', 'azure', 'cobalt'], hex: '#2563eb' },
  { keywords: ['green', 'xanh la', 'olive'], hex: '#15803d' },
  { keywords: ['red', 'do', 'burgundy', 'maroon'], hex: '#dc2626' },
  { keywords: ['pink', 'hong', 'rose', 'blush'], hex: '#ec4899' },
  { keywords: ['purple', 'tim', 'violet', 'lilac'], hex: '#7c3aed' },
  { keywords: ['yellow', 'vang', 'mustard'], hex: '#ca8a04' },
  { keywords: ['orange', 'cam', 'coral', 'apricot'], hex: '#ea580c' },
  { keywords: ['beige', 'tan', 'khaki', 'cream', 'stone', 'sand'], hex: '#d6c6a8' },
  { keywords: ['brown', 'nau', 'cocoa', 'mocha'], hex: '#7c4a2d' },
  { keywords: ['silver'], hex: '#9ca3af' },
];

export const VENDOR_COLOR_PRESETS: ColorPreset[] = [
  { name: 'Black', hex: '#111827' },
  { name: 'White', hex: '#f8fafc' },
  { name: 'Grey', hex: '#6b7280' },
  { name: 'Navy', hex: '#1f3a8a' },
  { name: 'Blue', hex: '#2563eb' },
  { name: 'Green', hex: '#15803d' },
  { name: 'Red', hex: '#dc2626' },
  { name: 'Pink', hex: '#ec4899' },
  { name: 'Purple', hex: '#7c3aed' },
  { name: 'Yellow', hex: '#ca8a04' },
  { name: 'Orange', hex: '#ea580c' },
  { name: 'Beige', hex: '#d6c6a8' },
  { name: 'Brown', hex: '#7c4a2d' },
];

const normalizeToken = (value: string) => (
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
);

const normalizeHex = (value: string) => {
  const raw = String(value || '').trim();
  if (!raw) {
    return '';
  }

  const prefixed = raw.startsWith('#') ? raw : `#${raw}`;
  if (!HEX_PATTERN.test(prefixed)) {
    return '';
  }

  if (prefixed.length === 4) {
    const [hash, r, g, b] = prefixed;
    return `${hash}${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }

  return prefixed.toLowerCase();
};

export const normalizeHexColor = (value: string, fallback = '#d1d5db') => (
  normalizeHex(value) || fallback
);

export const getColorPresetByName = (name: string): ColorPreset | undefined => {
  const normalized = normalizeToken(name);
  if (!normalized) {
    return undefined;
  }

  return VENDOR_COLOR_PRESETS.find((preset) => normalizeToken(preset.name) === normalized);
};

export const resolveColorSwatch = (value: string, fallback = '#d1d5db') => {
  const normalizedHex = normalizeHex(value);
  if (normalizedHex) {
    return normalizedHex;
  }

  const normalizedToken = normalizeToken(value);
  if (!normalizedToken) {
    return fallback;
  }

  const preset = getColorPresetByName(value);
  if (preset) {
    return preset.hex;
  }

  for (const entry of COLOR_KEYWORD_MAP) {
    if (entry.keywords.some((keyword) => normalizedToken.includes(keyword))) {
      return entry.hex;
    }
  }

  return fallback;
};
