import { getPropertyVariant } from "../propertyProductConfig.js";

export const PERSONAL_PRODUCTS = [
  {
    key: "https://esppa.asuransijasindo.co.id/product/kecelakaan-diri/705",
    title: "Life Guard",
    category: "Kecelakaan Diri",
    subtitle: "Perlindungan aktivitas harian terhadap risiko kecelakaan.",
    description: "Perlindungan menyeluruh dari risiko kecelakaan untuk tetap aktif, produktif, dan tenang menjalani aktivitas setiap hari.",
    image: "https://images.unsplash.com/photo-1516575150278-77136aed6920?auto=format&fit=crop&w=900&q=80",
    active: true,
  },
  {
    key: "https://esppa.asuransijasindo.co.id/product/kecelakaan-diri/728",
    title: "Trip Guard",
    category: "Kecelakaan Diri",
    subtitle: "Perlindungan perjalanan dan mobilitas pribadi.",
    description: "Perlindungan perjalanan yang menjaga mobilitas Anda tetap nyaman dengan manfaat kecelakaan diri yang praktis.",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    active: true,
  },
  {
    key: "https://esppa.asuransijasindo.co.id/product/kecelakaan-diri/anak-sekolah",
    title: "Edu Protect",
    category: "Kecelakaan Diri",
    subtitle: "Perlindungan aktivitas pendidikan dan pembelajaran.",
    description: "Perlindungan aktivitas belajar dan kegiatan pendidikan untuk membantu menjaga ketenangan keluarga.",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80",
    active: true,
  },
  {
    key: "https://esppa.asuransijasindo.co.id/product/kecelakaan-diri/794",
    title: "Travel Safe",
    category: "Perjalanan",
    subtitle: "Perlindungan perjalanan domestik dan internasional.",
    description: "Perlindungan perjalanan domestik maupun internasional untuk menjaga rencana perjalanan tetap terasa aman dan nyaman.",
    image: "https://images.unsplash.com/photo-1500835556837-99ac94a94552?auto=format&fit=crop&w=900&q=80",
    active: true,
  },
];

const PROPERTY_SAFE_VARIANT = getPropertyVariant("property-safe");
const PROPERTY_ALL_RISK_VARIANT = getPropertyVariant("property-all-risk");

export const PROPERTY_PRODUCTS = [
  {
    key: "property",
    title: PROPERTY_SAFE_VARIANT.title,
    category: "Harta Benda",
    subtitle: PROPERTY_SAFE_VARIANT.catalogSubtitle,
    description: PROPERTY_SAFE_VARIANT.catalogDescription,
    image: PROPERTY_SAFE_VARIANT.catalogImage,
    active: true,
  },
  {
    key: "property-all-risk",
    title: PROPERTY_ALL_RISK_VARIANT.title,
    category: "Harta Benda",
    subtitle: PROPERTY_ALL_RISK_VARIANT.catalogSubtitle,
    description: PROPERTY_ALL_RISK_VARIANT.catalogDescription,
    image: PROPERTY_ALL_RISK_VARIANT.catalogImage,
    active: true,
  },
];

export const VEHICLE_PRODUCTS = [
  {
    key: "motor-tlo",
    title: "Asuransi Sepeda Motor - Total Loss",
    category: "Kendaraan Bermotor",
    subtitle: "Perlindungan untuk sepeda motor terhadap kehilangan akibat pencurian atau kerusakan berat yang termasuk total loss sesuai ketentuan polis.",
    description: "Perlindungan untuk sepeda motor terhadap kehilangan akibat pencurian atau kerusakan berat yang termasuk total loss sesuai ketentuan polis.",
    image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=900&q=80",
    active: true,
  },
  {
    key: "mobil-tlo",
    title: "Asuransi Mobil - Total Loss",
    category: "Kendaraan Bermotor",
    subtitle: "Perlindungan mobil terhadap kerugian total akibat risiko yang dijamin polis.",
    description: "Perlindungan mobil terhadap kerugian total akibat risiko yang dijamin polis, termasuk pencurian dan kebakaran.",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80",
    active: true,
  },
  {
    key: "mobil-comp",
    title: "Asuransi Mobil Komprehensif",
    category: "Kendaraan Bermotor",
    subtitle: "Menjamin kerugian atau kerusakan pada Kendaraan Bermotor akibat tabrakan, benturan, terbalik, tergelincir, terperosok, perbuatan jahat, pencurian, dan kebakaran.",
    description: "Menjamin kerugian atau kerusakan pada Kendaraan Bermotor yang secara langsung disebabkan oleh tabrakan, benturan, terbalik, tergelincir, terperosok, perbuatan jahat, pencurian, dan kebakaran sesuai ketentuan polis.",
    image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=900&q=80",
    active: true,
  },
];

export function buildPropertyCatalog(propertyItems) {
  return PROPERTY_PRODUCTS.map((item) => ({
    ...item,
    key:
      item.key === "property"
        ? propertyItems.safeItem
        : item.key === "property-all-risk"
          ? propertyItems.allRiskItem
          : item.key,
  }));
}

export function buildVehicleCatalog({ motorItem, carTloItem }) {
  return VEHICLE_PRODUCTS.map((item) => ({
    ...item,
    active: item.active,
    key:
      item.key === "motor-tlo"
        ? motorItem
        : item.key === "mobil-tlo"
          ? carTloItem
          : item.key === "mobil-comp"
            ? "mobil-comp"
            : item.key,
  }));
}
