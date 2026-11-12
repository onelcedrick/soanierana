// Utilitaire pour convertir HEX en HSL et vice-versa
function hexToHsl(hex: string) {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  }
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToHex(h: number, s: number, l: number) {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export interface ThemePalette {
  primary: string;
  primaryHover: string;
  primaryLight: string;
  primaryDark: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
}

export function generatePalette(hex: string, isDarkMode: boolean): ThemePalette {
  const hsl = hexToHsl(hex);
  
  // Couleur primaire et ses variantes
  const primary = hex;
  const primaryHover = isDarkMode 
    ? hslToHex(hsl.h, hsl.s, Math.min(hsl.l + 10, 90))
    : hslToHex(hsl.h, hsl.s, Math.max(hsl.l - 10, 10));
  const primaryLight = isDarkMode
    ? hslToHex(hsl.h, hsl.s, 20) // Fond sombre pour le mode nuit
    : hslToHex(hsl.h, hsl.s, 95); // Fond clair pour le mode jour
  const primaryDark = hslToHex(hsl.h, hsl.s, Math.max(hsl.l - 20, 5));

  // Couleur d'accent (complémentaire, teinte + 180°)
  const accent = hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l);

  // Couleurs neutres
  const background = isDarkMode ? hslToHex(hsl.h, 10, 8) : '#f8fafc'; // slate-50
  const surface = isDarkMode ? hslToHex(hsl.h, 10, 12) : '#ffffff';
  const text = isDarkMode ? hslToHex(hsl.h, 10, 95) : hslToHex(hsl.h, 20, 15);
  const textMuted = isDarkMode ? hslToHex(hsl.h, 10, 65) : hslToHex(hsl.h, 15, 45);
  const border = isDarkMode ? hslToHex(hsl.h, 10, 20) : '#e2e8f0'; // slate-200

  return {
    primary, primaryHover, primaryLight, primaryDark,
    accent, background, surface, text, textMuted, border
  };
}

// Applique la palette au document HTML
export function applyTheme(palette: ThemePalette) {
  const root = document.documentElement;
  root.style.setProperty('--color-primary', palette.primary);
  root.style.setProperty('--color-primary-hover', palette.primaryHover);
  root.style.setProperty('--color-primary-light', palette.primaryLight);
  root.style.setProperty('--color-primary-dark', palette.primaryDark);
  root.style.setProperty('--color-accent', palette.accent);
  root.style.setProperty('--color-background', palette.background);
  root.style.setProperty('--color-surface', palette.surface);
  root.style.setProperty('--color-text', palette.text);
  root.style.setProperty('--color-text-muted', palette.textMuted);
  root.style.setProperty('--color-border', palette.border);
}
