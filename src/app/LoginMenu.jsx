import { ChevronDown, LogIn } from "lucide-react";
import { useState } from "react";

export default function LoginMenu({
  sessionRole,
  sessionName,
  onGuestLogin,
  onOpenJourney,
  onBeforeOpen = () => {},
}) {
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const isGuestSession = sessionRole === "guest";
  const isInternalSession = sessionRole === "internal";
  const accountPrimaryDestination = isInternalSession ? "internal-workspace" : "self-care-portal";
  const accountPrimaryLabel = isInternalSession ? "Ruang Kerja Saya" : "Polis Saya";

  function closeMenu() {
    setAccountMenuOpen(false);
  }

  function toggleMenu() {
    onBeforeOpen();
    setAccountMenuOpen((current) => !current);
  }

  if (isGuestSession) {
    return (
      <div className="production-account">
        <button
          type="button"
          className="production-login"
          onClick={() => {
            onBeforeOpen();
            onGuestLogin();
          }}
        >
          <LogIn size={17} strokeWidth={2.25} aria-hidden="true" />
          <span>Masuk</span>
        </button>
      </div>
    );
  }

  return (
    <div className="production-account">
      <button
        type="button"
        className="production-profile"
        aria-expanded={accountMenuOpen}
        aria-haspopup="menu"
        aria-controls="account-menu"
        onClick={toggleMenu}
      >
        <span className="production-profile__badge">ID</span>
        <span>{sessionName}</span>
        <ChevronDown size={15} strokeWidth={2.2} aria-hidden="true" />
      </button>
      <div id="account-menu" role="menu" className="production-menu" hidden={!accountMenuOpen}>
        <button
          type="button"
          role="menuitem"
          onClick={() => {
            closeMenu();
            onOpenJourney(accountPrimaryDestination);
          }}
        >
          {accountPrimaryLabel}
        </button>
        {isInternalSession ? (
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              closeMenu();
              onOpenJourney("partner-config");
            }}
          >
            Konfigurasi Partner
          </button>
        ) : null}
      </div>
    </div>
  );
}
