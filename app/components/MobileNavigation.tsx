"use client";

import { useEffect, useId, useState } from "react";

const links = [
  { href: "/#services", label: "Services" },
  { href: "/#approach", label: "Approach" },
  { href: "/insights", label: "Insights" },
  { href: "/learn", label: "Learn" },
  { href: "/resources", label: "Resources" },
];

export function MobileNavigation() {
  const [open, setOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  return (
    <div className={`mobile-navigation${open ? " is-open" : ""}`}>
      <button
        type="button"
        className="mobile-menu-button"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        onClick={() => setOpen((current) => !current)}
      >
        <span />
        <span />
      </button>

      <div className="mobile-menu-panel" id={menuId} hidden={!open}>
        <nav aria-label="Mobile navigation">
          {links.map((link, index) => (
            <a href={link.href} onClick={() => setOpen(false)} key={link.href}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              {link.label}
            </a>
          ))}
        </nav>
        <a className="mobile-menu-cta" href="/contact" onClick={() => setOpen(false)}>
          Discuss a project <span aria-hidden="true">↗</span>
        </a>
        <p>Commercial AV engineering for integrators.</p>
      </div>
    </div>
  );
}
