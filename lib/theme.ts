import type { CSSProperties } from "react";
import type { Brand } from "@/types";

export function getThemeStyles(brand: Brand): CSSProperties {
  const theme = brand.theme;
  return {
    "--brand-primary": theme.primary,
    "--brand-secondary": theme.secondary,
    "--brand-accent": theme.accent,
    "--brand-background": theme.background,
    "--brand-surface": theme.surface,
    "--brand-text": theme.text,
    "--brand-muted": theme.muted,
    "--brand-border": theme.border,
    "--brand-font-display": theme.fontDisplay,
    "--brand-font-body": theme.fontBody,
    "--brand-radius": theme.radius,
    "--brand-image-radius": theme.imageRadius,
    "--brand-button-radius": theme.buttonRadius,
    "--brand-navigation-case": theme.navigationCase,
    "--brand-section-space": theme.spacing === "compact" ? "4rem" : "6.5rem",
    "--font-display": theme.fontDisplay,
    "--font-body": theme.fontBody,
    "--image-radius": theme.imageRadius,
    "--button-radius": theme.buttonRadius,
    "--navigation-case": theme.navigationCase,
    colorScheme: theme.mode,
  } as CSSProperties;
}

export const themeToStyles = getThemeStyles;
