// TODO Sprint 3-4 — Wire to backend. Per §4.9 + §4.10 (post-MVP deletion UI).
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Download, KeyRound, ShieldAlert, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PasswordChangeModal } from "@/components/site/PasswordChangeModal";

export const Route = createFileRoute("/$locale/espace-patient/securite")({
  head: () => ({ meta: [{ title: "Sécurité — FUENI" }] }),
  component: Securite,
});

function Securite() {
  const { t } = useTranslation();
  const { locale } = Route.useParams();
  const navigate = useNavigate();
  const [pwdModal, setPwdModal] = useState(false);

  const handlePasswordChangeSuccess = () =>
    navigate({ to: "/$locale/login", params: { locale }, search: { audience: "patient" } });
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">{t("securite.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("securite.subtitle")}</p>
      </header>

      <section className="rounded-2xl border border-border/60 bg-card/70 p-6">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-primary/10 text-primary">
            <KeyRound className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold">{t("securite.password.title")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("securite.password.description")}
            </p>
          </div>
          <Button variant="outline" className="rounded-full" onClick={() => setPwdModal(true)}>
            {t("securite.password.cta")}
          </Button>
        </div>
      </section>

      <section className="rounded-2xl border border-border/60 bg-card/70 p-6">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-muted text-muted-foreground">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold">
              {t("securite.mfa.title")}{" "}
              <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {t("securite.postMvp")}
              </span>
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{t("securite.mfa.description")}</p>
          </div>
          <Button variant="outline" disabled className="rounded-full">
            {t("securite.mfa.cta")}
          </Button>
        </div>
      </section>

      <section className="rounded-2xl border border-border/60 bg-card/70 p-6">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-emerald-500/10 text-emerald-600">
            <Download className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold">{t("securite.export.title")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t("securite.export.description")}</p>
          </div>
          <Button variant="outline" className="rounded-full">
            {t("securite.export.cta")}
          </Button>
        </div>
      </section>

      {/* T23 — Account deletion is post-MVP: button disabled, modal removed */}
      <section className="rounded-2xl border border-red-300/60 bg-red-50/50 p-6 dark:bg-red-950/20">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-red-500/15 text-red-600">
            <Trash2 className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-red-700 dark:text-red-300">
              {t("securite.delete.title")}{" "}
              <span className="ml-2 rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-red-600">
                {t("securite.postMvp")}
              </span>
            </h2>
            <p className="mt-1 text-sm text-red-700/80 dark:text-red-300/80">
              {t("securite.delete.description")}
            </p>
          </div>
          <Button variant="outline" className="rounded-full border-red-300 text-red-700" disabled>
            {t("securite.delete.cta")}
          </Button>
        </div>
      </section>
      {pwdModal && (
        <PasswordChangeModal
          onClose={() => setPwdModal(false)}
          onSuccess={handlePasswordChangeSuccess}
        />
      )}
    </div>
  );
}
