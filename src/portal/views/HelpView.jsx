import React from "react";
import { ClipboardList, CreditCard, FileText, Headphones, Mail, Phone, Shield } from "lucide-react";
import { DEFAULT_OFFICIAL_CONTACTS } from "../portalData.js";
import { WorkPanel, PageIntro, SectionBox, SmallActionCard } from "../components/portalComponents.jsx";

const CONTACT_ICONS = {
  phone: Phone,
  mail: Mail,
  headphones: Headphones,
};

export function HelpView({ contacts }) {
  const primaryContact = contacts[0] || DEFAULT_OFFICIAL_CONTACTS[0];
  const helpTopics = [
    { title: "Saya butuh polis", helper: "Lihat, unduh PDF, atau minta cetakan fisik polis.", icon: Shield },
    { title: "Saya ingin lapor klaim", helper: "Siapkan kronologi, tanggal kejadian, dan foto/dokumen awal.", icon: FileText },
    { title: "Pembayaran dan perpanjangan", helper: "Cek tagihan, jatuh tempo, dan metode pembayaran aktif.", icon: CreditCard },
    { title: "Perubahan data", helper: "Panduan bila ada perubahan kontak, objek, atau data tertanggung.", icon: ClipboardList },
  ];
  const faqs = [
    { question: "Di mana saya bisa melihat nomor polis dan periode perlindungan?", answer: "Buka Polis Saya, lalu pilih polis untuk melihat detail periode dan nomor polis." },
    { question: "Apakah polis elektronik wajib dicetak untuk klaim?", answer: "Tidak. E-polis yang tersedia di portal cukup untuk pengajuan klaim digital." },
    { question: "Bagaimana cara meminta cetakan polis fisik?", answer: "Buka detail polis, pilih Minta Cetakan, lalu konfirmasi alamat pengiriman." },
    { question: "Dokumen apa saja yang perlu disiapkan saat mengajukan klaim?", answer: "Dokumen mengikuti jenis klaim dan akan ditampilkan di detail Klaim Saya." },
    { question: "Bagaimana jika pembayaran perpanjangan belum masuk?", answer: "Cek Keranjang untuk status tagihan dan metode pembayaran yang tersedia." },
    { question: "Kapan saya perlu menghubungi call center?", answer: "Hubungi call center jika data polis tidak sesuai, klaim mendesak, atau pengiriman cetakan belum terupdate." },
  ];

  return (
    <div className="space-y-3">
      <PageIntro
        title="Bantuan dan Call Center"
        description="Satu tempat untuk memilih kebutuhan bantuan dan menghubungi kanal resmi Jasindo."
        action={
          <a href={primaryContact.href} className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#F2A62A] px-4 text-[12px] font-bold text-white hover:bg-[#DF9620]">
            <Phone className="h-4 w-4" />
            {primaryContact.value}
          </a>
        }
      />

      <WorkPanel>
        <div className="grid gap-2 md:grid-cols-3">
          {contacts.map((contact) => {
            const Icon = typeof contact.icon === "string" ? CONTACT_ICONS[contact.icon] || Phone : contact.icon || Phone;
            return (
              <a key={contact.label} href={contact.href} className="flex min-w-0 items-center gap-3 rounded-lg border border-[#D9E1EA] bg-white px-3 py-2.5 hover:border-[#004B78]/60">
                <Icon className="h-4 w-4 shrink-0 text-[#004B78]" />
                <div className="min-w-0">
                  <div className="truncate text-[12px] font-bold text-[#041E42]">{contact.value}</div>
                  <div className="truncate text-[11px] text-[#5F7A99]">{contact.label} - {contact.helper}</div>
                </div>
              </a>
            );
          })}
        </div>
      </WorkPanel>

      <WorkPanel>
        <SectionBox title="Pilih Kebutuhan Bantuan" icon={Headphones}>
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
            {helpTopics.map((topic) => (
              <SmallActionCard key={topic.title} icon={topic.icon} title={topic.title} helper={topic.helper} />
            ))}
          </div>
        </SectionBox>

        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {faqs.map((item) => (
            <button key={item.question} type="button" className="rounded-lg border border-[#D9E1EA] bg-white px-3 py-2.5 text-left hover:bg-[#EEF5FA]">
              <span className="block text-[12px] font-bold text-[#304B68]">{item.question}</span>
              <span className="mt-1 block text-[11px] leading-4 text-[#5F7A99]">{item.answer}</span>
            </button>
          ))}
        </div>

        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[12px] leading-5 text-emerald-700">
          Simpan nomor polis dan foto kondisi objek pertanggungan. Saat klaim, dua hal ini biasanya mempercepat pengecekan awal.
        </div>
      </WorkPanel>
    </div>
  );
}
