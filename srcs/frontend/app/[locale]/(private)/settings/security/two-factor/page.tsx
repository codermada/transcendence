"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/routing";
import { authClient } from "@/lib/auth/auth-client";
import QRCode from "qrcode";

import { Check, Copy, AlertCircle, ShieldCheck } from "@/components/icons";

type Step = "status" | "password" | "verify" | "complete" | "disable";

export default function TwoFactorPage() {
  const router = useRouter();

  const { data: session, isPending } = authClient.useSession();

  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  const [qrCode, setQrCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  const [step, setStep] = useState<Step>("status");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const twoFactorEnabled = session?.user?.twoFactorEnabled ?? false;

  useEffect(() => {
    if (isPending) return;
    if (!session) router.replace("/sign-in");
  }, [session, isPending, router]);

  function clearMessages() {
    setMessage("");
    setErrorMessage("");
  }

  function startEnable() {
    setPassword("");
    setVerificationCode("");
    setQrCode("");
    setBackupCodes([]);
    clearMessages();
    setStep("password");
  }

  function startDisable() {
    setPassword("");
    clearMessages();
    setStep("disable");
  }

  function startOver() {
    setPassword("");
    setVerificationCode("");
    setQrCode("");
    setBackupCodes([]);
    clearMessages();
    setStep("status");
  }

  async function enableTwoFactor() {
    if (!password) {
      setErrorMessage("Enter your current password.");
      return;
    }

    setLoading(true);
    clearMessages();

    try {
      const { data, error } = await authClient.twoFactor.enable({ password });

      if (error) {
        throw new Error(
          error.message ?? "Unable to enable two-factor authentication.",
        );
      }

      if (!data || data.method !== "totp" || !("totpURI" in data) || !data.totpURI) {
        throw new Error("The server did not return a TOTP setup URI.");
      }

      const qr = await QRCode.toDataURL(data.totpURI);

      setQrCode(qr);
      setBackupCodes(data.backupCodes ?? []);
      setStep("verify");
      setMessage(
        "Scan the QR code with your authenticator app, then enter the verification code.",
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to enable two-factor authentication.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function verifyTwoFactor() {
    if (verificationCode.length !== 6) {
      setErrorMessage("Enter the 6-digit verification code.");
      return;
    }

    setLoading(true);
    clearMessages();

    try {
      const { error } = await authClient.twoFactor.verifyTotp({
        code: verificationCode,
      });

      if (error) {
        throw new Error(error.message ?? "Invalid verification code.");
      }

      setStep("complete");
      setMessage("Two-factor authentication has been enabled successfully.");
      await authClient.getSession();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to verify the authentication code.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function disableTwoFactor() {
    if (!password) {
      setErrorMessage("Enter your current password.");
      return;
    }

    setLoading(true);
    clearMessages();

    try {
      const { error } = await authClient.twoFactor.disable({ password });

      if (error) {
        throw new Error(
          error.message ?? "Unable to disable two-factor authentication.",
        );
      }

      setPassword("");
      setStep("status");
      setMessage("Two-factor authentication has been disabled.");
      await authClient.getSession();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to disable two-factor authentication.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function copyBackupCode(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      setErrorMessage("Unable to copy backup code.");
    }
  }

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-24 text-sm text-muted">
        Loading security settings…
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="space-y-6">
      {/* ===== Header ===== */}
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Two-Factor Authentication
        </h1>
        <p className="mt-2 text-sm text-muted">
          Add an extra layer of security to your account using an
          authenticator app.
        </p>
      </header>

      {/* ===== Messages ===== */}
      {message && (
        <div
          role="status"
          className="
            flex items-start gap-3
            rounded-xl
            border border-brand-500/30
            bg-brand-500/10
            px-4 py-3
            text-sm text-brand-300
            shadow-[0_0_20px_rgb(139_92_246_/_0.08)]
          "
        >
          <Check className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          className="
            flex items-start gap-3
            rounded-xl
            border border-danger/30
            bg-danger/10
            px-4 py-3
            text-sm text-danger
            shadow-[0_0_20px_rgb(239_68_68_/_0.06)]
          "
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ===== Card ===== */}
      <section
        className="
          relative overflow-hidden
          rounded-2xl
          border border-border
          bg-surface/40
          p-5
          shadow-2xl
          shadow-black/20
          backdrop-blur-xl
          sm:p-6
        "
      >
        {/* Futuristic top line */}
        <div
          aria-hidden
          className="
            pointer-events-none
            absolute inset-x-10 top-0
            h-px
            bg-gradient-to-r
            from-transparent
            via-brand-500/50
            to-transparent
            shadow-[0_0_14px_rgb(139_92_246_/_0.35)]
          "
        />

        {step === "status" && (
          <StatusStep
            enabled={twoFactorEnabled}
            onEnable={startEnable}
            onDisable={startDisable}
          />
        )}

        {step === "password" && (
          <PasswordStep
            password={password}
            loading={loading}
            onPasswordChange={setPassword}
            onContinue={enableTwoFactor}
            onCancel={startOver}
          />
        )}

        {step === "verify" && (
          <VerifyStep
            qrCode={qrCode}
            verificationCode={verificationCode}
            loading={loading}
            onVerificationCodeChange={setVerificationCode}
            onVerify={verifyTwoFactor}
            onStartOver={startOver}
          />
        )}

        {step === "disable" && (
          <DisableStep
            password={password}
            loading={loading}
            onPasswordChange={setPassword}
            onDisable={disableTwoFactor}
            onCancel={startOver}
          />
        )}

        {step === "complete" && (
          <CompleteStep
            backupCodes={backupCodes}
            copiedCode={copiedCode}
            onCopyCode={copyBackupCode}
          />
        )}
      </section>
    </div>
  );
}

// ============================================================
// Steps
// ============================================================

function StatusStep({
  enabled,
  onEnable,
  onDisable,
}: {
  enabled: boolean;
  onEnable: () => void;
  onDisable: () => void;
}) {
  return (
    <div className="flex items-start gap-4">
      <div
        className="
          flex h-10 w-10 shrink-0
          items-center justify-center
          rounded-xl
          border border-brand-500/30
          bg-brand-500/10
          text-brand-400
          shadow-[0_0_20px_rgb(139_92_246_/_0.12)]
        "
      >
        <ShieldCheck className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-sm font-semibold text-foreground">
            Authenticator app
          </h2>

          <span
            className={
              enabled
                ? "badge-brand"
                : `
                  inline-flex items-center
                  rounded-full
                  border border-border
                  bg-surface
                  px-3 py-0.5
                  text-xs font-medium
                  text-muted
                `
            }
          >
            {enabled ? "Enabled" : "Disabled"}
          </span>
        </div>

        <p className="mt-1 text-xs leading-relaxed text-muted">
          {enabled
            ? "Your account is protected with two-factor authentication."
            : "Require a verification code from your authenticator app when signing in."}
        </p>

        <div className="mt-4">
          <button
            type="button"
            onClick={enabled ? onDisable : onEnable}
            className={enabled ? "btn-secondary" : "btn-primary"}
          >
            {enabled ? "Disable 2FA" : "Enable 2FA"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PasswordStep({
  password,
  loading,
  onPasswordChange,
  onContinue,
  onCancel,
}: {
  password: string;
  loading: boolean;
  onPasswordChange: (v: string) => void;
  onContinue: () => void;
  onCancel: () => void;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onContinue();
      }}
      className="space-y-5"
    >
      <div>
        <h2 className="text-sm font-semibold text-foreground">
          Confirm your password
        </h2>
        <p className="mt-1 text-xs text-muted">
          Enter your current password to continue.
        </p>
      </div>

      <input
        type="password"
        value={password}
        onChange={(e) => onPasswordChange(e.target.value)}
        autoComplete="current-password"
        placeholder="Your password"
        className="
          w-full rounded-xl
          border border-border
          bg-background
          px-3 py-2.5
          text-sm text-foreground
          placeholder:text-muted
          transition-colors
          focus:border-brand-500/50
          focus:outline-none
          focus:ring-2
          focus:ring-brand-500/20
        "
      />

      <div className="flex flex-col-reverse gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="btn-secondary flex-1 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading || !password}
          className="btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Please wait…" : "Continue"}
        </button>
      </div>
    </form>
  );
}

function VerifyStep({
  qrCode,
  verificationCode,
  loading,
  onVerificationCodeChange,
  onVerify,
  onStartOver,
}: {
  qrCode: string;
  verificationCode: string;
  loading: boolean;
  onVerificationCodeChange: (v: string) => void;
  onVerify: () => void;
  onStartOver: () => void;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onVerify();
      }}
      className="space-y-5"
    >
      <div>
        <h2 className="text-sm font-semibold text-foreground">
          Scan and verify
        </h2>
        <p className="mt-1 text-xs text-muted">
          Scan the QR code with your authenticator app, then enter the
          6-digit code.
        </p>
      </div>

      {qrCode && (
        <div className="flex justify-center">
          <div
            className="
              rounded-2xl
              border border-border
              bg-white
              p-3
              shadow-2xl
              shadow-black/40
            "
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrCode}
              alt="Two-factor authentication QR code"
              className="h-48 w-48"
            />
          </div>
        </div>
      )}

      <input
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        value={verificationCode}
        onChange={(e) =>
          onVerificationCodeChange(e.target.value.replace(/\D/g, ""))
        }
        placeholder="000000"
        className="
          w-full rounded-xl
          border border-border
          bg-background
          px-3 py-2.5
          text-center
          font-mono
          text-lg
          tracking-[0.5em]
          text-foreground
          placeholder:text-muted
          transition-colors
          focus:border-brand-500/50
          focus:outline-none
          focus:ring-2
          focus:ring-brand-500/20
        "
      />

      <div className="flex flex-col-reverse gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onStartOver}
          disabled={loading}
          className="btn-secondary flex-1 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Start over
        </button>

        <button
          type="submit"
          disabled={loading || verificationCode.length !== 6}
          className="btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Please wait…" : "Verify"}
        </button>
      </div>
    </form>
  );
}

function DisableStep({
  password,
  loading,
  onPasswordChange,
  onDisable,
  onCancel,
}: {
  password: string;
  loading: boolean;
  onPasswordChange: (v: string) => void;
  onDisable: () => void;
  onCancel: () => void;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onDisable();
      }}
      className="space-y-5"
    >
      <div>
        <h2 className="text-sm font-semibold text-danger">
          Disable two-factor authentication
        </h2>
        <p className="mt-1 text-xs text-muted">
          This will remove the extra layer of security from your account.
          Enter your password to confirm.
        </p>
      </div>

      <input
        type="password"
        value={password}
        onChange={(e) => onPasswordChange(e.target.value)}
        autoComplete="current-password"
        placeholder="Your password"
        className="
          w-full rounded-xl
          border border-border
          bg-background
          px-3 py-2.5
          text-sm text-foreground
          placeholder:text-muted
          transition-colors
          focus:border-danger/50
          focus:outline-none
          focus:ring-2
          focus:ring-danger/20
        "
      />

      <div className="flex flex-col-reverse gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="btn-secondary flex-1 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading || !password}
          className="
            flex-1
            inline-flex items-center justify-center
            rounded-xl
            bg-danger
            px-6 py-3
            text-sm font-semibold text-white
            transition-colors
            hover:bg-danger/90
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {loading ? "Please wait…" : "Disable 2FA"}
        </button>
      </div>
    </form>
  );
}

