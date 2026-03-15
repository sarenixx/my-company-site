import Link from "next/link";

type NavKey = "about" | "team" | "investments" | "news";

const navItems: Array<{ label: string; href: string; activeFor?: NavKey }> = [
  { label: "INVESTMENTS", href: "/investments", activeFor: "investments" },
  { label: "TEAM", href: "/team", activeFor: "team" },
  { label: "NEWS", href: "/news", activeFor: "news" },
  { label: "THOUGHTS", href: "/#resources" },
];

export function SiteShell({
  active,
  fluid = false,
  children,
}: {
  active: NavKey;
  fluid?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="avp-root">
      <header className="avp-header">
        <div className="avp-container avp-nav-row">
          <Link href="/" className="avp-brand" aria-label="Advance Venture Partners home">
            <img
              src="https://www.avp.vc/assets/images/branding/avp-logo.svg"
              alt="Advance Venture Partners"
              className="avp-brand-logo"
            />
          </Link>

          <nav aria-label="Main navigation">
            <ul className="avp-nav-links">
              {navItems.map((item) => (
                <li key={`${item.href}-${item.label}`}>
                  <Link
                    href={item.href}
                    className={item.activeFor === active ? "is-active" : undefined}
                    aria-current={item.activeFor === active ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <div className={fluid ? "avp-page avp-page-fluid" : "avp-container avp-page"}>{children}</div>
    </div>
  );
}
