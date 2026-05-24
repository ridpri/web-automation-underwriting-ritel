export const PRODUCTION_ASSETS = {
  danantara: "/production-assets/danantara.57629308.png",
  jasindoWhite: "/production-assets/jasindo-white-all.814f5299.png",
  jasindoPositive: "/production-assets/Jasindo_Positive-2.adb9525c.png",
  iso: "/production-assets/iso-jasindo.0f9f4aa7.png",
  mari: "/production-assets/logo-mari-berasuransi.803b8b56.png",
  lifeGuard: "/production-assets/product-lintasan.df53665c.jpg",
  tripGuard: "/production-assets/product-kecelakaan-diri.31916e3d.jpg",
  eduProtect: "/production-assets/product-anak-sekolah.56785bac.jpg",
  travelSafe: "/production-assets/product-travel.51b3edff.jpg",
};

const PERSONAL_PRODUCT_IMAGE_BY_TITLE = {
  "Life Guard": PRODUCTION_ASSETS.lifeGuard,
  "Trip Guard": PRODUCTION_ASSETS.tripGuard,
  "Edu Protect": PRODUCTION_ASSETS.eduProtect,
  "Travel Safe": PRODUCTION_ASSETS.travelSafe,
};

export function productionImageFor(item) {
  return PERSONAL_PRODUCT_IMAGE_BY_TITLE[item.title] || item.image;
}
