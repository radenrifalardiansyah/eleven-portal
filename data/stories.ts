export type Story = {
  slug: string;
  title: string;
  label: string;
  labelColor: "yellow" | "blue";
  description: string;
  content: string[];
  image: string;
  author: string;
  authorImage: string;
  date: string;
};

export const stories: Story[] = [
  {
    slug: "why-product-thinking-is-the-next-big-thing-in-ux-design",
    title: "Kenapa Product Thinking Penting dalam UX Design",
    label: "Creative",
    labelColor: "yellow",
    description:
      "Product thinking membantu tim desain fokus pada masalah pengguna, bukan sekadar tampilan antarmuka semata.",
    content: [
      "Banyak bisnis yang belum punya desainer full-time, sehingga tampilan produk digital sering dibangun tanpa proses riset yang memadai. Product thinking membantu menjembatani hal ini dengan menempatkan masalah pengguna di pusat setiap keputusan desain, bukan langsung melompat ke tampilan visual.",
      "Alih-alih memulai dari layar, product thinking dimulai dari pertanyaan mendasar: untuk siapa produk ini dibuat, masalah apa yang ingin diselesaikan, dan bagaimana cara mengukur keberhasilannya. Pendekatan ini mengubah cara tim berkolaborasi, menjadikan desain sebagai tanggung jawab bersama, bukan hanya tugas satu orang.",
      "Tim yang menerapkan product thinking cenderung menghasilkan fitur yang lebih sederhana, fokus, dan mudah dikembangkan lebih lanjut, karena setiap keputusan desain bisa ditelusuri kembali ke kebutuhan pengguna yang jelas.",
    ],
    image: "/images/stories1.jpg",
    author: "Tim Eleven Digital Indonesia",
    authorImage: "/images/testimonial-1.png",
    date: "2026-01-12",
  },
  {
    slug: "7-practical-tips-for-cheating-at-design",
    title: "7 Tips Praktis Membuat Desain Rapi Tanpa Jadi Desainer",
    label: "Technology",
    labelColor: "blue",
    description:
      "Tim tanpa desainer khusus tetap bisa menghasilkan antarmuka yang rapi dengan beberapa shortcut praktis berikut.",
    content: [
      "Tidak semua bisnis memiliki desainer full-time, namun kebutuhan menghadirkan tampilan yang rapi dan profesional tetap ada. Berikut beberapa cara praktis agar tim non-desainer tetap bisa menghasilkan antarmuka yang enak dilihat dan digunakan.",
      "Mulailah dari design system dan komponen yang sudah teruji, alih-alih membangun dari nol. Gunakan kembali skala spasi, warna, dan tipografi yang sudah terbukti serasi, lalu batasi pilihan agar tampilan tetap konsisten di seluruh halaman.",
      "Jangan ragu meniru pola layout dari produk yang sudah kamu kagumi. Desain yang baik seringkali lahir dari penggunaan kembali pola yang sudah terbukti berhasil, bukan dari menciptakan ulang setiap elemen dari nol.",
    ],
    image: "/images/stories2.jpg",
    author: "Tim Eleven Digital Indonesia",
    authorImage: "/images/testimonial-2.png",
    date: "2026-02-03",
  },
  {
    slug: "wells-fargo-artificial-intelligence-and-machine",
    title: "Belajar dari Wells Fargo: AI dan Machine Learning di Layanan Finansial",
    label: "Creative",
    labelColor: "yellow",
    description:
      "Institusi finansial besar seperti Wells Fargo memanfaatkan AI untuk pengalaman pelanggan yang lebih baik dan lebih aman.",
    content: [
      "Institusi finansial besar seperti Wells Fargo telah lama bereksperimen dengan AI dan machine learning untuk meningkatkan pengalaman pelanggan dalam skala besar, mulai dari deteksi fraud hingga layanan perbankan berbasis percakapan.",
      "Mulai dari deteksi fraud prediktif hingga asisten perbankan berbasis percakapan, sistem-sistem ini sangat bergantung pada antarmuka yang dirancang dengan baik agar otomasi yang kompleks tetap mudah dipahami dan dipercaya oleh pengguna sehari-hari.",
      "Pelajaran bagi tim yang lebih kecil pun sama: sehebat apapun teknologi di balik sebuah produk, keberhasilannya tetap bergantung pada seberapa jelas pengalaman tersebut dikomunikasikan kepada penggunanya.",
    ],
    image: "/images/stories3.jpg",
    author: "Tim Eleven Digital Indonesia",
    authorImage: "/images/testimonial-3.png",
    date: "2026-03-18",
  },
  {
    slug: "apple-maps-vs-google-maps-which-is-better",
    title: "Apple Maps vs Google Maps: Mana yang Lebih Unggul?",
    label: "Technology",
    labelColor: "blue",
    description:
      "Perbandingan Apple Maps dan Google Maps menunjukkan bagaimana keputusan desain kecil membentuk pengalaman yang sangat berbeda.",
    content: [
      "Membandingkan Apple Maps dan Google Maps adalah latihan yang baik untuk memahami bagaimana keputusan desain kecil dapat menghasilkan pengalaman yang sangat berbeda bagi penggunanya.",
      "Google Maps mengandalkan kepadatan data dan informasi real-time, sementara Apple Maps berfokus pada kejelasan visual dan interaksi yang lebih halus. Tidak ada pendekatan yang secara universal lebih baik, semua tergantung apa yang paling dibutuhkan pengguna pada momen tertentu.",
      "Pelajaran bagi tim produk: pahami prioritas pengguna Anda terlebih dahulu sebelum memutuskan untuk mengoptimalkan kekayaan informasi atau kesederhanaan visual.",
    ],
    image: "/images/stories4.jpg",
    author: "Tim Eleven Digital Indonesia",
    authorImage: "/images/testimonial-4.png",
    date: "2026-04-22",
  },
];
