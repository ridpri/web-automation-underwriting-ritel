import { MapPin, Phone } from "lucide-react";
import { PRODUCTION_ASSETS } from "./productionAssets.js";

function InstagramLogo() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="5" y="5" width="14" height="14" rx="4" />
      <circle cx="12" cy="12" r="3.2" />
      <circle cx="16.6" cy="7.4" r="1" />
    </svg>
  );
}

function FacebookLogo() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M14 8.2h2V5h-2.6c-3 0-4.6 1.7-4.6 4.5v1.7H6.5v3.3h2.3V21h3.6v-6.5h2.9l.5-3.3h-3.4V9.8c0-1 .4-1.6 1.6-1.6Z" />
    </svg>
  );
}

function XLogo() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M6 5h3.5l3 4.2L16.2 5H19l-5 5.7L19.7 19h-3.5l-3.5-5-4.4 5H5.5l5.7-6.5L6 5Zm2.2 1.6 8.8 10.8h.6L8.8 6.6h-.6Z" />
    </svg>
  );
}

export default function ProductionFooter() {
  return (
    <footer className="production-footer">
      <div className="production-footer__main">
        <div className="production-footer__brand">
          <img src={PRODUCTION_ASSETS.jasindoPositive} alt="Asuransi Jasindo" />
          <div className="production-footer__socials" aria-label="Media sosial Jasindo">
            <a href="https://www.instagram.com/asuransijasindo" aria-label="Instagram Asuransi Jasindo">
              <InstagramLogo />
            </a>
            <a href="https://www.facebook.com/AsuransiJasindo" aria-label="Facebook Asuransi Jasindo">
              <FacebookLogo />
            </a>
            <a href="https://x.com/asuransijasindo" aria-label="X Asuransi Jasindo">
              <XLogo />
            </a>
          </div>
        </div>
        <div className="production-footer__contact">
          <h2>Hubungi Kami</h2>
          <div className="production-footer__info">
            <MapPin size={20} strokeWidth={2.2} aria-hidden="true" />
            <div>
              <strong>Graha Jasindo</strong>
              <span>Jln. Menteng Raya No. 21 Jakarta Pusat, 10340</span>
            </div>
          </div>
          <div className="production-footer__info">
            <Phone size={20} strokeWidth={2.2} aria-hidden="true" />
            <div>
              <strong>Contact Center</strong>
              <span>1500073</span>
            </div>
          </div>
        </div>
        <div className="production-footer__links">
          <h2>Tautan Cepat</h2>
          <a href="https://asuransijasindo.co.id/">Website Asuransi Jasindo</a>
          <a href="https://asuransijasindo.co.id/representative-office">Representative Office</a>
          <a href="https://asuransijasindo.co.id/privacy-policy">Pusat Privasi</a>
        </div>
        <div className="production-footer__certs">
          <img src={PRODUCTION_ASSETS.iso} alt="ISO Jasindo" />
          <img src={PRODUCTION_ASSETS.mari} alt="Pahami dan Miliki Asuransi" />
        </div>
      </div>
      <div className="production-footer__bar">
        <span>Copyright 2026 PT. Asuransi Jasa Indonesia, Hak Cipta Dilindungi Undang-undang</span>
        <span>PT Asuransi Jasa Indonesia Berizin dan Diawasi oleh OJK</span>
      </div>
    </footer>
  );
}
