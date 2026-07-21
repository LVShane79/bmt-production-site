/* eslint-disable @next/next/no-img-element, @next/next/no-html-link-for-pages */

export function ArrowIcon() {
  return <span aria-hidden="true">↗</span>;
}

export function SiteHeader({ light = false }: { light?: boolean }) {
  return (
    <header className={`site-header${light ? " site-header-light" : ""}`}>
      <a className="brand" href="/" aria-label="Black Mountain Technologies home">
        <img
          src={light ? "/bmt-logo-graphite.png" : "/bmt-logo-white.png"}
          alt="Black Mountain Technologies"
        />
      </a>
      <nav aria-label="Primary navigation">
        <a href="/#services">Services</a>
        <a href="/#approach">Approach</a>
        <a href="/insights">Insights</a>
      </nav>
      <a className="header-cta" href="/#contact">Discuss a project <ArrowIcon /></a>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer>
      <img src="/bmt-logo-graphite.png" alt="Black Mountain Technologies" />
      <p>Commercial AV engineering for integrators.</p>
      <div>
        <a href="mailto:info@blackmountain.tech">info@blackmountain.tech</a>
        <a href="https://www.blackmountain.tech">blackmountain.tech</a>
      </div>
      <span>© 2026 Black Mountain Technologies</span>
    </footer>
  );
}
