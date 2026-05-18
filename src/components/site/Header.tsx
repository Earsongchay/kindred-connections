import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X, Globe, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

const nav = [
  { to: "/", label: "Accueil" },
  { to: "/fonctionnalites", label: "Fonctionnalités" },
  { to: "/pour-qui", label: "Pour qui ?" },
  { to: "/securite", label: "Sécurité" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const { location } = useRouterState();

  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <header className="sticky top-0 z-50 bg-background/85 backdrop-blur border-b border-border">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 h-16 flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2.5 mr-2">
          <span className="w-9 h-9 rounded-full bg-primary text-primary-foreground font-extrabold grid place-items-center">
            F
          </span>
          <span className="font-extrabold tracking-tight text-lg">FUENI</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1 ml-2">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-surface transition-colors"
              activeProps={{ className: "text-primary bg-accent-cyan-bg" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            to="/inscription"
            search={{ role: "patient" }}
            className="hidden md:inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold bg-warm-light text-[oklch(0.55_0.16_60)] hover:brightness-95 transition"
          >
            Espace patient
          </Link>
          <Link
            to="/inscription"
            search={{ role: "praticien" }}
            className="hidden md:inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold bg-accent-cyan-bg text-primary hover:bg-accent-cyan-mid transition"
          >
            Espace professionnel
          </Link>
          <button
            type="button"
            aria-label="Langue / devise"
            className="hidden md:inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-2"
          >
            FR · XOF <Globe className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            aria-label="Basculer le thème"
            onClick={() => setDark((d) => !d)}
            className="p-2 rounded-lg text-muted-foreground hover:bg-surface"
          >
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <Link
            to="/inscription"
            className="hidden sm:inline-flex items-center gap-2 rounded-full bg-foreground text-background px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition"
          >
            S'inscrire
          </Link>
          <button
            type="button"
            className="lg:hidden p-2 rounded-lg hover:bg-surface"
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border bg-background">
          <div className="px-5 py-3 flex flex-col gap-1">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-surface"
                activeProps={{ className: "text-primary bg-accent-cyan-bg" }}
                activeOptions={{ exact: n.to === "/" }}
              >
                {n.label}
              </Link>
            ))}
            <Link
              to="/inscription"
              className="mt-2 inline-flex justify-center items-center gap-2 rounded-full bg-foreground text-background px-5 py-2.5 text-sm font-semibold"
            >
              S'inscrire
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
