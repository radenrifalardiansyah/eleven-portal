export type Product = {
  slug: string;
  name: string;
  category: string;
  price: string;
  description: string;
  longDescription: string;
  features: string[];
  gallery: string[];
  image: string;
};

export const products: Product[] = [
  {
    slug: "website-company-profile",
    name: "Website Company Profile",
    category: "Web Development",
    price: "Rp 3.500.000",
    description: "Website profil perusahaan yang modern, responsif, dan siap tampil profesional.",
    longDescription:
      "Paket Website Company Profile dirancang untuk membantu bisnis kamu tampil lebih kredibel di mata calon klien. Dibangun dengan desain modern, struktur konten yang jelas, dan tampilan yang responsif di semua perangkat, mulai dari desktop hingga smartphone. Cocok untuk perusahaan, instansi, maupun UMKM yang ingin memperkenalkan profil, layanan, dan portofolio mereka secara profesional di internet.",
    features: [
      "Desain custom sesuai identitas brand",
      "Hingga 5 halaman (Home, Tentang, Layanan, Portofolio, Kontak)",
      "Tampilan responsif di desktop & mobile",
      "Optimasi SEO dasar",
      "Formulir kontak terintegrasi email",
      "Gratis 1 tahun domain & hosting",
      "Garansi revisi 2x",
    ],
    gallery: ["/images/portofolio7.jpg", "/images/portofolio8.jpg", "/images/portofolio2.jpg"],
    image: "/images/portofolio7.jpg",
  },
  {
    slug: "website-e-commerce",
    name: "Website E-Commerce",
    category: "Web Development",
    price: "Rp 7.500.000",
    description: "Toko online lengkap dengan katalog produk, keranjang, dan integrasi pembayaran.",
    longDescription:
      "Wujudkan toko online kamu sendiri dengan paket Website E-Commerce. Dilengkapi dengan sistem katalog produk, keranjang belanja, checkout, hingga integrasi payment gateway agar transaksi pelanggan berjalan lancar dan aman. Panel admin yang mudah digunakan membuat kamu bisa mengelola produk, pesanan, dan stok tanpa perlu keahlian teknis.",
    features: [
      "Katalog produk & kategori tanpa batas",
      "Keranjang belanja & checkout otomatis",
      "Integrasi payment gateway (transfer, e-wallet, QRIS)",
      "Panel admin untuk kelola produk & pesanan",
      "Manajemen stok otomatis",
      "Tampilan responsif di semua perangkat",
      "Garansi revisi 2x",
    ],
    gallery: ["/images/portofolio1.jpg", "/images/portofolio4.jpg", "/images/portofolio6.jpg"],
    image: "/images/portofolio1.jpg",
  },
  {
    slug: "paket-branding-logo",
    name: "Paket Branding & Logo",
    category: "Graphic Design",
    price: "Rp 1.500.000",
    description: "Identitas visual brand mulai dari logo, palet warna, hingga brand guideline.",
    longDescription:
      "Bangun identitas visual yang kuat dan konsisten untuk bisnis kamu. Paket ini mencakup perancangan logo, pemilihan palet warna, tipografi, hingga panduan penggunaan brand (brand guideline) agar tampilan brand kamu tetap konsisten di semua media, baik cetak maupun digital.",
    features: [
      "3 pilihan konsep logo",
      "Revisi hingga desain final disetujui",
      "File logo format vector (AI, EPS, SVG) & raster (PNG, JPG)",
      "Panduan warna & tipografi brand",
      "Brand guideline (PDF)",
      "Mockup penerapan logo pada media",
    ],
    gallery: ["/images/portofolio8.jpg", "/images/graphic-design.png"],
    image: "/images/portofolio8.jpg",
  },
  {
    slug: "undangan-pernikahan-digital",
    name: "Undangan Pernikahan Digital",
    category: "Graphic Design",
    price: "Rp 500.000",
    description: "Undangan digital interaktif dengan desain elegan dan mudah dibagikan.",
    longDescription:
      "Sebarkan undangan pernikahan kamu secara praktis dan elegan melalui format digital. Dilengkapi dengan galeri foto, informasi acara, peta lokasi, hingga fitur ucapan online, sehingga tamu undangan bisa mengakses semua informasi acara hanya melalui satu tautan yang bisa dibagikan lewat WhatsApp maupun media sosial.",
    features: [
      "Desain elegan & dapat disesuaikan tema",
      "Galeri foto pasangan",
      "Informasi acara & hitung mundur (countdown)",
      "Peta lokasi acara terintegrasi",
      "Fitur ucapan & doa online",
      "Tautan mudah dibagikan ke WhatsApp/media sosial",
    ],
    gallery: ["/images/portofolio5.jpg", "/images/celebration.png"],
    image: "/images/portofolio5.jpg",
  },
  {
    slug: "paket-konten-media-sosial",
    name: "Paket Konten Media Sosial",
    category: "Digital Marketing",
    price: "Rp 2.000.000",
    description: "Konten feed dan story bulanan untuk menjaga konsistensi brand di media sosial.",
    longDescription:
      "Jaga konsistensi kehadiran brand kamu di media sosial dengan paket konten bulanan. Tim kreatif kami akan merancang konten feed dan story yang menarik dan sesuai dengan identitas brand, lengkap dengan copywriting agar pesan yang disampaikan lebih tepat sasaran ke audiens kamu.",
    features: [
      "12 desain feed per bulan",
      "8 desain story per bulan",
      "Copywriting untuk setiap konten",
      "Konsep konten mengikuti kalender bulanan",
      "Revisi hingga 2x per konten",
      "File siap unggah (format Instagram & TikTok)",
    ],
    gallery: ["/images/portofolio9.jpg"],
    image: "/images/portofolio9.jpg",
  },
  {
    slug: "aplikasi-reservasi-online",
    name: "Aplikasi Reservasi Online",
    category: "Web Development",
    price: "Rp 9.000.000",
    description: "Sistem reservasi berbasis web untuk mempermudah pemesanan pelanggan secara real-time.",
    longDescription:
      "Permudah proses pemesanan pelanggan dengan sistem reservasi online berbasis web. Cocok untuk restoran, klinik, salon, hingga penyedia jasa lainnya yang membutuhkan sistem booking real-time lengkap dengan notifikasi dan manajemen jadwal, sehingga mengurangi risiko bentrok jadwal dan mempercepat proses pemesanan.",
    features: [
      "Sistem booking real-time",
      "Manajemen jadwal & slot ketersediaan",
      "Notifikasi email/WhatsApp otomatis",
      "Panel admin untuk kelola reservasi",
      "Riwayat & laporan reservasi",
      "Tampilan responsif di semua perangkat",
    ],
    gallery: ["/images/portofolio3.jpg", "/images/portofolio9.jpg"],
    image: "/images/portofolio3.jpg",
  },
];
