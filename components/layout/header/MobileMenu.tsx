"use client";
import { useStorefront } from "@/components/commerce/StorefrontProvider";
import { Drawer } from "@/components/ui/Drawer";
import { ArrowRight, UserRound } from "lucide-react";
import Link from "next/link";

export function MobileMenu({ onClose }: { onClose: () => void }) {
  const { brand, collections } = useStorefront();

  return (
    <Drawer open onClose={onClose} title="Explore" side="left">
      <nav className="mobile-nav" aria-label="Mobile navigation">
        {brand.navigation.map((link) => (
          <Link key={link.href} href={link.href} onClick={onClose}>
            {link.label}
            <ArrowRight size={20} />
          </Link>
        ))}
        <div className="mobile-nav-collections">
          <span className="eyebrow">The collections</span>
          {collections
            .filter((c) => c.featured)
            .map((c) => (
              <Link
                key={c.id}
                href={`/collections/${c.slug}`}
                onClick={onClose}
              >
                {c.title}
              </Link>
            ))}
        </div>
        <Link href="/account" onClick={onClose}>
          My account
          <UserRound size={19} />
        </Link>
        <Link href="/contact" onClick={onClose}>
          Get in touch
          <ArrowRight size={19} />
        </Link>
      </nav>
    </Drawer>
  );
}
