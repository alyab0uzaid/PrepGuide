import Link from "next/link";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/topics", label: "Topics" },
  { href: "/practice", label: "QB Practice" },
  { href: "/math-intros", label: "Math Intros" },
];

export default function Nav() {
  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="max-w-5xl mx-auto px-4 flex items-center gap-8 h-14">
        <Link href="/" className="font-bold text-lg tracking-tight">
          PrepGuide
        </Link>
        <div className="flex gap-6 text-sm">
          {navLinks.slice(1).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-gray-600 hover:text-gray-900"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
