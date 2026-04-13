import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { imageSize } from "image-size";
import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  HeadingLevel,
  ImageRun,
  Packer,
  PageBreak,
  PageNumber,
  Paragraph,
  Table,
  TableCell,
  TableOfContents,
  TableRow,
  TextRun,
  WidthType,
} from "docx";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const assetsDir = path.join(__dirname, "assets");
const outputDir = path.join(__dirname, "output");
const outputFile = path.join(outputDir, "Lampiran Prosedur Penggunaan - Entri Internal.docx");

const page = {
  width: 11900,
  height: 16840,
  margin: {
    top: 1440,
    right: 843,
    bottom: 1440,
    left: 1355,
    header: 709,
    footer: 579,
  },
};

const landscapePage = {
  width: 16840,
  height: 11900,
  margin: {
    top: 1355,
    right: 1247,
    bottom: 568,
    left: 1440,
    header: 709,
    footer: 140,
  },
};

function title(text, size = 32) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 220 },
    children: [new TextRun({ text, bold: true, size })],
  });
}

function body(text, options = {}) {
  return new Paragraph({
    spacing: { after: options.after ?? 120, line: 360 },
    alignment: options.alignment ?? AlignmentType.JUSTIFIED,
    style: options.style,
    children: [new TextRun({ text, bold: options.bold ?? false, size: options.size ?? 22 })],
  });
}

function bullet(text) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 60, line: 320 },
    children: [new TextRun({ text, size: 22 })],
  });
}

function heading(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 120, after: 90 },
    children: [new TextRun({ text, bold: true, size: 24 })],
  });
}

function caption(text) {
  return new Paragraph({
    spacing: { after: 90 },
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text, italics: true, size: 20 })],
  });
}

function makeCell(text, width, bold = false, align = AlignmentType.LEFT) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 8, color: "444444" },
      bottom: { style: BorderStyle.SINGLE, size: 8, color: "444444" },
      left: { style: BorderStyle.SINGLE, size: 8, color: "444444" },
      right: { style: BorderStyle.SINGLE, size: 8, color: "444444" },
    },
    children: [
      new Paragraph({
        alignment: align,
        spacing: { after: 40 },
        children: [new TextRun({ text, bold, size: 20 })],
      }),
    ],
  });
}

function table(rows, widths) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rows.map((row, rowIndex) =>
      new TableRow({
        children: row.map((cellText, index) => makeCell(cellText, widths[index], rowIndex === 0)),
      }),
    ),
  });
}

async function imageParagraph(fileName, maxWidthPx = 980) {
  const filePath = path.join(assetsDir, fileName);
  const data = await fs.readFile(filePath);
  const size = imageSize(data);
  const ratio = Math.min(1, maxWidthPx / size.width);

  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 120 },
    children: [
      new ImageRun({
        data,
        transformation: {
          width: Math.round(size.width * ratio),
          height: Math.round(size.height * ratio),
        },
      }),
    ],
  });
}

