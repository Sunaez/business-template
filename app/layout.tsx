import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { getThemeStyles } from "@/lib/theme";
import { getBrandConfig, getCollections, getProducts } from "@/lib/catalog";
import { CartProvider } from "@/components/commerce/CartProvider";
import { CartDrawer } from "@/components/commerce/CartDrawer";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getSiteOrigin, isSiteIndexable } from "@/lib/site";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getBrandConfig();
  return {
    metadataBase: new URL(getSiteOrigin()),
    title: {
      default: `${brand.name} — ${brand.tagline}`,
      template: `%s | ${brand.name}`,
    },
    description: brand.description,
    applicationName: brand.name,
    openGraph: {
      title: brand.name,
      description: brand.description,
      type: "website",
      locale: brand.locale.replace("-", "_"),
      images: [
        {
          url: brand.hero.image.src,
          width: 1672,
          height: 941,
          alt: brand.hero.image.alt,
        },
      ],
    },
    robots: { index: isSiteIndexable(), follow: true },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [brand, collections, products] = await Promise.all([
    getBrandConfig(),
    getCollections(),
    getProducts(),
  ]);
  const theme = brand.theme;
  const style = getThemeStyles(brand);
  return (
    <html
      lang={brand.locale.split("-")[0]}
      data-scroll-behavior="smooth"
      className={manrope.variable}
      style={style}
      data-theme={theme.mode}
      data-spacing={theme.spacing}
    >
      <body>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <CartProvider brand={brand} products={products}>
          <Header brand={brand} products={products} collections={collections} />
          <main id="main-content">{children}</main>
          <Footer brand={brand} collections={collections} />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
