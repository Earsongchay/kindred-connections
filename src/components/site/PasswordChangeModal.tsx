import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertCircle, Eye, EyeOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { evaluatePassword, scorePassword } from "@/lib/password";
import { PasswordStrength } from "@/components/site/PasswordStrength";

export function PasswordChangeModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { t } = useTranslation();
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [oldError, setOldError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const pwdRules = useMemo(() => evaluatePassword(newPwd), [newPwd]);
  const pwdScore = useMemo(() => scorePassword(pwdRules), [pwdRules]);
  const pwdStrength = useMemo(() => {
    if (pwdScore <= 2)
      return { label: t("inscription.form.pwdWeak"), color: "bg-red-500", text: "text-red-600" };
    if (pwdScore === 3)
      return {
        label: t("inscription.form.pwdFair"),
        color: "bg-amber-500",
        text: "text-amber-600",
      };
    if (pwdScore <= 5)
      return {
        label: t("inscription.form.pwdStrong"),
        color: "bg-emerald-500",
        text: "text-emerald-600",
      };
    return {
      label: t("inscription.form.pwdVeryStrong"),
      color: "bg-emerald-600",
      text: "text-emerald-700",
    };
  }, [pwdScore, t]);

  const handleSave = () => {
    setOldError(null);
    if (!oldPwd) {
      setOldError(t("profil.pwdModal.oldRequired"));
      return;
    }
    // POC mock: any non-empty old password is accepted; all rules must pass
    if (pwdScore < 6) return;
    setSuccess(true);
    // §4.9.3 — all sessions invalidated on password change, including current device → redirect to login
    setTimeout(onSuccess, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-border/60 bg-card p-7 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">{t("profil.pwdModal.title")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t("profil.pwdModal.desc")}</p>
          </div>
          <button onClick={onClose} className="mt-0.5 text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {success ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {t("profil.pwdModal.success")}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Current password */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">{t("profil.pwdModal.oldLabel")}</Label>
              <div className="relative">
                <Input
                  type={showOld ? "text" : "password"}
                  className="h-11 pr-11"
                  placeholder="••••••••••••"
                  value={oldPwd}
                  autoComplete="current-password"
                  onChange={(e) => {
                    setOldPwd(e.target.value);
                    setOldError(null);
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowOld((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={t("login.togglePwd")}
                >
                  {showOld ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {oldError && (
                <p className="flex items-center gap-1.5 text-xs text-destructive">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {oldError}
                </p>
              )}
            </div>

            {/* New password + strength bar + checklist */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">{t("profil.pwdModal.newLabel")}</Label>
              <div className="relative">
                <Input
                  type={showNew ? "text" : "password"}
                  className="h-11 pr-11"
                  placeholder="••••••••••••"
                  value={newPwd}
                  autoComplete="new-password"
                  maxLength={128}
                  onChange={(e) => setNewPwd(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSave()}
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={t("login.togglePwd")}
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <PasswordStrength
                password={newPwd}
                pwdRules={pwdRules}
                pwdScore={pwdScore}
                pwdStrength={pwdStrength}
              />
            </div>

            <div className="flex gap-3 pt-1">
              <Button variant="outline" onClick={onClose} className="flex-1 rounded-full">
                {t("profil.pwdModal.cancel")}
              </Button>
              <Button
                onClick={handleSave}
                disabled={!oldPwd || pwdScore < 6}
                className="flex-1 rounded-full"
              >
                {t("profil.pwdModal.save")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
