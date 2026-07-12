export type LinktreeLayoutMode = "linktree" | "profile";

export type LinktreeLayoutTheme = {
  id?: string;
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