async function buildDocument() {
  await fs.mkdir(outputDir, { recursive: true });

  const introTable = table(
    [
      ["No.", "Dokumen Referensi", "Keterangan"],
      ["1", "Source code web-automation-underwriting-ritel", "Dasar identifikasi alur internal, status transaksi, dan label layar."],
      ["2", "Deploy produksi web-automation-underwriting-ritel.vercel.app", "Dasar pengambilan bukti tampilan aktual yang dipakai dalam prosedur ini."],
      ["3", "Draft Lampiran Prosedur Underwriting", "Rujukan struktur dokumen, urutan bab, dan gaya lampiran prosedur."],
    ],
    [800, 3700, 4500],
  );

  const definitionTable = table(
    [
      ["Istilah", "Definisi"],
      ["Web Automation Underwriting Ritel", "Aplikasi web yang dipakai untuk simulasi premi, pengisian data, monitoring transaksi, dan tindak lanjut underwriting ritel."],
      ["Ruang Kerja Saya", "Halaman kerja personal milik user internal untuk memantau transaksi yang menjadi tanggung jawabnya."],
      ["Tinjauan Internal", "Antrean operasional lintas transaksi yang membutuhkan review, revisi, atau monitoring status."],
      ["Kirim Indikasi", "Aksi internal untuk membagikan penawaran awal kepada calon tertanggung melalui link, email, atau WhatsApp."],
      ["Siap Bayar", "Status yang menunjukkan transaksi telah lolos review dan dapat dilanjutkan ke pembayaran oleh calon tertanggung."],
    ],
    [3000, 6000],
  );

  const legendTable = table(
    [
      ["Simbol", "Makna"],
      ["Awal / Akhir", "Menandai titik mulai atau titik akhir proses internal."],
      ["Aktivitas", "Menandai aktivitas yang dikerjakan user internal pada aplikasi."],
      ["Review", "Menandai titik keputusan atau tindak lanjut underwriting internal."],
      ["Output", "Menandai hasil akhir berupa indikasi, transaksi kerja, atau status siap bayar."],
    ],
    [2200, 6800],
  );

  const document = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: "Calibri",
            size: 22,
          },
          paragraph: {
            spacing: { line: 360 },
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: { size: { width: page.width, height: page.height }, margin: page.margin },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: "PROSEDUR PENGGUNAAN", bold: true, size: 20 })],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ children: [PageNumber.CURRENT] })],
              }),
            ],
          }),
        },
        children: [
          new Paragraph({ spacing: { after: 800 } }),
          title("PROSEDUR PENGGUNAAN"),
          title("WEB AUTOMATION UNDERWRITING RITEL"),
          title("ENTRI INTERNAL", 28),
          body("TAHUN 2026", { alignment: AlignmentType.CENTER, bold: true, after: 800, size: 24 }),
          body("Dokumen ini merupakan lampiran prosedur penggunaan untuk jalur entri internal pada aplikasi Web Automation Underwriting Ritel. Kontennya disusun berdasarkan pemeriksaan source code, deploy aplikasi, dan bukti tampilan aktual.", {
            alignment: AlignmentType.CENTER,
            after: 320,
          }),
          new Paragraph({ children: [new PageBreak()] }),
          heading("PENGESAHAN"),
          body("Dokumen ini disiapkan sebagai draf kerja untuk kebutuhan penyusunan prosedur penggunaan Web Automation Underwriting Ritel pada jalur entri internal."),
          body("Unit pemilik proses: Group Underwriting Ritel."),
          body("Objek prosedur: proses penggunaan aplikasi untuk simulasi premi, pengisian data, pengiriman indikasi, dan pemantauan transaksi internal."),
          heading("CATATAN PERUBAHAN"),
          table(
            [
              ["Tanggal", "Versi", "Perubahan"],
              ["13 April 2026", "0.1", "Penyusunan draf awal prosedur penggunaan jalur entri internal."],
            ],
            [2200, 1200, 5400],
          ),
          heading("DAFTAR ISI"),
          new TableOfContents("Daftar Isi", {
            hyperlink: true,
            headingStyleRange: "1-3",
          }),
          heading("DAFTAR TABEL"),
          body("Tabel 1. Referensi"),
          body("Tabel 2. Istilah dan Definisi"),
          body("Tabel 3. Petunjuk Diagram"),
          heading("TUJUAN"),
          body("Prosedur penggunaan ini disusun sebagai petunjuk operasional bagi user internal saat menggunakan Web Automation Underwriting Ritel untuk membuat simulasi premi, mengirim indikasi, melengkapi data underwriting, serta memantau transaksi sampai siap ditindaklanjuti."),
          heading("RUANG LINGKUP"),
          body("Prosedur ini berlaku untuk user internal yang mengakses jalur Property Safe melalui katalog internal dan memanfaatkan fitur kerja berikut:"),
          bullet("membuka katalog produk internal;"),
          bullet("memilih produk Property Safe;"),
          bullet("mengisi data simulasi premi dan menghitung estimasi premi;"),
          bullet("mengirim indikasi kepada calon tertanggung;"),
          bullet("melanjutkan transaksi ke langkah Isi Data;"),
          bullet("memantau transaksi pada Ruang Kerja Saya dan Tinjauan Internal."),
          heading("REFERENSI"),
          body("Tabel 1. Referensi"),
          introTable,
          heading("DIAGRAM ALIR - FLOWCHART"),
          body("Flowchart berikut menggambarkan alur inti penggunaan jalur entri internal pada aplikasi."),
        ],
      },
      {
        properties: {
          page: {
            size: { width: landscapePage.width, height: landscapePage.height, orientation: "landscape" },
            margin: landscapePage.margin,
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: "PROSEDUR PENGGUNAAN", bold: true, size: 20 })],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ children: [PageNumber.CURRENT] })],
              }),
            ],
          }),
        },
        children: [
          await imageParagraph("07-flowchart-internal.png", 1150),
          caption("Gambar 1. Flowchart Prosedur Entri Internal"),
          heading("TANGGUNG JAWAB"),
          bullet("User internal membuka transaksi baru dan mengisi data minimum untuk simulasi premi."),
          bullet("User internal mengirim indikasi atau melanjutkan data underwriting sesuai kebutuhan transaksi."),
          bullet("User internal memantau status pada Ruang Kerja Saya dan menindaklanjuti transaksi yang memerlukan review."),
          heading("PENANGGUNG JAWAB"),
          bullet("Group Underwriting Ritel."),
          bullet("User internal / underwriter yang memegang transaksi."),
          bullet("Pihak reviewer internal sesuai antrean operasional."),
          heading("ISTILAH DAN DEFINISI"),
          body("Tabel 2. Istilah dan Definisi"),
          definitionTable,
          heading("PETUNJUK DIAGRAM"),
          body("Tabel 3. Petunjuk Diagram"),
          legendTable,
          heading("001/PRC/WAU/2026/001 - PROSES ENTRI INTERNAL"),
          body("Berikut adalah bukti layar dan penjelasan langkah penggunaan jalur internal pada aplikasi."),
          await imageParagraph("01-beranda-internal.png", 1100),
          caption("Gambar 2. Beranda internal Web Automation Underwriting Ritel"),
          body("1. Buka aplikasi Web Automation Underwriting Ritel melalui link produksi. Pastikan sesi aktif berada pada peran Internal."),
          body("2. Pada beranda utama, pilih produk yang akan diproses. Untuk prosedur ini, produk yang digunakan sebagai contoh adalah Property Safe."),
          await imageParagraph("02-simulasi-dan-hasil-premi.png", 1100),
          caption("Gambar 3. Langkah simulasi premi dan hasil perhitungan awal"),
          body("3. Isi data minimum pada Langkah 1, yaitu Nama / CIF, nomor handphone, alamat email, jenis bangunan, penggunaan bangunan, kelas konstruksi, lokasi, dan rincian obyek pertanggungan."),
          body("4. Klik tombol Cek Premi untuk menampilkan estimasi premi, rincian jaminan dasar, serta pilihan perluasan jaminan."),
          await imageParagraph("03-modal-kirim-indikasi.png", 1100),
          caption("Gambar 4. Modal Kirim Indikasi"),
          body("5. Setelah hasil premi tersedia, user internal dapat menggunakan tombol Kirim Indikasi untuk membagikan penawaran awal melalui link, email, atau WhatsApp."),
          await imageParagraph("04-langkah-isi-data.png", 1100),
          caption("Gambar 5. Langkah Isi Data lanjutan"),
          body("6. Bila transaksi akan dilanjutkan, klik tombol Isi Data untuk masuk ke Langkah 2."),
          body("7. Pada Langkah 2, lengkapi data underwriting lanjutan, termasuk data identitas, informasi lokasi, proteksi kebakaran, riwayat klaim, dan foto obyek sesuai kebutuhan transaksi."),
          await imageParagraph("05-ruang-kerja-saya.png", 1100),
          caption("Gambar 6. Ruang Kerja Saya"),
          body("8. Gunakan menu Ruang Kerja Saya untuk memantau transaksi yang menjadi tanggung jawab user internal."),
          await imageParagraph("06-tinjauan-internal.png", 1100),
          caption("Gambar 7. Tinjauan Internal"),
          body("9. Gunakan menu Tinjauan Internal untuk melihat antrean operasional, status transaksi, audit feed, dan titik tindak lanjut underwriting."),
        ],
      },
      {
        properties: {
          page: { size: { width: page.width, height: page.height }, margin: page.margin },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: "PROSEDUR PENGGUNAAN", bold: true, size: 20 })],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ children: [PageNumber.CURRENT] })],
              }),
            ],
          }),
        },
        children: [
          body("10. Hasil akhir dari prosedur ini adalah tersusunnya draft transaksi internal, terkirimnya indikasi, atau tersedianya transaksi yang siap ditinjau lebih lanjut sampai siap bayar sesuai hasil review internal."),
          heading("PENUTUP"),
          body("Dokumen ini dapat dijadikan master untuk penyusunan prosedur penggunaan berikutnya pada jalur entri external, tanpa login, dan partner. Struktur bab, bentuk tabel, serta penempatan bukti layar sengaja dibuat konsisten agar proses turunan dokumennya tetap seragam."),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(document);
  await fs.writeFile(outputFile, buffer);
}

buildDocument().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
