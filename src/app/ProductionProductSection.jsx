import { Building2, Car, ChevronDown, Plane, Shield } from "lucide-react";
import { createElement } from "react";

function cls() {
  return Array.from(arguments).filter(Boolean).join(" ");
}

function ProductionCategoryIcon({ category }) {
  if (category === "Perjalanan") return <Plane className="production-product-card__tag-icon" aria-hidden="true" />;
  if (category === "Harta Benda") return <Building2 className="production-product-card__tag-icon" aria-hidden="true" />;
  if (category === "Kendaraan Bermotor") return <Car className="production-product-card__tag-icon" aria-hidden="true" />;
  return <Shield className="production-product-card__tag-icon" aria-hidden="true" />;
}

function ProductionProductCard({ item, onClick }) {
  return (
    <button
      type="button"
      onClick={item.active ? onClick : undefined}
      className={cls("production-product-card", !item.active && "is-disabled")}
      aria-label={item.title}
    >
      <img
        src={item.image}
        alt=""
        width="640"
        height="720"
        loading="lazy"
        decoding="async"
        className="production-product-card__image"
      />
      <span className="production-product-card__shade" />
      <span className="production-product-card__tag">
        <ProductionCategoryIcon category={item.category} />
        <span>{item.category}</span>
      </span>
      <span className="production-product-card__title">{item.title}</span>
    </button>
  );
}

export default function ProductionProductSection({ icon, title, subtitle, items, onOpen }) {
  return (
    <section className="production-product-section">
      <div className="production-product-section__header">
        <div className="production-product-section__icon" aria-hidden="true">
          {createElement(icon, { size: 35, strokeWidth: 2.25 })}
        </div>
        <div className="production-product-section__copy">
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <ChevronDown className="production-product-section__chevron" aria-hidden="true" />
      </div>
      <div className={cls("production-product-grid", items.length === 3 && "is-three-column")}>
        {items.map((item) => (
          <ProductionProductCard key={item.title} item={item} onClick={() => onOpen(item.key)} />
        ))}
      </div>
    </section>
  );
}
