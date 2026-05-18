import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="bg-[oklch(0.18_0.03_260)] text-[oklch(0.85_0.02_260)] mt-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 py-16 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-full bg-accent-cyan text-[oklch(0.18_0.03_260)] font-extrabold grid place-items-center">
              F
            </span>
            <span className="font-extrabold text-white text-lg">FUENI</span>
          </div>
          <p className="mt-4 text-sm max-w-md leading-relaxed">
            La plateforme santé numérique pour l'Afrique francophone et l'Europe.
            Patients, praticiens, pharmacies et hôpitaux, réunis dans un seul écosystème sécurisé.
          </p>
        </div>
        <div>
          <h4 className="text-white font-semibold text-sm mb-3">Produit</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/fonctionnalites" className="hover:text-white">Fonctionnalités</Link></li>
            <li><Link to="/pour-qui" className="hover:text-white">Pour qui ?</Link></li>
            <li><Link to="/securite" className="hover:text-white">Sécurité</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold text-sm mb-3">Société</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
            <li><Link to="/inscription" className="hover:text-white">S'inscrire</Link></li>
            <li><a href="#" className="hover:text-white">Mentions légales</a></li>
            <li><a href="#" className="hover:text-white">Confidentialité</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-5 lg:px-8 py-5 text-xs text-white/60 flex flex-wrap items-center justify-between gap-3">
          <span>© {new Date().getFullYear()} FUENI. Tous droits réservés.</span>
          <span>Conforme RGPD · CDP · ARTCI · APDP</span>
        </div>
      </div>
    </footer>
  );
}
