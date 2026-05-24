export default function JourneyFallback() {
  return (
    <div className="min-h-screen bg-[#F3F5F7] px-4 py-10 md:px-6">
      <div className="mx-auto max-w-[960px] rounded-[24px] border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#0A4D82]" />
        <div className="mt-4 text-[18px] font-semibold text-slate-900">Menyiapkan halaman</div>
        <div className="mt-2 text-sm text-slate-500">Komponen produk sedang dimuat agar halaman utama tetap ringan dan cepat dibuka.</div>
      </div>
    </div>
  );
}
