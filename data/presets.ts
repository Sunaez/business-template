import type { Brand } from "@/types";

/** Optional visual presets. All three retain the same catalogue and brand content. */
export const storefrontPresets = {
  studio: { theme: {}, layout: {} },
  gallery: {
    theme: {
      fontDisplay: "Georgia, 'Times New Roman', serif",
      background: "#f6f3ed",
      surface: "#e9e5dd",
      secondary: "#e3ded2",
      navigationCase: "none",
      spacing: "spacious",
    },
    layout: {
      header: "centered",
      hero: "editorial",
      productCard: "editorial",
      productGrid: "spacious",
      footer: "minimal",
    },
  },
  "after-dark": {
    theme: {
      mode: "dark",
      primary: "#edece6",
      secondary: "#34372e",
      accent: "#dbe6a4",
      background: "#191b18",
      surface: "#262922",
      text: "#edece6",
      muted: "#b9bcb2",
      border: "#41473a",
      imageRadius: "8px",
      buttonRadius: "4px",
      spacing: "compact",
    },
    layout: {
      header: "editorial",
      hero: "split",
      productCard: "detailed",
      productGrid: "compact",
      footer: "expanded",
    },
  },
} satisfies Record<
  string,
  { theme: Partial<Brand["theme"]>; layout: Partial<Brand["layout"]> }
>;

export type StorefrontPreset = keyof typeof storefrontPresets;

export function applyStorefrontPreset(brand: Brand, name: string): Brand {
  const preset = Object.hasOwn(storefrontPresets, name)
    ? storefrontPresets[name as StorefrontPreset]
    : storefrontPresets.studio;
  return {
    ...brand,
    theme: { ...brand.theme, ...preset.theme },
    layout: { ...brand.layout, ...preset.layout },
  };
}
