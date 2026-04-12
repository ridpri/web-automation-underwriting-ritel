import { ChevronDown, Printer, ArrowLeft, FileText } from "lucide-react";
import { useMemo, useState } from "react";

function cls() {
  return Array.from(arguments).filter(Boolean).join(" ");
}

function SectionAccordion({ title, subtitle, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-4 bg-white px-5 py-4 text-left hover:bg-slate-50"
        aria-expanded={open}
      >
        <div>
          <h2 className="text-[17px] font-bold text-slate-900 md:text-[19px]">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-slate-600">{subtitle}</p> : null}
        </div>
        <ChevronDown className={cls("h-5 w-5 text-slate-500 transition", open && "rotate-180")} />
      </button>
      {open ? <div className="border-t border-slate-200 px-5 py-4">{children}</div> : null}
    </section>
  );
}

function VerticalFlowChart({ title, subtitle, steps }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <h3 className="text-[15px] font-bold text-[#0A4D82]">{title}</h3>
      {subtitle ? <p className="mt-1 text-sm text-slate-600">{subtitle}</p> : null}
      <ol className="mt-4 space-y-2">
        {steps.map((step, index) => (
          <li key={step.title} className="relative rounded-lg border border-slate-200 bg-white p-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0A4D82] text-xs font-bold text-white">
                {index + 1}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">{step.title}</p>
                <p className="mt-1 text-sm text-slate-600">{step.detail}</p>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </article>
  );
}

export default function PropertySafeBrdPage({ onBack }) {
  const [expandedAll, setExpandedAll] = useState(false);

  const endToEndSteps = useMemo(
    () => [
      { title: "Draft Internal dibuat", detail: "Internal mengisi data minimum tertanggung, lokasi, objek, dan parameter premi awal." },
      { title: "Indikasi dikirim", detail: "Sistem membuat link indikasi dengan masa berlaku, owner transaksi, dan jejak waktu kirim." },
      { title: "External melengkapi data", detail: "Calon tertanggung mengisi data underwriting lanjutan, unggah foto, dan consent." },
      { title: "Mesin validasi & repricing", detail: "Sistem mengecek kelengkapan, konsistensi, trigger material change, dan menghitung ulang premi jika perlu." },
      { title: "Review internal (jika trigger)", detail: "Tim internal memutuskan approve, revisi, atau reject sesuai rule underwriting." },
      { title: "Final quote aktif", detail: "Hanya satu versi final yang aktif; versi sebelumnya menjadi tidak valid untuk pembayaran." },
      { title: "Payment gate", detail: "Pembayaran dibuka hanya jika status final valid, consent true, foto wajib lengkap, dan belum expired." },
      { title: "Paid & handoff portal", detail: "Setelah callback sukses, status menjadi paid dan data dikirim ke portal polis." },
    ],
    [],
  );

  const internalExternalSteps = useMemo(
    () => [
      { title: "Internal: inisiasi transaksi", detail: "Membuat draft, memilih CIF/tertanggung baru, menetapkan objek pertanggungan." },
      { title: "External: interaksi self-service", detail: "Membuka link, mengisi data tambahan, dan memberikan persetujuan." },
      { title: "System: kontrol mutu data", detail: "Validasi mandatory field, format data, serta relasi antardata yang kritis." },
      { title: "Internal: quality gate", detail: "Menangani kasus exception, assisted flow, dan hasil review." },
      { title: "External + System: payment & closure", detail: "User bayar, sistem mengunci status paid, lanjut handoff ke portal." },
    ],
    [],
  );

  const businessRules = [
    ["BR-01", "Data minimum draft", "Nama tertanggung, kontak, alamat objek, okupasi, nilai pertanggungan wajib ada sebelum indikasi."],
    ["BR-02", "Link indikasi", "Link indikasi memiliki expiry dan tidak boleh dipakai jika status transaksi berubah ke invalid."],
    ["BR-03", "Material change", "Perubahan okupasi/jenis bangunan/nilai signifikan memicu repricing dan potensi review."],
    ["BR-04", "Version control", "Satu transaksi hanya boleh punya satu final quote aktif pada satu waktu."],
    ["BR-05", "Consent", "Consent wajib bernilai true sebelum tombol bayar diaktifkan."],
    ["BR-06", "Foto wajib", "Foto objek wajib lengkap; foto non-live tertentu dapat memicu verifikasi manual."],
    ["BR-07", "Payment gate", "Jika salah satu syarat gagal, sistem blok bayar dan tampilkan alasan spesifik."],
    ["BR-08", "Review decision", "Outcome review hanya: approve, revisi, reject; masing-masing punya transisi status berbeda."],
    ["BR-09", "Audit trail", "Setiap perubahan data material harus mencatat actor, timestamp, dan alasan perubahan."],
    ["BR-10", "Assisted flow", "Jika user minta bantuan, owner internal tercatat dan transaksi tidak membuat draft baru."],
    ["BR-11", "Expiry", "Quote expired tidak dapat dibayar; user harus menggunakan versi baru yang valid."],
    ["BR-12", "Handoff portal", "Handoff ke portal hanya terjadi dari status paid sukses."],
  ];

  const statusMatrix = [
    ["Draft Internal", "Internal", "Data minimum draft lengkap", "Indikasi Siap Dikirim"],
    ["Indikasi Terkirim", "System", "Link aktif dan terkirim", "Indikasi Dibuka / Menunggu Data Lanjutan"],
    ["Menunggu Data Lanjutan", "External", "External mengisi data", "Data Lanjutan Masuk / Minta Bantuan"],
    ["Pending Review Internal", "Internal", "Trigger review aktif", "Final Siap / Perlu Revisi / Reject"],
    ["Final Quote Aktif", "System", "Versi final valid dan belum expired", "Pending Payment"],
    ["Pending Payment", "External", "Payment gate lolos", "Paid / Tetap Pending dengan error"],
    ["Paid", "System", "Callback pembayaran sukses", "Handoff ke portal"],
    ["Reject / Void / Expired", "System/Internal", "Keputusan review atau expiry", "Follow-up / generate versi baru"],
  ];

  const detailedFields = [
    ["Data Tertanggung", "Nama, jenis customer, kontak, email, NPWP, PIC", "Nama & minimal satu kontak", "Format kontak, NPWP sesuai tipe customer"],
    ["Data Lokasi", "Alamat, kota, detail area, contact person lokasi", "Alamat + kota + detail lokasi", "Konsistensi alamat dan cakupan wilayah"],
    ["Data Obyek", "Jenis bangunan, okupasi, konstruksi, nilai pertanggungan", "Jenis, okupasi, konstruksi, nilai", "Trigger material change + repricing"],
    ["Dokumentasi Foto", "Foto fasad, interior, titik risiko", "Foto wajib sesuai checklist", "Live/non-live marker + quality check"],
    ["Data Underwriting", "Riwayat risiko, proteksi, occupancy detail", "Sesuai rule produk", "Trigger review sesuai matriks"],
    ["Consent & Persetujuan", "Consent pemrosesan data dan persetujuan quote", "Consent true", "Hard gate sebelum payment"],
    ["Data Pembayaran", "Metode bayar, reference, callback status", "Metode dipilih", "Validasi callback & idempotent paid update"],
  ];

  return (
    <div className="min-h-screen bg-[#F3F5F7] text-slate-900">
      <style>{`
        @media print {
          .brd-toolbar { display: none !important; }
          .brd-container { max-width: 100% !important; padding: 0 !important; }
          .brd-accordion { break-inside: avoid; page-break-inside: avoid; }
        }
      `}</style>

      <header className="sticky top-0 z-20 bg-[#0A4D82] shadow-sm brd-toolbar">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-3 px-4 py-3 md:px-6">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#A7D0F2]">Web Automation Underwriting Ritel</p>
            <h1 className="truncate text-[18px] font-bold text-white md:text-[20px]">BRD Property Safe - React Edition</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-lg bg-[#F5A623] px-3 py-2 text-sm font-semibold text-white"
            >
              <Printer className="h-4 w-4" />
              Print PDF
            </button>
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </button>
          </div>
        </div>
      </header>

      <main className="brd-container mx-auto max-w-[1200px] px-4 py-5 md:px-6 md:py-6">
        <section className="rounded-2xl bg-[linear-gradient(130deg,#0A4D82_0%,#0D5D9D_58%,#1472BD_100%)] p-5 text-white shadow-[0_16px_36px_rgba(10,77,130,0.25)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-[900px]">
              <h2 className="text-[30px] font-black leading-tight">Business Requirements Document</h2>
              <p className="mt-2 text-sm leading-7 text-white/95 md:text-[15px]">
                Dokumen ini menjelaskan cara kerja internal dan eksternal untuk produk Property Safe secara detail namun tetap mudah dijelaskan ke user.
                Struktur disusun untuk bisnis dan TI: alur proses, rule, status, validasi, exception, serta acceptance criteria implementasi.
              </p>
            </div>
            <div className="rounded-xl border border-white/30 bg-white/10 px-4 py-3 text-sm">
              <p><span className="font-semibold">Versi:</span> 1.0 React</p>
              <p><span className="font-semibold">Tanggal:</span> 12 April 2026</p>
              <p><span className="font-semibold">Scope:</span> Property Safe</p>
            </div>
          </div>
        </section>

        <section className="mt-4 rounded-xl border border-slate-200 bg-white p-4 brd-toolbar">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[#0A4D82]">
              <FileText className="h-5 w-5" />
              <p className="text-sm font-semibold">Kontrol tampilan dokumen</p>
            </div>
            <button
              type="button"
              onClick={() => setExpandedAll((v) => !v)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              {expandedAll ? "Tutup Semua Bab" : "Buka Semua Bab"}
            </button>
          </div>
        </section>

        <div className="mt-4 space-y-3">
          <div className="brd-accordion">
            <SectionAccordion title="1. Ringkasan Eksekutif" subtitle="Gambaran singkat yang bisa dipakai ke manajemen atau user awam" defaultOpen={expandedAll || true}>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="text-sm font-bold text-[#0A4D82]">Tujuan Bisnis</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                    <li>Mempercepat proses penawaran properti dari draft sampai payment.</li>
                    <li>Mengurangi error operasional melalui validasi dan payment gate.</li>
                    <li>Menjaga kualitas underwriting dengan review trigger yang terukur.</li>
                    <li>Menjamin handoff ke portal polis hanya dari status paid yang valid.</li>
                  </ul>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="text-sm font-bold text-[#0A4D82]">Penjelasan Cepat ke User</h3>
                  <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-700">
                    <li>Isi data dan dokumen sampai lengkap.</li>
                    <li>Jika ada data sensitif berubah, tim internal akan review dulu.</li>
                    <li>Kalau final quote valid, user bisa bayar.</li>
                    <li>Setelah bayar, data otomatis muncul di portal polis.</li>
                  </ol>
                </div>
              </div>
            </SectionAccordion>
          </div>

          <div className="brd-accordion">
            <SectionAccordion title="2. Cara Kerja Internal vs External" subtitle="Alur utama dijabarkan vertikal agar tidak terpotong" defaultOpen={expandedAll || true}>
              <div className="grid gap-3 lg:grid-cols-2">
                <VerticalFlowChart
                  title="Diagram A - End-to-End Property Safe"
                  subtitle="Urutan dari draft internal sampai handoff portal."
                  steps={endToEndSteps}
                />
                <VerticalFlowChart
                  title="Diagram B - Interaksi Internal / External / System"
                  subtitle="Fokus pada pembagian peran lintas aktor."
                  steps={internalExternalSteps}
                />
              </div>
              <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full text-sm">
                  <thead className="bg-[#EAF2FB] text-[#0A4D82]">
                    <tr>
                      <th className="border border-slate-200 px-3 py-2 text-left font-bold">Pertanyaan User</th>
                      <th className="border border-slate-200 px-3 py-2 text-left font-bold">Jawaban Praktis</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    <tr>
                      <td className="border border-slate-200 px-3 py-2">Kenapa belum bisa bayar?</td>
                      <td className="border border-slate-200 px-3 py-2">Payment gate belum lolos: bisa karena consent belum true, data belum lengkap, foto wajib belum memenuhi syarat, atau quote sudah expired.</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-200 px-3 py-2">Kenapa harga berubah?</td>
                      <td className="border border-slate-200 px-3 py-2">Ada perubahan data material yang memicu repricing dan mungkin review internal sehingga final quote berubah.</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-200 px-3 py-2">Setelah bayar apa yang terjadi?</td>
                      <td className="border border-slate-200 px-3 py-2">Sistem menerima callback pembayaran, status menjadi paid, lalu data otomatis dihandoff ke portal polis.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </SectionAccordion>
          </div>

          <div className="brd-accordion">
            <SectionAccordion title="3. Matriks Status dan Transisi" subtitle="Definisi status operasional dan arah pergerakan proses" defaultOpen={expandedAll}>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-sm">
                  <thead className="bg-[#EAF2FB] text-[#0A4D82]">
                    <tr>
                      <th className="border border-slate-200 px-3 py-2 text-left font-bold">Status</th>
                      <th className="border border-slate-200 px-3 py-2 text-left font-bold">Owner Utama</th>
                      <th className="border border-slate-200 px-3 py-2 text-left font-bold">Entry Criteria</th>
                      <th className="border border-slate-200 px-3 py-2 text-left font-bold">Next State</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {statusMatrix.map((row) => (
                      <tr key={row[0]}>
                        {row.map((cell) => (
                          <td key={cell} className="border border-slate-200 px-3 py-2 align-top">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionAccordion>
          </div>

          <div className="brd-accordion">
            <SectionAccordion title="4. Business Rules dan Gate Kontrol" subtitle="Aturan inti yang wajib dijaga saat implementasi" defaultOpen={expandedAll}>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-sm">
                  <thead className="bg-[#EAF2FB] text-[#0A4D82]">
                    <tr>
                      <th className="border border-slate-200 px-3 py-2 text-left font-bold">Kode</th>
                      <th className="border border-slate-200 px-3 py-2 text-left font-bold">Nama Rule</th>
                      <th className="border border-slate-200 px-3 py-2 text-left font-bold">Deskripsi</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {businessRules.map((row) => (
                      <tr key={row[0]}>
                        {row.map((cell) => (
                          <td key={cell} className="border border-slate-200 px-3 py-2 align-top">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionAccordion>
          </div>

          <div className="brd-accordion">
            <SectionAccordion title="5. Detail Requirement per Domain Data" subtitle="Kebutuhan field-level untuk bisnis dan TI" defaultOpen={expandedAll}>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-sm">
                  <thead className="bg-[#EAF2FB] text-[#0A4D82]">
                    <tr>
                      <th className="border border-slate-200 px-3 py-2 text-left font-bold">Domain</th>
                      <th className="border border-slate-200 px-3 py-2 text-left font-bold">Field Kunci</th>
                      <th className="border border-slate-200 px-3 py-2 text-left font-bold">Mandatory</th>
                      <th className="border border-slate-200 px-3 py-2 text-left font-bold">Validasi / Trigger</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {detailedFields.map((row) => (
                      <tr key={row[0]}>
                        {row.map((cell) => (
                          <td key={cell} className="border border-slate-200 px-3 py-2 align-top">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionAccordion>
          </div>

          <div className="brd-accordion">
            <SectionAccordion title="6. Exception Scenario dan Tindak Lanjut" subtitle="Daftar kondisi gagal dan aksi operasional yang disarankan" defaultOpen={expandedAll}>
              <div className="grid gap-3 md:grid-cols-2">
                <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="text-sm font-bold text-[#0A4D82]">Exception Prioritas Tinggi</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                    <li>Final quote invalid akibat perubahan material setelah finalisasi.</li>
                    <li>Foto wajib tidak valid atau tidak lengkap.</li>
                    <li>Payment callback timeout atau gagal sinkron.</li>
                    <li>Link indikasi expired saat user sedang melanjutkan pembayaran.</li>
                  </ul>
                </article>
                <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="text-sm font-bold text-[#0A4D82]">Aksi Respon yang Wajib</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                    <li>Tampilkan pesan error yang spesifik, bukan pesan umum.</li>
                    <li>Sediakan jalur kembali ke langkah perbaikan data yang tepat.</li>
                    <li>Catat reason code untuk audit dan analitik operasional.</li>
                    <li>Jika perlu, escalate otomatis ke antrean review internal.</li>
                  </ul>
                </article>
              </div>
            </SectionAccordion>
          </div>

          <div className="brd-accordion">
            <SectionAccordion title="7. Acceptance Criteria Implementasi" subtitle="Checklist minimum agar fitur dianggap selesai" defaultOpen={expandedAll}>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-700">
                  <li>Semua transisi status utama dan exception sesuai matriks status.</li>
                  <li>Payment gate memblokir transaksi jika rule wajib belum terpenuhi.</li>
                  <li>Perubahan material terbukti memicu repricing/review sesuai aturan.</li>
                  <li>Audit trail tersimpan lengkap untuk perubahan data penting.</li>
                  <li>Handoff portal hanya terjadi dari status paid yang valid.</li>
                  <li>Tampilan BRD responsif mobile/desktop dan siap print PDF tanpa konten terpotong.</li>
                </ol>
              </div>
            </SectionAccordion>
          </div>
        </div>
      </main>
    </div>
  );
}
