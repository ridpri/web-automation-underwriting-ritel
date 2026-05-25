import { ArrowLeft, ArrowRight, KeyRound, Mail, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { PRODUCTION_ASSETS } from "./productionAssets.js";

const DEMO_OTP = "246810";

function resolveSsoRole(email) {
  const normalized = String(email || "").trim().toLowerCase();
  if (normalized.includes("partner")) return "partner";
  if (normalized.includes("customer") || normalized.includes("nasabah") || normalized.includes("external")) return "external";
  return "internal";
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

export default function SsoLoginPage({ onAuthenticated, onBack }) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const emailReady = isValidEmail(email);
  const otpReady = otp.trim().length >= 6;
  const resolvedRole = useMemo(() => resolveSsoRole(email), [email]);

  function handleSendOtp(event) {
    event.preventDefault();
    if (!emailReady) {
      setError("Masukkan email yang valid.");
      return;
    }
    setOtpSent(true);
    setError("");
  }

  function handleVerifyOtp(event) {
    event.preventDefault();
    if (!otpSent) {
      handleSendOtp(event);
      return;
    }
    if (otp.trim() !== DEMO_OTP) {
      setError("OTP tidak sesuai.");
      return;
    }
    onAuthenticated({ email: email.trim(), sessionRole: resolvedRole });
  }

  return (
    <main className="sso-login-page">
      <section className="sso-login-shell" aria-label="Login SSO">
        <div className="sso-login-brand">
          <img src={PRODUCTION_ASSETS.danantara} alt="Danantara Indonesia" />
          <img src={PRODUCTION_ASSETS.jasindoWhite} alt="Asuransi Jasindo" />
        </div>
        <div className="sso-login-panel">
          <button type="button" className="sso-login-back" onClick={onBack}>
            <ArrowLeft size={16} strokeWidth={2.3} aria-hidden="true" />
            <span>Kembali</span>
          </button>
          <div className="sso-login-panel__intro">
            <div className="sso-login-panel__icon" aria-hidden="true">
              <ShieldCheck size={26} strokeWidth={2.2} />
            </div>
            <div>
              <h1>Login SSO</h1>
              <p>Masuk dengan email terdaftar dan OTP.</p>
            </div>
          </div>

          <form className="sso-login-form" onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}>
            <label className="sso-login-field">
              <span>Email</span>
              <div className="sso-login-input">
                <Mail size={18} strokeWidth={2.15} aria-hidden="true" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError("");
                  }}
                  placeholder="nama@asuransijasindo.co.id"
                  autoComplete="email"
                />
              </div>
            </label>

            <button type="button" className="sso-login-secondary" disabled={!emailReady} onClick={handleSendOtp}>
              Kirim OTP
            </button>

            <label className="sso-login-field">
              <span>OTP</span>
              <div className="sso-login-input">
                <KeyRound size={18} strokeWidth={2.15} aria-hidden="true" />
                <input
                  type="text"
                  inputMode="numeric"
                  value={otp}
                  onChange={(event) => {
                    setOtp(event.target.value.replace(/\D/g, "").slice(0, 6));
                    setError("");
                  }}
                  placeholder="6 digit OTP"
                  autoComplete="one-time-code"
                  disabled={!otpSent}
                />
              </div>
            </label>

            {otpSent ? <div className="sso-login-otp">OTP demo: {DEMO_OTP}</div> : null}
            {error ? <div className="sso-login-error">{error}</div> : null}

            <button type="submit" className="sso-login-primary" disabled={!emailReady || !otpSent || !otpReady}>
              <span>Masuk</span>
              <ArrowRight size={18} strokeWidth={2.3} aria-hidden="true" />
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
