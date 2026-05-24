import { Building2, Car, Shield } from "lucide-react";
import { useMemo } from "react";
import { buildPropertyCatalog, buildVehicleCatalog, PERSONAL_PRODUCTS } from "./catalogData.js";
import ProductionFooter from "./ProductionFooter.jsx";
import ProductionHeader from "./ProductionHeader.jsx";
import ProductionProductSection from "./ProductionProductSection.jsx";
import { clearSharedJourneyParams } from "./journeyAccess.js";
import { productionImageFor } from "./productionAssets.js";

export default function ProductionHome({
  sessionRole,
  sessionName,
  onOpenJourney,
  onSelectRole,
  onGuestLogin,
}) {
  const propertyItems = useMemo(
    () => ({
      safeItem: sessionRole === "internal" ? "property-internal" : "property-external",
      allRiskItem: sessionRole === "internal" ? "property-all-risk-internal" : "property-all-risk-external",
    }),
    [sessionRole],
  );
  const motorItem = useMemo(() => (sessionRole === "internal" ? "motor-internal" : "motor-external"), [sessionRole]);
  const carTloItem = useMemo(() => (sessionRole === "internal" ? "car-tlo-internal" : "car-tlo-external"), [sessionRole]);
  const carCompItem = useMemo(() => (sessionRole === "internal" ? "car-comp-internal" : ""), [sessionRole]);
  const productionPersonalProducts = useMemo(
    () => PERSONAL_PRODUCTS.map((item) => ({ ...item, image: productionImageFor(item) })),
    [],
  );
  const productionPropertyProducts = useMemo(
    () => buildPropertyCatalog(propertyItems).map((item) => ({ ...item, image: productionImageFor(item) })),
    [propertyItems],
  );
  const productionVehicleProducts = useMemo(
    () => buildVehicleCatalog({ motorItem, carTloItem, carCompItem, sessionRole }).map((item) => ({ ...item, image: productionImageFor(item) })),
    [carCompItem, carTloItem, motorItem, sessionRole],
  );

  return (
    <div className="production-page">
      <ProductionHeader
        sessionRole={sessionRole}
        sessionName={sessionName}
        onOpenProducts={() => {
          clearSharedJourneyParams();
          onOpenJourney("");
        }}
        onSelectRole={(nextRole) => {
          clearSharedJourneyParams();
          onSelectRole(nextRole);
          onOpenJourney("");
        }}
        onGuestLogin={onGuestLogin}
        onOpenJourney={onOpenJourney}
      />

      <main className="production-main">
        <h1>Pilihan Produk Asuransi Jasindo</h1>
        <ProductionProductSection
          icon={Shield}
          title="Asuransi Kecelakaan Diri"
          subtitle="Perlindungan biaya pengobatan akibat kecelakaan"
          items={productionPersonalProducts}
          onOpen={onOpenJourney}
        />
        <ProductionProductSection
          icon={Building2}
          title="Asuransi Harta Benda"
          subtitle="Perlindungan bangunan dan isi properti dengan simulasi premi dan penawaran digital."
          items={productionPropertyProducts}
          onOpen={onOpenJourney}
        />
        <ProductionProductSection
          icon={Car}
          title="Asuransi Kendaraan"
          subtitle="Perlindungan motor dan mobil dengan simulasi premi dan penawaran digital."
          items={productionVehicleProducts}
          onOpen={onOpenJourney}
        />
      </main>
      <ProductionFooter />
    </div>
  );
}
