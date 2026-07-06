export type Project = {
  slug: string;
  title: string;
  category: string;
  year: string;
  image: string;
  href: string;
  description: string;
  longDescription: string;
  services: string[];
};

export const projects: Project[] = [
  {
    slug: "freeport-indonesia",
    title: "Freeport Indonesia",
    category: "Web Development - Visual Interaktif",
    year: "2019",
    image: "/images/portofolio1.jpg",
    href: "https://vip.kompas.com/perjalanan-kita-tembaga-dan-emas/",
    description: "Visual interaktif perjalanan tambang tembaga dan emas Freeport Indonesia.",
    longDescription:
      "Sebuah halaman visual interaktif yang mengangkat perjalanan panjang PT Freeport Indonesia dalam industri pertambangan tembaga dan emas. Dikemas dengan storytelling yang imersif, animasi scroll, dan data visual agar pengunjung dapat memahami perjalanan perusahaan secara menarik.",
    services: ["Web Development", "Visual Interaktif", "Storytelling"],
  },
  {
    slug: "kementerian-keuangan",
    title: "Kementerian Keuangan",
    category: "Web Development - Visual Interaktif",
    year: "2019",
    image: "/images/portofolio2.jpg",
    href: "https://vip.kompas.com/umi/",
    description: "Kampanye visual interaktif Usaha Mikro Indonesia bersama Kementerian Keuangan.",
    longDescription:
      "Proyek kolaborasi dengan Kementerian Keuangan untuk mengangkat kisah Usaha Mikro Indonesia (UMi) melalui halaman visual interaktif yang informatif, dilengkapi ilustrasi dan data statistik yang mudah dipahami masyarakat luas.",
    services: ["Web Development", "Visual Interaktif", "Data Visualization"],
  },
  {
    slug: "kementerian-pupr",
    title: "Kementerian PUPR",
    category: "Web Development - Visual Interaktif",
    year: "2018",
    image: "/images/portofolio3.jpg",
    href: "https://vip.kompas.com/serba-serbi-mudik/",
    description: "Halaman visual interaktif seputar mudik bersama Kementerian PUPR.",
    longDescription:
      "Halaman visual interaktif yang menyajikan informasi seputar mudik, mulai dari jalur alternatif hingga tips perjalanan, dikemas secara menarik untuk mendukung kampanye Kementerian PUPR menjelang musim mudik.",
    services: ["Web Development", "Visual Interaktif", "Infografis"],
  },
  {
    slug: "toyota-manufaktur-indonesia",
    title: "Toyota Manufaktur Indonesia",
    category: "Web Development - Visual Interaktif",
    year: "2018",
    image: "/images/portofolio4.jpg",
    href: "https://vip.kompas.com/dari-indonesia-untuk-dunia/",
    description: "Kisah perjalanan manufaktur Toyota Indonesia untuk pasar dunia.",
    longDescription:
      "Visual interaktif yang mengangkat kisah perjalanan Toyota Manufaktur Indonesia dalam memproduksi kendaraan berkualitas ekspor, menampilkan proses produksi dan pencapaian perusahaan dalam format yang mudah dinikmati.",
    services: ["Web Development", "Visual Interaktif", "Motion Graphic"],
  },
  {
    slug: "frisian-flag",
    title: "Frisian Flag",
    category: "Web Development - Visual Interaktif",
    year: "2018",
    image: "/images/portofolio5.jpg",
    href: "https://vip.kompas.com/keluarga-kuat-indonesia-hebat/",
    description: "Kampanye keluarga kuat Indonesia hebat bersama Frisian Flag.",
    longDescription:
      "Halaman kampanye interaktif yang mengangkat semangat keluarga Indonesia, dirancang dengan visual hangat dan elemen interaktif agar pesan kampanye Frisian Flag lebih mudah tersampaikan ke audiens.",
    services: ["Web Development", "Visual Interaktif", "Campaign Landing Page"],
  },
  {
    slug: "kawasaki-ninja",
    title: "Kawasaki Ninja",
    category: "Web Development - Visual Interaktif",
    year: "2019",
    image: "/images/portofolio6.jpg",
    href: "https://vip.kompas.com/jejak-roda-sang-pionir/",
    description: "Jejak sejarah Kawasaki Ninja sebagai pionir motor sport di Indonesia.",
    longDescription:
      "Halaman visual interaktif yang merunut jejak sejarah dan evolusi Kawasaki Ninja di Indonesia, lengkap dengan galeri produk dari masa ke masa dan elemen animasi yang dinamis.",
    services: ["Web Development", "Visual Interaktif", "Timeline Interaktif"],
  },
  {
    slug: "meet-kcm",
    title: "Meet KCM",
    category: "Web Development - Landing Page",
    year: "2017",
    image: "/images/portofolio7.jpg",
    href: "https://meetkcm.com",
    description: "Landing page acara Meet KCM dengan desain modern dan informatif.",
    longDescription:
      "Landing page untuk acara Meet KCM yang dirancang modern dan informatif, menampilkan detail acara, pembicara, hingga informasi pendaftaran dalam satu halaman yang mudah dinavigasi.",
    services: ["Web Development", "Landing Page", "UI/UX Design"],
  },
  {
    slug: "rs-jakarta-heart-center",
    title: "RS Jakarta Heart Center",
    category: "Web Development - Company Profile",
    year: "2017",
    image: "/images/portofolio8.jpg",
    href: "https://jakartaheartcenter.com",
    description: "Website company profile untuk RS Jakarta Heart Center.",
    longDescription:
      "Website company profile untuk RS Jakarta Heart Center yang menampilkan layanan, fasilitas, dan informasi dokter secara profesional, dirancang agar mudah diakses oleh pasien dan keluarga.",
    services: ["Web Development", "Company Profile", "UI/UX Design"],
  },
  {
    slug: "anugerah-telkomsel",
    title: "Anugerah Telkomsel",
    category: "Web Development - Visual Interaktif",
    year: "2016",
    image: "/images/portofolio9.jpg",
    href: "https://vip.kompas.com/telkomsel/",
    description: "Halaman visual interaktif ajang penghargaan Anugerah Telkomsel.",
    longDescription:
      "Halaman visual interaktif untuk mengangkat cerita dan momen ajang penghargaan Anugerah Telkomsel, dikemas dengan galeri foto dan narasi yang menarik bagi pengunjung.",
    services: ["Web Development", "Visual Interaktif", "Event Landing Page"],
  },
];
