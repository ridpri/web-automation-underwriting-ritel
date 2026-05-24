import { ChevronDown, Home, Package } from "lucide-react";
import { useEffect, useState } from "react";
import LoginMenu from "./LoginMenu.jsx";
import { SESSION_OPTIONS } from "./sessionConfig.js";
import { resolveRoleLabel } from "./journeyAccess.js";
import { PRODUCTION_ASSETS } from "./productionAssets.js";

function cls() {
  return Array.from(arguments).filter(Boolean).join(" ");
}

export default function ProductionHeader({
  sessionRole,
  sessionName,
  onOpenProducts,
  onSelectRole,
  onGuestLogin,
  onOpenJourney,
}) {
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [roleMenuPrewarm, setRoleMenuPrewarm] = useState(false);
  const roleMenuVisible = roleMenuOpen || roleMenuPrewarm;

  const closeMenus = () => {
    setRoleMenuOpen(false);
  };

  useEffect(() => {
    const win = typeof window !== "undefined" ? window : null;
    if (!win) return undefined;

    let cancelled = false;
    let firstFrame = 0;
    let secondFrame = 0;
    const timeout = win.setTimeout(() => {
      if (cancelled) return;
      setRoleMenuPrewarm(true);
      firstFrame = win.requestAnimationFrame(() => {
        secondFrame = win.requestAnimationFrame(() => {
          if (!cancelled) setRoleMenuPrewarm(false);
        });
      });
    }, 0);

    return () => {
      cancelled = true;
      win.clearTimeout(timeout);
      win.cancelAnimationFrame(firstFrame);
      win.cancelAnimationFrame(secondFrame);
    };
  }, []);

  return (
    <header className="production-header">
      <div className="production-header__inner">
        <div className="production-header__brand">
          <img src={PRODUCTION_ASSETS.danantara} alt="Danantara Indonesia" />
          <img src={PRODUCTION_ASSETS.jasindoWhite} alt="Asuransi Jasindo" />
        </div>

        <nav className="production-nav" aria-label="Navigasi utama">
          <button
            type="button"
            className="production-nav__item"
            onClick={() => {
              window.location.href = "https://esppa.asuransijasindo.co.id/";
            }}
          >
            <Home size={16} strokeWidth={2.2} aria-hidden="true" />
            <span>Beranda</span>
          </button>
          <button
            type="button"
            className="production-nav__item is-active"
            onClick={() => {
              closeMenus();
              onOpenProducts();
            }}
          >
            <Package size={16} strokeWidth={2.2} aria-hidden="true" />
            <span>Produk</span>
          </button>
        </nav>

        <div className="production-actions">
          <div className="production-view-as">
            <button
              type="button"
              className="production-view-as__button"
              aria-label={`View as ${resolveRoleLabel(sessionRole)}`}
              aria-expanded={roleMenuOpen}
              aria-haspopup="menu"
              aria-controls="production-role-menu"
              onClick={() => {
                setRoleMenuOpen((current) => !current);
              }}
            >
              <span className="production-view-as__label">View as</span>
              <span className="production-view-as__value">{resolveRoleLabel(sessionRole)}</span>
              <ChevronDown
                className={cls("production-view-as__chevron", roleMenuOpen && "is-open")}
                size={15}
                strokeWidth={2.2}
                aria-hidden="true"
              />
            </button>
            <div
              id="production-role-menu"
              role="menu"
              className={cls("production-menu production-menu--role", roleMenuPrewarm && !roleMenuOpen && "is-prewarming")}
              aria-hidden={roleMenuPrewarm && !roleMenuOpen ? "true" : undefined}
              hidden={!roleMenuVisible}
            >
              {SESSION_OPTIONS.map((item) => (
                <button
                  type="button"
                  role="menuitem"
                  key={item.key}
                  onClick={() => {
                    closeMenus();
                    onSelectRole(item.key);
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <button type="button" className="production-language" aria-label="Bahasa Indonesia">
            <span className="production-language__flag" aria-hidden="true" />
            <span>ID</span>
          </button>
          <LoginMenu
            sessionRole={sessionRole}
            sessionName={sessionName}
            onGuestLogin={onGuestLogin}
            onOpenJourney={onOpenJourney}
            onBeforeOpen={() => setRoleMenuOpen(false)}
          />
        </div>
      </div>
    </header>
  );
}
