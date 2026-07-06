export type TeamMember = {
  slug: string;
  name: string;
  position: string;
  bio: string;
  longBio: string;
  email: string;
  socials: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
};

export const team: TeamMember[] = [
  {
    slug: "andika-pratama",
    name: "Andika Pratama",
    position: "Chief Executive Officer",
    bio: "Memimpin visi dan strategi Eleven Digital Indonesia sejak awal berdiri.",
    longBio:
      "Andika memiliki pengalaman lebih dari 10 tahun di industri kreatif digital. Ia memimpin arah bisnis dan strategi pertumbuhan Eleven Digital Indonesia, memastikan setiap proyek yang dikerjakan tim selaras dengan visi perusahaan untuk membantu bisnis klien tampil lebih profesional di dunia digital.",
    email: "andika@elevendigital.com",
    socials: { instagram: "#", facebook: "#" },
  },
  {
    slug: "sarah-wijaya",
    name: "Sarah Wijaya",
    position: "Chief Operating Officer",
    bio: "Mengelola operasional harian dan memastikan setiap proyek berjalan lancar.",
    longBio:
      "Sarah bertanggung jawab atas kelancaran operasional perusahaan, mulai dari manajemen tim, alur kerja proyek, hingga kualitas layanan yang diberikan ke klien. Dengan latar belakang manajemen proyek, ia memastikan setiap deadline terpenuhi tanpa mengorbankan kualitas.",
    email: "sarah@elevendigital.com",
    socials: { instagram: "#", facebook: "#" },
  },
  {
    slug: "raka-firmansyah",
    name: "Raka Firmansyah",
    position: "Chief Technology Officer",
    bio: "Mengawal kualitas dan inovasi teknologi di setiap produk digital kami.",
    longBio:
      "Raka memimpin tim teknis dalam merancang arsitektur dan solusi teknologi untuk setiap proyek. Ia berfokus pada penerapan best practice pengembangan perangkat lunak agar produk yang dihasilkan aman, cepat, dan mudah dikembangkan di masa depan.",
    email: "raka@elevendigital.com",
    socials: { instagram: "#", twitter: "#" },
  },
  {
    slug: "dinda-permata",
    name: "Dinda Permata",
    position: "Creative Director",
    bio: "Mengarahkan konsep visual dan kreativitas di setiap karya yang kami hasilkan.",
    longBio:
      "Dinda mengarahkan seluruh proses kreatif, mulai dari konsep desain, identitas visual brand, hingga eksekusi akhir setiap proyek. Ia percaya bahwa desain yang baik adalah perpaduan antara estetika dan fungsi yang menyelesaikan masalah nyata klien.",
    email: "dinda@elevendigital.com",
    socials: { instagram: "#", facebook: "#" },
  },
  {
    slug: "bima-santoso",
    name: "Bima Santoso",
    position: "Chief Marketing Officer",
    bio: "Merancang strategi pemasaran agar brand klien menjangkau audiens yang tepat.",
    longBio:
      "Bima menangani strategi pemasaran digital, mulai dari perencanaan kampanye, optimasi iklan, hingga analisis performa. Fokus utamanya adalah memastikan setiap rupiah yang diinvestasikan klien memberikan hasil yang terukur.",
    email: "bima@elevendigital.com",
    socials: { instagram: "#", twitter: "#" },
  },
  {
    slug: "putri-anggraini",
    name: "Putri Anggraini",
    position: "Head of Finance & Admin",
    bio: "Mengelola keuangan dan administrasi perusahaan secara transparan dan rapi.",
    longBio:
      "Putri bertanggung jawab atas pengelolaan keuangan, administrasi, dan legalitas perusahaan. Ia memastikan setiap proses transaksi dengan klien maupun vendor berjalan transparan, tercatat rapi, dan sesuai dengan standar akuntansi yang berlaku.",
    email: "putri@elevendigital.com",
    socials: { instagram: "#", facebook: "#" },
  },
];
