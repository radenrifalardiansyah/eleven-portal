export type Service = {
  slug: string;
  title: string;
  description: string;
  longDescription: string;
  benefits: string[];
  icon: string;
};

export const services: Service[] = [
  {
    slug: "web-development",
    title: "Web Development",
    description:
      "Jasa pembuatan website company profile, landing page, hingga aplikasi web custom yang cepat, responsif, dan mudah dikelola.",
    longDescription:
      "Kami membangun website yang cepat, responsif, dan mudah dikelola, mulai dari company profile, landing page, hingga aplikasi web custom. Setiap proyek dikerjakan dengan struktur kode yang rapi dan siap dikembangkan lebih lanjut.",
    benefits: [
      "Desain responsif di semua perangkat",
      "Performa loading yang cepat",
      "Struktur kode yang mudah dikembangkan",
      "Optimasi SEO dasar",
    ],
    icon: "/images/svg/web-development.svg",
  },
  {
    slug: "graphic-design",
    title: "Graphic Design",
    description:
      "Perkuat identitas visual brand kamu melalui logo, materi promosi, dan panduan brand yang konsisten di berbagai media.",
    longDescription:
      "Tim desain kami membantu memperkuat identitas visual brand kamu melalui logo, materi promosi, hingga panduan brand yang konsisten di berbagai media, baik cetak maupun digital.",
    benefits: [
      "Konsep desain custom sesuai brand",
      "Revisi hingga desain final disetujui",
      "File siap pakai (vector & raster)",
      "Konsisten di berbagai media",
    ],
    icon: "/images/svg/graphic-design.svg",
  },
  {
    slug: "mobile-applications",
    title: "Mobile Applications",
    description:
      "Pengembangan aplikasi mobile Android dan iOS yang intuitif, mulai dari desain, pengembangan, hingga rilis ke app store.",
    longDescription:
      "Kami mengembangkan aplikasi mobile untuk Android dan iOS yang intuitif dan sesuai kebutuhan bisnis kamu, mulai dari tahap desain, pengembangan, hingga rilis ke app store.",
    benefits: [
      "Kompatibel Android & iOS",
      "Antarmuka yang mudah digunakan",
      "Integrasi API & backend",
      "Pendampingan hingga rilis",
    ],
    icon: "/images/svg/ui-ux-design.svg",
  },
  {
    slug: "ui-ux-design",
    title: "UI UX Design",
    description:
      "Riset pengguna, wireframe, hingga prototype interaktif untuk pengalaman pengguna yang intuitif dan tampilan yang menarik.",
    longDescription:
      "Kami merancang pengalaman pengguna yang intuitif dan tampilan antarmuka yang menarik, dimulai dari riset pengguna, wireframe, hingga prototype interaktif yang siap diuji.",
    benefits: [
      "Riset & pemetaan kebutuhan pengguna",
      "Wireframe & prototype interaktif",
      "Desain antarmuka yang konsisten",
      "Uji coba kegunaan (usability testing)",
    ],
    icon: "/images/svg/product.svg",
  },
  {
    slug: "social-media",
    title: "Social Media",
    description:
      "Jaga konsistensi kehadiran brand kamu di media sosial lewat perencanaan konten, desain feed & story, dan copywriting yang tepat sasaran.",
    longDescription:
      "Kami membantu menjaga konsistensi kehadiran brand kamu di media sosial melalui perencanaan konten, desain feed & story, hingga copywriting yang sesuai dengan target audiens.",
    benefits: [
      "Perencanaan konten bulanan",
      "Desain feed & story menarik",
      "Copywriting yang sesuai target audiens",
      "Laporan performa konten",
    ],
    icon: "/images/svg/social-networking.svg",
  },
  {
    slug: "digital-marketing",
    title: "Digital Marketing",
    description:
      "Jangkau audiens yang tepat melalui strategi iklan berbayar, optimasi SEO, dan optimasi funnel konversi yang terukur.",
    longDescription:
      "Kami membantu bisnis kamu menjangkau audiens yang tepat melalui strategi pemasaran digital, mulai dari iklan berbayar, SEO, hingga optimasi funnel konversi.",
    benefits: [
      "Strategi iklan berbayar (Ads)",
      "Optimasi SEO",
      "Analisis & laporan performa",
      "Optimasi funnel konversi",
    ],
    icon: "/images/svg/usability.svg",
  },
];
