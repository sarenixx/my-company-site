import Link from "next/link";

type NavKey = "about" | "team" | "investments" | "news";

const navItems: Array<{ key: NavKey; label: string; href: string }> = [
  { key: "about", label: "About Us", href: "/" },
  { key: "team", label: "Team", href: "/team" },
  { key: "investments", label: "Investments", href: "/investments" },
  { key: "news", label: "News", href: "/news" },
];

export function SiteShell({
  active,
  children,
}: {
  active: NavKey;
  children: React.ReactNode;
}) {
  return (
    <div className="avp-root">
      <header className="avp-header">
        <div className="avp-container avp-nav-row">
          <Link href="/" className="avp-brand" aria-label="Advance Venture Partners home">
            Advance Venture Partners
          </Link>

          <nav aria-label="Main navigation">
            <ul className="avp-nav-links">
              {navItems.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className={item.key === active ? "is-active" : undefined}
                    aria-current={item.key === active ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <a href="https://jobs.avp.vc/jobs" target="_blank" rel="noreferrer">
                  Jobs
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <div className="avp-container avp-page">{children}</div>
    </div>
  );
}
