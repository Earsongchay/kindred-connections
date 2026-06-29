import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";
import type { PwdRules } from "@/lib/password";

interface Props {
  password: string;
  pwdRules: PwdRules;
  pwdScore: number;
  pwdStrength: { label: string; color: string; text: string };
}

export function PasswordStrength({ password, pwdRules, pwdScore, pwdStrength }: Props) {
  const { t } = useTranslation();
  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full transition-all ${pwdStrength.color}`}
            style={{ width: `${(pwdScore / 6) * 100}%` }}
          />
        </div>
        <span className={`text-xs font-semibold ${pwdStrength.text}`}>
          {password ? pwdStrength.label : ""}
        </span>
      </div>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <Rule ok={pwdRules.length}>{t("inscription.form.pwdLength")}</Rule>
        <Rule ok={pwdRules.upper}>{t("inscription.form.pwdUpper")}</Rule>
        <Rule ok={pwdRules.lower}>{t("inscription.form.pwdLower")}</Rule>
        <Rule ok={pwdRules.digit}>{t("inscription.form.pwdDigit")}</Rule>
        <Rule ok={pwdRules.special}>{t("inscription.form.pwdSpecial")}</Rule>
        <Rule ok={pwdRules.noSpace}>{t("inscription.form.pwdNoSpace")}</Rule>
      </ul>
    </div>
  );
}

function Rule({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <li className={`flex items-center gap-1.5 ${ok ? "text-emerald-600" : ""}`}>
      <Check className={`h-3 w-3 ${ok ? "opacity-100" : "opacity-30"}`} /> {children}
    </li>
  );
}
