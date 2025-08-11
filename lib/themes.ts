export type ThemeId = 
  | "light" 
  | "dark" 
  | "neo-light" 
  | "neo-dark" 
  | "ocean" 
  | "forest" 
  | "sunset" 
  | "midnight"
  | "corporate"
  | "minimal"
  | "vibrant";

export interface ThemeConfig {
  name: string;
  description: string;
  category: "standard" | "neo" | "nature" | "professional" | "creative";
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
  };
  isDark: boolean;
  preview?: string;
}

export const themes: Record<ThemeId, string> = {
  light: "light",
  dark: "dark",
  "neo-light": "neo-light",
  "neo-dark": "neo-dark",
  ocean: "ocean",
  forest: "forest",
  sunset: "sunset",
  midnight: "midnight",
  corporate: "corporate",
  minimal: "minimal",
  vibrant: "vibrant",
};

export const themeConfigs: Record<ThemeId, ThemeConfig> = {
  light: {
    name: "Light",
    description: "Clean and bright default theme",
    category: "standard",
    isDark: false,
    colors: {
      primary: "oklch(0.21 0.006 285.885)",
      secondary: "oklch(0.967 0.001 286.375)",
      accent: "oklch(0.646 0.222 41.116)",
      background: "oklch(1 0 0)",
      foreground: "oklch(0.141 0.005 285.823)",
    },
  },
  dark: {
    name: "Dark",
    description: "Comfortable dark theme for extended use",
    category: "standard",
    isDark: true,
    colors: {
      primary: "oklch(0.7 0.15 285.885)",
      secondary: "oklch(0.15 0.02 286.375)",
      accent: "oklch(0.75 0.222 41.116)",
      background: "oklch(0.05 0.005 285.823)",
      foreground: "oklch(0.95 0.005 285.823)",
    },
  },
  "neo-light": {
    name: "Neo Light",
    description: "Modern minimalist light theme with subtle gradients",
    category: "neo",
    isDark: false,
    colors: {
      primary: "oklch(0.6 0.25 280)",
      secondary: "oklch(0.95 0.02 280)",
      accent: "oklch(0.7 0.3 200)",
      background: "oklch(0.99 0.005 280)",
      foreground: "oklch(0.15 0.02 280)",
    },
  },
  "neo-dark": {
    name: "Neo Dark",
    description: "Sleek dark theme with neon accents",
    category: "neo",
    isDark: true,
    colors: {
      primary: "oklch(0.8 0.3 320)",
      secondary: "oklch(0.2 0.05 320)",
      accent: "oklch(0.85 0.35 180)",
      background: "oklch(0.08 0.02 320)",
      foreground: "oklch(0.95 0.02 320)",
    },
  },
  ocean: {
    name: "Ocean",
    description: "Deep blue tones inspired by the ocean depths",
    category: "nature",
    isDark: true,
    colors: {
      primary: "oklch(0.7 0.25 230)",
      secondary: "oklch(0.25 0.1 230)",
      accent: "oklch(0.8 0.3 180)",
      background: "oklch(0.1 0.05 230)",
      foreground: "oklch(0.9 0.05 230)",
    },
  },
  forest: {
    name: "Forest",
    description: "Natural green palette with earthy tones",
    category: "nature",
    isDark: false,
    colors: {
      primary: "oklch(0.5 0.2 140)",
      secondary: "oklch(0.9 0.05 140)",
      accent: "oklch(0.6 0.25 80)",
      background: "oklch(0.98 0.02 140)",
      foreground: "oklch(0.2 0.05 140)",
    },
  },
  sunset: {
    name: "Sunset",
    description: "Warm orange and pink gradients like a beautiful sunset",
    category: "nature",
    isDark: false,
    colors: {
      primary: "oklch(0.65 0.3 40)",
      secondary: "oklch(0.9 0.1 40)",
      accent: "oklch(0.7 0.35 350)",
      background: "oklch(0.97 0.05 40)",
      foreground: "oklch(0.2 0.1 40)",
    },
  },
  midnight: {
    name: "Midnight",
    description: "Deep purple theme for late-night productivity",
    category: "creative",
    isDark: true,
    colors: {
      primary: "oklch(0.65 0.25 270)",
      secondary: "oklch(0.15 0.05 270)",
      accent: "oklch(0.75 0.3 320)",
      background: "oklch(0.05 0.02 270)",
      foreground: "oklch(0.9 0.05 270)",
    },
  },
  corporate: {
    name: "Corporate",
    description: "Professional theme suitable for business applications",
    category: "professional",
    isDark: false,
    colors: {
      primary: "oklch(0.4 0.15 240)",
      secondary: "oklch(0.95 0.02 240)",
      accent: "oklch(0.6 0.2 200)",
      background: "oklch(1 0 0)",
      foreground: "oklch(0.15 0.02 240)",
    },
  },
  minimal: {
    name: "Minimal",
    description: "Ultra-clean monochrome theme with minimal distractions",
    category: "professional",
    isDark: false,
    colors: {
      primary: "oklch(0.3 0.02 270)",
      secondary: "oklch(0.9 0.01 270)",
      accent: "oklch(0.5 0.05 270)",
      background: "oklch(1 0 0)",
      foreground: "oklch(0.1 0.01 270)",
    },
  },
  vibrant: {
    name: "Vibrant",
    description: "Bold and energetic theme with high contrast colors",
    category: "creative",
    isDark: false,
    colors: {
      primary: "oklch(0.6 0.35 300)",
      secondary: "oklch(0.9 0.1 300)",
      accent: "oklch(0.7 0.4 60)",
      background: "oklch(0.98 0.02 300)",
      foreground: "oklch(0.1 0.05 300)",
    },
  },
};

export const getThemeConfig = (themeId: ThemeId): ThemeConfig => {
  return themeConfigs[themeId];
};

export const getThemesByCategory = (category: ThemeConfig["category"]) => {
  return Object.entries(themeConfigs)
    .filter(([_, config]) => config.category === category)
    .map(([id, config]) => ({ id: id as ThemeId, ...config }));
};

export const getAllThemes = () => {
  return Object.entries(themeConfigs).map(([id, config]) => ({ 
    id: id as ThemeId, 
    ...config 
  }));
};