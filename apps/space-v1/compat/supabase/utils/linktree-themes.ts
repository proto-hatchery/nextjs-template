export type LinktreeTheme = {
  id: string;
  name: string;
  description: string;
  colors: {
    background: string;
    foreground: string;
    surface: string;
    surfaceMuted: string;
    border: string;
    primary: string;
    primaryText: string;
    secondary: string;
    secondaryText: string;
    accent: string;
  };
  rounded: "none" | "xs" | "sm" | "md" | "xl" | "full";
};

export const darkenHex = (hex: string, amount = 0.18) => {
  const sanitized = hex.replace("#", "");
  if (sanitized.length !== 6) return hex;
  const num = parseInt(sanitized, 16);
  const r = Math.max(0, ((num >> 16) & 0xff) * (1 - amount));
  const g = Math.max(0, ((num >> 8) & 0xff) * (1 - amount));
  const b = Math.max(0, (num & 0xff) * (1 - amount));
  return `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;
};

export const getRoundedClasses = (rounded: LinktreeTheme["rounded"]) => {
  const button =
    rounded === "none"
      ? "rounded-none"
      : rounded === "xs"
        ? "rounded-sm"
        : rounded === "sm"
          ? "rounded-md"
          : rounded === "md"
            ? "rounded-lg"
            : rounded === "xl"
              ? "rounded-xl"
              : "rounded-full";
  return {
    button,
    avatar: button,
  };
};

export const LINKTREE_THEMES: LinktreeTheme[] = [
  {
    id: "classic",
    name: "Clássico",
    description: "O tema atual, elegante e neutro.",
    colors: {
      background: "#F8F8F5",
      foreground: "#0F0F0F",
      surface: "#FFFFFF",
      surfaceMuted: "#F4F4F1",
      border: "#E3E4DD",
      primary: "#121212",
      primaryText: "#FFFFFF",
      secondary: "#FFFFFF",
      secondaryText: "#111111",
      accent: "#C9CBBE",
    },
    rounded: "full",
  },
  {
    id: "serenidade",
    name: "Serenidade",
    description: "Azul suave e neutros - profissionalismo e confiança.",
    colors: {
      background: "#F7FBFF",
      foreground: "#1F2933",
      surface: "#FFFFFF",
      surfaceMuted: "#F2F8FF",
      border: "#E3ECF4",
      primary: "#5881AA",
      primaryText: "#FFFFFF",
      secondary: "#FFFFFF",
      secondaryText: "#1F2933",
      accent: "#DCF1FF",
    },
    rounded: "full",
  },
  {
    id: "acolhimento",
    name: "Acolhimento",
    description: "Rosa muted contemporâneo - empatia e modernidade.",
    colors: {
      background: "#FDF7FA",
      foreground: "#2A1E24",
      surface: "#FFFFFF",
      surfaceMuted: "#F6EFF2",
      border: "#E8D7DE",
      primary: "#BA97A9",
      primaryText: "#FFFFFF",
      secondary: "#FFFFFF",
      secondaryText: "#2A1E24",
      accent: "#DDB2B9",
    },
    rounded: "md",
  },
  {
    id: "verde-pastel",
    name: "Verde Pastel",
    description: "Verde suave e moderno - acolhimento e equilíbrio.",
    colors: {
      background: "#F7FBF8",
      foreground: "#223027",
      surface: "#FFFFFF",
      surfaceMuted: "#F1F6F2",
      border: "#DDE8DF",
      primary: "#6F9A7E",
      primaryText: "#FFFFFF",
      secondary: "#FFFFFF",
      secondaryText: "#223027",
      accent: "#D9EBDD",
    },
    rounded: "md",
  },
  {
    id: "lavanda",
    name: "Lavanda",
    description: "Lavanda leve - introspecção e serenidade.",
    colors: {
      background: "#F9F7FC",
      foreground: "#2B2137",
      surface: "#FFFFFF",
      surfaceMuted: "#F2EDF7",
      border: "#E1D8EF",
      primary: "#7B6AAE",
      primaryText: "#FFFFFF",
      secondary: "#FFFFFF",
      secondaryText: "#2B2137",
      accent: "#C9D4EB",
    },
    rounded: "md",
  },
  {
    id: "essencial",
    name: "Essencial",
    description: "Tons terrosos minimalistas - sofisticação natural.",
    colors: {
      background: "#FBF9F6",
      foreground: "#2B261F",
      surface: "#FFFFFF",
      surfaceMuted: "#F3F0EB",
      border: "#E4DED5",
      primary: "#9F8A6B",
      primaryText: "#FFFFFF",
      secondary: "#FFFFFF",
      secondaryText: "#2B261F",
      accent: "#EAE7E2",
    },
    rounded: "none",
  },
];

export const getLinktreeTheme = (id?: string | null): LinktreeTheme => {
  if (!id) return LINKTREE_THEMES[0]!;
  return LINKTREE_THEMES.find((theme) => theme.id === id) ?? LINKTREE_THEMES[0]!;
};
