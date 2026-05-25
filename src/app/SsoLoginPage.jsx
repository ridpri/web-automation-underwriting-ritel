import { ArrowLeft, ArrowRight, CheckCircle2, CheckSquare, Home, KeyRound, LogIn, Mail, Package, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { PRODUCTION_ASSETS } from "./productionAssets.js";

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
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [error, setError] = useState("");
  const emailReady = isValidEmail(email);
  const passwordReady = password.trim().length >= 6;
  const resolvedRole = useMemo(() => resolveSsoRole(email), [email]);

  function handleLogin(event) {
    event.preventDefault();
    if (!emailReady) {
      setError("Masukkan email yang valid.");
      return;
    }
    if (!passwordReady) {
      setError("Masukkan password minimal 6 karakter.");
      return;
    }
    onAuthenticated({ email: email.trim(), sessionRole: resolvedRole });
  }

  function handleResetPassword(event) {
    event.preventDefault();
    if (!emailReady) {
      setError("Masukkan email kantor yang valid.");
      return;
    }
    setResetSent(true);
    setError("");
  }

  function showResetPassword() {
    setMode("reset-password");
    setResetSent(false);
    setError("");
  }

  function showLogin() {
    setMode("login");
    setResetSent(false);
    setError("");
  }

  return (
    <main className="sso-login-page">
      <header className="sso-login-header">
        <div className="sso-login-header__brand">
          <img src={PRODUCTION_ASSETS.danantara} alt="Danantara Indonesia" />
          <img src={PRODUCTION_ASSETS.jasindoWhite} alt="Asuransi Jasindo" />
        </div>
        <nav className="sso-login-nav" aria-label="Navigasi login">
          <button type="button" onClick={onBack}>
            <Home size={16} strokeWidth={2.2} aria-hidden="true" />
            <span>Beranda</span>
          </button>
          <button type="button" onClick={onBack}>
            <Package size={16} strokeWidth={2.2} aria-hidden="true" />
            <span>Produk</span>
          </button>
        </nav>
        <div className="sso-login-header__actions">
          <div className="sso-login-language" aria-label="Bahasa Indonesia">
            <span className="sso-login-language__flag" aria-hidden="true" />
            <span>ID</span>
          </div>
          <button type="button" className="sso-login-header__signin">
            <LogIn size={17} strokeWidth={2.25} aria-hidden="true" />
            <span>Masuk</span>
          </button>
        </div>
      </header>

      <section className="sso-login-shell" aria-label="Login SSO">
        <div className="sso-login-visual">
          <div className="sso-login-visual__copy">
            <h2>Dukung Kinerja, Perkuat Layanan</h2>
            <p>Masuk untuk menunjang aktivitas kerja, kolaborasi tim, dan layanan perusahaan.</p>
          </div>
        </div>
        <div className="sso-login-panel">
          {mode === "login" ? (
            <>
              <div className="sso-login-panel__intro">
                <img src={PRODUCTION_ASSETS.jasindoPositive} alt="Asuransi Jasindo" className="sso-login-panel__logo" />
                <div className="sso-login-panel__icon" aria-hidden="true">
                  <ShieldCheck size={26} strokeWidth={2.2} />
                </div>
                <div>
                  <h1>Masuk Menggunakan Password</h1>
                  <p>Gunakan email dan password akun internal untuk mengakses layanan perusahaan.</p>
                </div>
              </div>

              <form className="sso-login-form" onSubmit={handleLogin}>
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

                <label className="sso-login-field">
                  <span>Password</span>
                  <div className="sso-login-input">
                    <KeyRound size={18} strokeWidth={2.15} aria-hidden="true" />
                    <input
                      type="password"
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value);
                        setError("");
                      }}
                      placeholder="Masukkan password"
                      autoComplete="current-password"
                    />
                  </div>
                </label>

                <div className="sso-login-captcha" aria-label="Verifikasi keamanan">
                  <span className="sso-login-captcha__box" aria-hidden="true" />
                  <span>I'm not a robot</span>
                  <CheckSquare size={28} strokeWidth={1.8} aria-hidden="true" />
                </div>

                {error ? <div className="sso-login-error">{error}</div> : null}

                <button type="submit" className="sso-login-primary" disabled={!emailReady || !passwordReady}>
                  <span>Masuk</span>
                  <ArrowRight size={18} strokeWidth={2.3} aria-hidden="true" />
                </button>
                <button type="button" className="sso-login-secondary" onClick={showResetPassword}>
                  Lupa Password
                </button>
                <button type="button" className="sso-login-back" onClick={onBack}>
                  <ArrowLeft size={16} strokeWidth={2.3} aria-hidden="true" />
                  <span>Kembali ke beranda</span>
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="sso-login-panel__intro">
                <img src={PRODUCTION_ASSETS.jasindoPositive} alt="Asuransi Jasindo" className="sso-login-panel__logo" />
                <div className="sso-login-panel__icon" aria-hidden="true">
                  <KeyRound size={26} strokeWidth={2.2} />
                </div>
                <div>
                  <h1>Reset Password</h1>
                  <p>Masukkan email kantor untuk menerima tautan pengaturan ulang password.</p>
                </div>
              </div>

              <form className="sso-login-form" onSubmit={handleResetPassword}>
                <label className="sso-login-field">
                  <span>Email</span>
                  <div className="sso-login-input">
                    <Mail size={18} strokeWidth={2.15} aria-hidden="true" />
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        setResetSent(false);
                        setError("");
                      }}
                      placeholder="nama@asuransijasindo.co.id"
                      autoComplete="email"
                    />
                  </div>
                </label>

                <div className="sso-login-captcha" aria-label="Verifikasi keamanan">
                  <span className="sso-login-captcha__box" aria-hidden="true" />
                  <span>I'm not a robot</span>
                  <CheckSquare size={28} strokeWidth={1.8} aria-hidden="true" />
                </div>

                {resetSent ? (
                  <div className="sso-login-notice">
                    <CheckCircle2 size={18} strokeWidth={2.4} aria-hidden="true" />
                    <span>Tautan reset password telah dikirim ke email terdaftar.</span>
                  </div>
                ) : null}
                {error ? <div className="sso-login-error">{error}</div> : null}

                <button type="submit" className="sso-login-primary" disabled={!emailReady}>
                  <span>Kirim Link Reset</span>
                  <ArrowRight size={18} strokeWidth={2.3} aria-hidden="true" />
                </button>
                <button type="button" className="sso-login-back" onClick={showLogin}>
                  <ArrowLeft size={16} strokeWidth={2.3} aria-hidden="true" />
                  <span>Kembali ke login</span>
                </button>
              </form>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