function CompleteStep({
  backupCodes,
  copiedCode,
  onCopyCode,
}: {
  backupCodes: string[];
  copiedCode: string | null;
  onCopyCode: (code: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-4">
        <div
          className="
            flex h-10 w-10 shrink-0
            items-center justify-center
            rounded-xl
            border border-brand-500/30
            bg-brand-500/10
            text-brand-400
            shadow-[0_0_20px_rgb(139_92_246_/_0.12)]
          "
        >
          <Check className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-sm font-semibold text-foreground">
            Two-factor authentication enabled
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Save these backup codes somewhere safe. Each code can be used
            once if you lose access to your authenticator app.
          </p>
        </div>
      </div>

      {backupCodes.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Backup codes
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-brand-400">
              One-time use
            </span>
          </div>

          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {backupCodes.map((code) => (
              <li key={code}>
                <button
                  type="button"
                  onClick={() => onCopyCode(code)}
                  className="
                    group/code
                    flex w-full items-center justify-between gap-3
                    rounded-xl
                    border border-border
                    bg-background
                    px-3 py-2.5
                    text-left
                    font-mono text-xs text-subtle
                    transition-colors
                    hover:border-border-hover
                    focus:outline-none
                    focus:ring-2
                    focus:ring-brand-500/20
                  "
                >
                  <span className="truncate">{code}</span>
                  <span
                    className="
                      shrink-0 text-muted
                      transition-colors
                      group-hover/code:text-brand-400
                    "
                  >
                    {copiedCode === code ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}