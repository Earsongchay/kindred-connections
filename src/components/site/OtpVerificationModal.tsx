import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

interface Props {
  title: string;
  description: string;
  validCode?: string;
  resendCooldownSeconds?: number;
  expirySeconds?: number;
  showSpamHint?: boolean;
  onVerified: () => void;
  onClose: () => void;
  laterLabel?: string;
  showDevHint?: boolean;
}

export function OtpVerificationModal({
  title,
  description,
  validCode = "111111",
  resendCooldownSeconds = 120,
  expirySeconds,
  showSpamHint = false,
  onVerified,
  onClose,
  laterLabel,
  showDevHint = false,
}: Props) {
  const { t } = useTranslation();
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const [cooldown, setCooldown] = useState(resendCooldownSeconds);
  const [resendCount, setResendCount] = useState(0);
  const [expiry, setExpiry] = useState(expirySeconds ?? 0);
  const [expired, setExpired] = useState(false);

  const code = digits.join("");

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((n) => n - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  // 10-min expiry countdown (§4.2.2)
  useEffect(() => {
    if (!expirySeconds) return;
    if (expired || expiry <= 0) {
      if (!expired) {
        setExpired(true);
        setDigits(Array(6).fill(""));
        setError(null);
        setAttempts(0);
        setCooldown(0);
      }
      return;
    }
    const id = setTimeout(() => setExpiry((n) => n - 1), 1000);
    return () => clearTimeout(id);
  }, [expiry, expired, expirySeconds]);

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted.length) return;
    e.preventDefault();
    const next = Array(6).fill("");
    pasted.split("").forEach((c, i) => {
      next[i] = c;
    });
    setDigits(next);
    const last = Math.min(pasted.length - 1, 5);
    document.getElementById(`otp-modal-${last}`)?.focus();
  };

  const verify = () => {
    if (code.length < 6 || locked || expired) return;
    if (code === validCode) {
      onVerified();
      return;
    }
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    if (newAttempts >= 3) {
      setError(t("dashboard.emailOtp.tooManyAttempts"));
      setLocked(true);
    } else {
      setError(t("dashboard.emailOtp.errorAttempts").replace("{count}", String(3 - newAttempts)));
    }
  };

  const handleResend = () => {
    if (resendCount >= 5) return;
    setResendCount((n) => n + 1);
    setCooldown(resendCooldownSeconds);
    if (expirySeconds) {
      setExpiry(expirySeconds);
      setExpired(false);
    }
    setDigits(Array(6).fill(""));
    setError(null);
    setAttempts(0);
    setLocked(false);
  };

  const expiryMm = String(Math.floor(expiry / 60)).padStart(2, "0");
  const expirySs = String(expiry % 60).padStart(2, "0");

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-border/60 bg-card p-7 shadow-2xl">
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        {showDevHint && (
          <p className="mt-1 text-xs text-blue-500">{validCode}</p>
        )}

        {expirySeconds ? (
          <div className="mt-3 text-center text-sm">
            {expired ? (
              <p className="text-red-600">{t("dashboard.emailOtp.expired")}</p>
            ) : (
              <p className="text-muted-foreground">
                {t("dashboard.emailOtp.validFor").replace("{time}", `${expiryMm}:${expirySs}`)}
              </p>
            )}
          </div>
        ) : null}

        <div className="mt-5 flex justify-center gap-2">
          {digits.map((d, i) => (
            <input
              key={i}
              id={`otp-modal-${i}`}
              value={d}
              disabled={locked || expired}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "").slice(-1);
                const next = [...digits];
                next[i] = v;
                setDigits(next);
                if (v && i < 5) document.getElementById(`otp-modal-${i + 1}`)?.focus();
              }}
              onPaste={i === 0 ? handlePaste : undefined}
              className="h-12 w-10 rounded-xl border border-input bg-background text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              inputMode="numeric"
              maxLength={1}
            />
          ))}
        </div>

        {error && <p className="mt-4 text-center text-sm text-red-600">{error}</p>}

        {showSpamHint && (
          <p className="mt-3 text-center text-xs text-muted-foreground">
            {t("dashboard.emailOtp.spamHint")}
          </p>
        )}

        <div className="mt-4 text-center text-sm text-muted-foreground">
          {resendCount >= 5 ? (
            <p>{t("dashboard.emailOtp.resendLimitReached")}</p>
          ) : cooldown > 0 ? (
            <span>
              {t("inscription.sms.resendTimer")}{" "}
              {String(Math.floor(cooldown / 60)).padStart(2, "0")}:
              {String(cooldown % 60).padStart(2, "0")}
            </span>
          ) : (
            <button onClick={handleResend} className="font-semibold text-primary hover:underline">
              {t("inscription.sms.resend")}
            </button>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1 rounded-full">
            {laterLabel ?? t("dashboard.emailOtp.later")}
          </Button>
          <Button
            onClick={verify}
            disabled={code.length < 6 || locked || expired}
            className="flex-1 rounded-full"
          >
            {t("dashboard.emailOtp.verify")}
          </Button>
        </div>
      </div>
    </div>
  );
}
