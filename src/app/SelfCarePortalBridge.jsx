import { ArrowLeft, FileSearch, Search, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import PersonalPolicyPortal from "../portal/PersonalPolicyPortal.jsx";
import "../portal/portal.css";
import { buildSelfCarePortalModel } from "../platform/selfCareIntegration.js";

const DEMO_POLICIES = [
  {
    id: "policy-home",
    category: "Hunian utama",
    productName: "Asuransi Rumah Tinggal",
    objectName: "Rumah tinggal 2 lantai, Kebayoran Baru",
    policyNumber: "JSD-PROP-2026-100184",
    insuredValue: 1250000000,
    totalPremium: 3480000,
    paymentStatus: "Lunas",
    status: "Aktif",
    coverageStart: "12 Apr 2025",
    coverageEnd: "11 Apr 2026",
    benefits: ["Kebakaran", "Banjir", "Gempa bumi", "Kerusuhan"],
    claimChecklist: [
      "Foto area kerusakan dari beberapa sudut",
      "Kronologi singkat kejadian",
      "Daftar barang atau bagian bangunan yang terdampak",
      "Dokumen tambahan bila diminta surveyor",
    ],
    documents: ["E-polis", "Schedule benefit", "Bukti bayar", "Endorsement"],
  },
  {
    id: "policy-car",
    category: "Kendaraan pribadi",
    productName: "Asuransi Mobil Komprehensif",
    objectName: "Honda Brio RS 2023",
    policyNumber: "JSD-MTR-2026-220091",
    insuredValue: 228000000,
    totalPremium: 5260000,
    paymentStatus: "Lunas",
    status: "Aktif",
    coverageStart: "08 Jan 2026",
    coverageEnd: "07 Jan 2027",
    benefits: ["Kerusakan sendiri", "Tanggung jawab hukum", "Banjir dan angin topan"],
    claimChecklist: [
      "Foto kerusakan kendaraan",
      "Kronologi kejadian",
      "STNK atau data kendaraan",
      "Dokumen tambahan bila melibatkan pihak ketiga",
    ],
    documents: ["E-polis", "Kartu ringkasan polis", "Invoice", "Bukti bayar"],
  },
  {
    id: "policy-pa",
    category: "Perlindungan keluarga",
    productName: "Personal Accident Family",
    objectName: "Perlindungan kecelakaan diri keluarga",
    policyNumber: "JSD-PA-2026-300044",
    insuredValue: 500000000,
    totalPremium: 940000,
    paymentStatus: "Metode bayar perlu diperbarui",
    status: "Aktif",
    coverageStart: "01 Mar 2026",
    coverageEnd: "28 Feb 2027",
    benefits: ["Meninggal dunia akibat kecelakaan", "Cacat tetap", "Biaya perawatan darurat"],
    claimChecklist: [
      "Kronologi kejadian",
      "Surat dokter atau resume medis",
      "Kuitansi biaya perawatan bila ada reimbursement",
      "Dokumen identitas tertanggung",
    ],
    documents: ["E-polis", "Ringkasan manfaat", "Invoice", "Riwayat pembayaran"],
  },
  {
    id: "policy-home-2024",
    category: "Riwayat hunian",
    productName: "Asuransi Rumah Tinggal 2024",
    objectName: "Rumah tinggal lama, Bintaro Jaya",
    policyNumber: "JSD-PROP-2024-087512",
    insuredValue: 980000000,
    totalPremium: 3010000,
    paymentStatus: "Periode berakhir",
    status: "Berakhir",
    coverageStart: "12 Apr 2024",
    coverageEnd: "11 Apr 2025",
    benefits: ["Kebakaran", "Banjir"],
    claimChecklist: [
      "Lihat polis baru bila ingin melanjutkan perlindungan.",
      "Riwayat dokumen masih bisa dilihat dari daftar dokumen utama.",
    ],
    documents: ["E-polis 2024", "Bukti bayar 2024"],
  },
];

const DEMO_CLAIMS = [
  {
    id: "CLM-2602-8820",
    policyId: "policy-pa",
    title: "Biaya rawat inap kecelakaan",
    lossDate: "25 Feb 2026",
    reportedDate: "25 Feb 2026",
    status: "Dokumen kurang",
    stage: 2,
    amount: 8200000,
    nextAction: "Unggah surat dokter dan kuitansi asli agar review bisa dilanjutkan.",
    dueLabel: "Butuh tindak lanjut hari ini",
    assignedTo: "Tim klaim personal accident",
    nextUpdate: "Setelah dokumen masuk, review berikutnya dikirim maksimal 1 x 24 jam kerja.",
    requiredDocs: ["Surat dokter", "Kuitansi asli", "KTP tertanggung"],
    history: [
      { date: "25 Feb 2026", text: "Laporan awal diterima." },
      { date: "26 Feb 2026", text: "Tim klaim meminta dokumen medis tambahan." },
    ],
    canUpload: true,
    settled: false,
  },
  {
    id: "CLM-2602-9981",
    policyId: "policy-car",
    title: "Kerusakan bemper depan",
    lossDate: "28 Feb 2026",
    reportedDate: "28 Feb 2026",
    status: "Sedang disurvei",
    stage: 3,
    amount: 4500000,
    nextAction: "Tunggu hasil survei. Anda belum perlu mengirim dokumen tambahan.",
    dueLabel: "Update berikutnya paling lambat besok",
    assignedTo: "Claim Assessment Center",
    nextUpdate: "Hasil survei akan ditampilkan di portal dan dikirim ke email terdaftar.",
    requiredDocs: [],
    history: [
      { date: "28 Feb 2026", text: "Laporan klaim kendaraan diterima." },
      { date: "29 Feb 2026", text: "Jadwal survei dikonfirmasi." },
    ],
    canUpload: false,
    settled: false,
  },
  {
    id: "CLM-2512-0091",
    policyId: "policy-car",
    title: "Kehilangan sepeda motor",
    lossDate: "15 Des 2025",
    reportedDate: "15 Des 2025",
    status: "Selesai dibayar",
    stage: 4,
    amount: 21000000,
    nextAction: "Tidak ada tindakan lanjutan.",
    dueLabel: "Selesai",
    assignedTo: "Pembayaran klaim",
    nextUpdate: "Dana sudah ditransfer ke rekening tertanggung.",
    requiredDocs: [],
    history: [
      { date: "15 Des 2025", text: "Laporan awal diterima." },
      { date: "20 Des 2025", text: "Dokumen lengkap." },
      { date: "05 Jan 2026", text: "Pembayaran klaim dilakukan." },
    ],
    canUpload: false,
    settled: true,
  },
];

const DEMO_INVOICES = [
  {
    id: "INV-2604-1001",
    policyId: "policy-home",
    title: "Renewal polis rumah tinggal",
    dueDate: "11 Apr 2026",
    amount: 3520000,
    status: "Perlu dibayar",
    paymentMethod: "BCA Virtual Account",
    helper: "Bayar hari ini agar renewal tidak tertunda.",
  },
];

function cls(...classes) {
  return classes.filter(Boolean).join(" ");
}

function GuestLookupPortal({ onGoHome, sessionName }) {
  const [searchType, setSearchType] = useState("policy");
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();

  const policyResults = useMemo(() => {
    if (!normalizedQuery) return [];
    return DEMO_POLICIES.filter((policy) =>
      [policy.policyNumber, policy.productName, policy.objectName].some((field) =>
        String(field).toLowerCase().includes(normalizedQuery),
      ),
    );
  }, [normalizedQuery]);

  const claimResults = useMemo(() => {
    if (!normalizedQuery) return [];
    return DEMO_CLAIMS.filter((claim) =>
      [claim.id, claim.title, claim.status].some((field) =>
        String(field).toLowerCase().includes(normalizedQuery),
      ),
    );
  }, [normalizedQuery]);

  const hasResults = searchType === "policy" ? policyResults.length : claimResults.length;

  return (
    <div className="min-h-screen bg-[#F3F5F7]">
      <div className="bg-[#0A4D82] px-4 py-8 md:px-6 md:py-10">
        <div className="mx-auto max-w-[1100px]">
          <button
            type="button"
            onClick={onGoHome}
            className="inline-flex items-center gap-2 rounded-[12px] border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white hover:bg-white/15"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </button>
          <div className="mt-6 max-w-[720px]">
            <div className="inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white/95">
              {sessionName}
            </div>
            <div className="mt-5 text-[34px] font-black tracking-tight text-white md:text-[44px]">Cari polis atau klaim</div>
            <div className="mt-3 max-w-[640px] text-base leading-8 text-white/90">
              Masukkan nomor polis atau nomor klaim untuk melihat data yang tersedia sesuai informasi yang Anda butuhkan.
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1100px] px-4 py-6 md:px-6 md:py-8">
        <div className="rounded-[24px] border border-[#D9E1EA] bg-white p-5 shadow-sm md:p-6">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { key: "policy", label: "Cari nomor polis" },
              { key: "claim", label: "Cari nomor klaim" },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setSearchType(item.key)}
                className={cls(
                  "rounded-full px-4 py-2 text-sm font-semibold",
                  searchType === item.key ? "bg-[#0A4D82] text-white" : "bg-[#EEF3F8] text-slate-700",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-4 flex flex-col gap-3 md:flex-row">
            <div className="flex h-12 flex-1 items-center gap-3 rounded-2xl border border-[#D9E1EA] bg-white px-4">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={searchType === "policy" ? "Contoh: JSD-PROP-2026-100184" : "Contoh: CLM-2602-8820"}
                className="h-full w-full border-0 bg-transparent text-sm text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-[#0A4D82] focus-visible:ring-offset-2"
              />
            </div>
          </div>

          <div className="mt-6">
            {!normalizedQuery ? (
              <div className="rounded-2xl border border-dashed border-[#C9D8E8] bg-[#F8FBFE] px-5 py-8 text-center">
                <FileSearch className="mx-auto h-8 w-8 text-[#0A4D82]" />
                <div className="mt-3 text-base font-semibold text-slate-900">Masukkan nomor untuk mulai mencari</div>
                <div className="mt-2 text-sm leading-6 text-slate-600">
                  Untuk melindungi data, informasi baru ditampilkan setelah nomor polis atau nomor klaim dicari.
                </div>
              </div>
            ) : hasResults ? (
              <div className="space-y-3">
                {(searchType === "policy" ? policyResults : claimResults).map((item) =>
                  searchType === "policy" ? (
                    <div key={item.id} className="rounded-2xl border border-[#C9D8E8] bg-white px-4 py-4 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-[15px] font-semibold leading-6 text-[#00539F]">{item.productName}</div>
                          <div className="mt-1 text-sm leading-6 text-slate-600">{item.objectName}</div>
                          <div className="mt-2 inline-flex rounded-full bg-[#EEF3F8] px-3 py-1 text-xs font-semibold text-[#5F7A99]">
                            {item.policyNumber}
                          </div>
                        </div>
                        <div className="inline-flex rounded-full bg-[#EAF8EF] px-3 py-1 text-xs font-semibold text-[#1F8A52]">
                          {item.status}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div key={item.id} className="rounded-2xl border border-[#C9D8E8] bg-white px-4 py-4 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-[15px] font-semibold leading-6 text-[#00539F]">{item.title}</div>
                          <div className="mt-1 text-sm leading-6 text-slate-600">No. klaim {item.id}</div>
                          <div className="mt-2 text-sm text-slate-600">{item.nextAction}</div>
                        </div>
                        <div className="inline-flex rounded-full bg-[#FFF4E8] px-3 py-1 text-xs font-semibold text-[#A85A00]">
                          {item.status}
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-[#C9D8E8] bg-white px-5 py-8 text-center">
                <ShieldCheck className="mx-auto h-8 w-8 text-[#0A4D82]" />
                <div className="mt-3 text-base font-semibold text-slate-900">Data tidak ditemukan</div>
                <div className="mt-2 text-sm leading-6 text-slate-600">
                  Periksa kembali nomor yang dimasukkan atau gunakan kanal bantuan resmi bila Anda membutuhkan arahan.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SelfCarePortalBridge({ sessionRole = "external", sessionName = "Dita (External)", sessionRoleLabel = "Eksternal", onGoHome, onExit }) {
  if (sessionRole === "guest") {
    return <GuestLookupPortal sessionName={sessionName} onGoHome={onGoHome || onExit} />;
  }

  const portalModel = buildSelfCarePortalModel({
    customer: { name: sessionName },
    policies: DEMO_POLICIES,
    claims: DEMO_CLAIMS,
    invoices: DEMO_INVOICES,
    defaultTab: "policies",
  });

  return (
    <PersonalPolicyPortal
      sessionName={portalModel.sessionName}
      sessionRoleLabel={sessionRoleLabel}
      onGoHome={onGoHome}
      onExit={onExit}
      policies={portalModel.policies}
      claims={portalModel.claims}
      billingItems={portalModel.billingItems}
      contacts={portalModel.contacts}
      defaultTab={portalModel.defaultTab}
    />
  );
}
