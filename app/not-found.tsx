import Link from "next/link";
import { ArrowRight } from "lucide-react";
export default function NotFound() {
  return (
    <div className="empty-page container">
      <p className="eyebrow">404 / A WRONG TURN</p>
      <h1>This one got away.</h1>
      <p>
        The page you’re looking for has moved, or doesn’t exist.
        <br />
        There are still plenty of good things to discover.
      </p>
      <Link href="/shop" className="button">
        Explore the essentials
        <ArrowRight size={17} />
      </Link>
    </div>
  );
}
