// =========================================================================
// WAROENG JAMUR MANG YAYAT - CLIENT SCRIPT UTAMA
// Fitur: Sistem Halaman Tunggal (Page View), 3 Slider Hero, Menu Emas,
//        Filter Produk, Modal Interaktif, Kalkulator ROI & WhatsApp
// =========================================================================

document.addEventListener('DOMContentLoaded', () => {
  initPageRouter();
  initHeroSlider();
  initNavbar();
  initProductFilter();
  initProductModal();
  initRoiCalculator();
  initGalleryLightbox();
  initRecipeModal();
  initFaqAccordion();
  initContactForm();
  initKangSupaChatbot();
  syncWithBackendStore();
});

// =========================================================================
// 1. SISTEM HALAMAN MANDIRI BERDASARKAN MENU (BUKAN BERGULIR, TAMPILKAN HALAMAN BARU)
// =========================================================================
function initPageRouter() {
  const navLinks = document.querySelectorAll('.nav-link-corporate, .nav-link-mobile, .page-switch-btn');

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetPage = link.getAttribute('data-page');
      if (targetPage) {
        e.preventDefault();
        window.switchPage(targetPage);
      }
    });
  });

  // Cek hash di URL saat pertama kali dimuat (misal #tentang, #produk)
  const hash = window.location.hash.replace('#', '');
  const validPages = ['beranda', 'tentang', 'keunggulan', 'produk', 'kemitraan', 'kalkulator', 'artikel', 'galeri', 'lokasi'];
  if (validPages.includes(hash)) {
    window.switchPage(hash, false);
  } else {
    window.switchPage('beranda', false);
  }

  // Dukung tombol Back / Forward pada browser
  window.addEventListener('popstate', () => {
    const currentHash = window.location.hash.replace('#', '');
    if (validPages.includes(currentHash)) {
      window.switchPage(currentHash, false);
    } else {
      window.switchPage('beranda', false);
    }
  });
}

// Fungsi global untuk mengganti halaman secara instan (Rata Atas & Tanpa Bergulir Kasar)
window.switchPage = function(pageId, updateHistory = true) {
  const allPages = document.querySelectorAll('.page-view');
  const targetElement = document.getElementById(`page-${pageId}`);

  if (!targetElement) return;

  // Sembunyikan seluruh halaman
  allPages.forEach(p => {
    p.classList.add('hidden');
    p.classList.remove('active');
  });

  // Tampilkan halaman yang dipilih
  targetElement.classList.remove('hidden');
  targetElement.classList.add('active');

  // Perbarui status menu aktif (BERWARNA EMAS)
  const allCorporateLinks = document.querySelectorAll('.nav-link-corporate');
  allCorporateLinks.forEach(link => {
    if (link.getAttribute('data-page') === pageId) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  const allMobileLinks = document.querySelectorAll('.nav-link-mobile');
  allMobileLinks.forEach(link => {
    if (link.getAttribute('data-page') === pageId) {
      link.classList.add('text-amber-500', 'font-black');
      link.classList.remove('text-stone-700');
    } else {
      link.classList.remove('text-amber-500', 'font-black');
      link.classList.add('text-stone-700');
    }
  });

  // Gulir halus langsung ke paling atas halaman
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });

  // Perbarui Hash di URL tanpa reload
  if (updateHistory) {
    history.pushState(null, null, `#${pageId}`);
  }

  // Render ulang ikon lucide jika ada
  if (window.lucide) {
    window.lucide.createIcons();
  }
};

// =========================================================================
// 2. HERO BANNER: 3 SLIDER INTERAKTIF DENGAN KONTROL & AUTO-PLAY
// =========================================================================
function initHeroSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.slider-dot');
  const prevBtn = document.getElementById('sliderPrevBtn');
  const nextBtn = document.getElementById('sliderNextBtn');
  const sliderContainer = document.querySelector('.hero-slider-container');

  if (!slides.length) return;

  let currentSlide = 0;
  let slideInterval = null;

  function showSlide(index) {
    slides.forEach((s, idx) => {
      if (idx === index) {
        s.classList.add('active');
      } else {
        s.classList.remove('active');
      }
    });

    dots.forEach((d, idx) => {
      if (idx === index) {
        d.classList.add('active');
      } else {
        d.classList.remove('active');
      }
    });

    currentSlide = index;
  }

  function nextSlide() {
    let next = (currentSlide + 1) % slides.length;
    showSlide(next);
  }

  function prevSlide() {
    let prev = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(prev);
  }

  // Waktu putar slider tidak terlalu lama (4.5 detik / 4500ms)
  const AUTO_PLAY_DELAY = 4500;

  function startAutoPlay() {
    stopAutoPlay();
    slideInterval = setInterval(nextSlide, AUTO_PLAY_DELAY);
  }

  function stopAutoPlay() {
    if (slideInterval) {
      clearInterval(slideInterval);
      slideInterval = null;
    }
  }

  const prevBtnMobile = document.getElementById('sliderPrevBtnMobile');
  const nextBtnMobile = document.getElementById('sliderNextBtnMobile');

  if (nextBtn) nextBtn.addEventListener('click', () => {
    nextSlide();
    startAutoPlay();
  });

  if (prevBtn) prevBtn.addEventListener('click', () => {
    prevSlide();
    startAutoPlay();
  });

  if (nextBtnMobile) nextBtnMobile.addEventListener('click', (e) => {
    e.stopPropagation();
    nextSlide();
    startAutoPlay();
  });

  if (prevBtnMobile) prevBtnMobile.addEventListener('click', (e) => {
    e.stopPropagation();
    prevSlide();
    startAutoPlay();
  });

  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      showSlide(idx);
      startAutoPlay();
    });
  });

  if (sliderContainer) {
    sliderContainer.addEventListener('mouseenter', stopAutoPlay);
    sliderContainer.addEventListener('mouseleave', startAutoPlay);

    // Gestur Usap Layar Sentuh (Touch Swipe) Khusus HP & Tablet
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    sliderContainer.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
      stopAutoPlay();
    }, { passive: true });

    sliderContainer.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;
      handleSwipe();
      startAutoPlay();
    }, { passive: true });

    function handleSwipe() {
      const diffX = touchEndX - touchStartX;
      const diffY = touchEndY - touchStartY;
      // Deteksi geser horizontal minimal 40px dan lebih dominan dari geser vertikal
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
        if (diffX < 0) {
          nextSlide(); // Usap ke kiri -> slide berikutnya
        } else {
          prevSlide(); // Usap ke kanan -> slide sebelumnya
        }
      }
    }
  }

  // Mulai otomatis slide pertama
  showSlide(0);
  startAutoPlay();
}

// =========================================================================
// 3. NAVIGASI RESPONSIF & MOBILE DRAWER
// =========================================================================
function initNavbar() {
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const closeMobileMenuBtn = document.getElementById('closeMobileMenuBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const mobileBackdrop = document.getElementById('mobileBackdrop');
  const navLinks = document.querySelectorAll('.nav-link-mobile');

  function openMenu() {
    mobileDrawer.classList.remove('translate-x-full');
    mobileBackdrop.classList.remove('hidden');
    setTimeout(() => mobileBackdrop.classList.remove('opacity-0'), 10);
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    mobileDrawer.classList.add('translate-x-full');
    mobileBackdrop.classList.add('opacity-0');
    setTimeout(() => {
      mobileBackdrop.classList.add('hidden');
      document.body.style.overflow = '';
    }, 300);
  }

  if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openMenu);
  if (closeMobileMenuBtn) closeMobileMenuBtn.addEventListener('click', closeMenu);
  if (mobileBackdrop) mobileBackdrop.addEventListener('click', closeMenu);
  navLinks.forEach(link => link.addEventListener('click', closeMenu));

  // Efek Sticky Navbar Saat Digulir (Scroll) agar Menu Utama Selalu Terlihat Elegan
  const navbar = document.getElementById('mainNavbar');
  if (navbar) {
    const handleScroll = () => {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      if (scrollY > 15) {
        navbar.classList.add('navbar-scrolled');
      } else {
        navbar.classList.remove('navbar-scrolled');
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }
}

// =========================================================================
// 4. DATA KATALOG PRODUK RESMI
// =========================================================================
let productsData = [
  {
    id: 'jamur-tiram-putih',
    category: 'jamur-segar',
    categoryName: '1. Jamur Tiram Segar',
    name: 'Jamur Tiram Putih Segar (Kualitas Super Grade A)',
    badge: 'Panen Fajar 05.00 WIB',
    price: 'Rp 16.000 / kg',
    desc: 'Jamur tiram putih pilihan hasil panen langsung dari kumbung Mang Yayat di Kawalu, Tasikmalaya. Kelopak tebal, bersih, bertekstur kenyal segar, dan tanpa bahan pengawet kimia.',
    specs: [
      'Waktu Petik: Setiap Subuh (05.00 - 08.00 WIB) mengikuti jam buka pasar',
      'Kemurnian: 100% Organik, tanpa cuci kimia pasca panen',
      'Kemasan: Plastik pori berventilasi / peti kayu krat',
      'Ketahanan Simpan: 3-5 hari di suhu pendingin (4-8°C)'
    ],
    img: 'assets/images/jamur-tiram-putih.jpg?v=2',
    waText: 'Sampurasun Waroeng Jamur Mang Yayat, saya ingin memesan Jamur Tiram Putih Segar Grade A. Apakah stok panen hari ini tersedia?'
  },
  {
    id: 'baglog-siap-tumbuh',
    category: 'media-bibit',
    categoryName: '2. Baglog Jamur Tiram',
    name: 'Baglog Jamur Tiram Siap Berbuah (Miselium 100%)',
    badge: 'Miselium Putih Tebal',
    price: 'Rp 3.000 / baglog',
    desc: 'Media tanam siap berbuah berbahan serbuk kayu sengon pilihan, dedak murni, kapur dolomit, dan kalsium terfermentasi matang. Diinokulasi bibit F2 unggul dan siap panen.',
    specs: [
      'Berat Media: ± 1,15 kg per baglog',
      'Potensi Panen: 4-6 gelombang petik selama 3-4 bulan',
      'Estimasi Hasil: 400 - 500 gram jamur segar per baglog',
      'Garansi: Miselium hidup aktif dan tahan kontaminasi'
    ],
    img: 'assets/images/baglog-jamur.jpg?v=2',
    waText: 'Sampurasun Mang Yayat, saya tertarik memesan Baglog Jamur Tiram Siap Berbuah. Berapa minimal pemesanan dan jadwal kirimnya?'
  },
  {
    id: 'keripik-jamur-crispy',
    category: 'produk-olahan',
    categoryName: '3. Produk & Kebutuhan Budidaya',
    name: 'Keripik Jamur Tiram Crispy Mang Yayat (Spinner Rendah Minyak)',
    badge: 'Bebas Kolesterol',
    price: 'Rp 18.000 / pouch (100g)',
    desc: 'Camilan sehat olahan dapur Mang Yayat dengan balutan rempah alami. Diproses menggunakan mesin peniris minyak (spinner) sehingga sangat renyah, tahan lama, dan tidak enek.',
    specs: [
      'Pilihan Rasa: Original Gurih, Pedas Daun Jeruk, Balado Manis',
      'Standar Mutu: Higienis PIRT & Ramah Halal',
      'Kemasan: Standing pouch aluminium foil dengan zipper kedap',
      'Masa Simpan: 6 Bulan pada suhu ruang'
    ],
    img: 'assets/images/keripik-jamur.jpg?v=2',
    waText: 'Halo Waroeng Jamur Mang Yayat, saya ingin order Keripik Jamur Tiram Crispy aneka rasa untuk konsumsi / reseller.'
  },
  {
    id: 'bibit-kemasan-botol',
    category: 'bibit-jamur',
    categoryName: '5. Bibit Jamur F0, F1, F2',
    name: 'Bibit Murni Jamur Tiram Indukan (Kemasan Botol)',
    badge: 'Kemasan Botol',
    price: 'Rp 12.000 / botol',
    desc: 'Bibit murni kultur jaringan indukan F0 (media PDA steril), F1 dan F2 (media biji jagung) yang diinokulasi di ruang bersih laminar. Daya rambat miselium sangat cepat, tebal, dan beradaptasi baik di iklim tropis.',
    specs: [
      'Varian: F0 (PDA tabung), F1 & F2 (Botol biji jagung steril)',
      'Wadah: Botol kaca steril dengan filter pori mikro aerasi',
      'Kapasitas Inokulasi: 1 botol bibit F2 untuk 30-40 baglog produksi',
      'Masa Simpan: 30-45 hari di ruang bersuhu sejuk (18-24°C)'
    ],
    img: 'assets/images/bibit-botol.jpg?v=2',
    waText: 'Sampurasun Mang Yayat, saya ingin konsultasi dan memesan Bibit Murni Jamur Tiram (Kemasan Botol) untuk pembibitan kumbung.'
  },
  {
    id: 'bibit-kemasan-plastik',
    category: 'bibit-jamur',
    categoryName: '5. Bibit Jamur F0, F1, F2',
    name: 'Bibit Murni Jamur Tiram Indukan (Kemasan Plastik)',
    badge: 'Kemasan Plastik',
    price: 'Rp 12.000 / bag',
    desc: 'Bibit murni kultur jaringan indukan F0 (media PDA steril), F1 dan F2 (media biji jagung) yang diinokulasi di ruang bersih laminar. Daya rambat miselium sangat cepat, tebal, dan beradaptasi baik di iklim tropis.',
    specs: [
      'Varian: F1 & F2 (Media biji jagung / serbuk terfermentasi steril)',
      'Wadah: Kantong plastik PP tahan panas berfilter aerasi steril',
      'Kapasitas Inokulasi: 1 bag bibit F2 untuk 30-40 baglog produksi',
      'Masa Simpan: 30-45 hari di ruang bersuhu sejuk (18-24°C)'
    ],
    img: 'assets/images/bibit-plastik.jpg?v=2',
    waText: 'Sampurasun Mang Yayat, saya ingin konsultasi dan memesan Bibit Murni Jamur Tiram (Kemasan Plastik) untuk pembibitan kumbung.'
  },
  {
    id: 'paket-kumbung-mini',
    category: 'produk-olahan',
    categoryName: '3. Produk & Kebutuhan Budidaya',
    name: 'Paket Kumbung Mini Edukasi Rumahan (20 Baglog)',
    badge: 'Cocok untuk Keluarga',
    price: 'Rp 150.000 / paket',
    desc: 'Solusi lengkap budidaya jamur di teras atau garasi rumah. Sangat cocok untuk sarana edukasi anak, hobi berkebun, dan memenuhi kebutuhan sayur sehat keluarga tanpa lahan luas.',
    specs: [
      'Isi Paket: 20 Baglog siap tumbuh berbuah',
      'Peralatan: Sprayer semprot kabut air halus',
      'Buku Panduan: Modul saku cara merawat baglog di rumah',
      'Pendampingan: Konsultasi gratis via WhatsApp sampai panen'
    ],
    img: 'assets/images/jamur-harvest.jpg?v=2',
    waText: 'Halo Waroeng Jamur Mang Yayat, saya ingin memesan Paket Kumbung Mini Edukasi Rumahan untuk belajar budidaya di rumah.'
  },
  {
    id: 'workshop-budidaya',
    category: 'pelatihan-kemitraan',
    categoryName: '4. Pelatihan dan B2B (Business-to-Business)',
    name: 'Pelatihan & Pembinaan Budidaya Jamur Tiram',
    badge: 'Tutor Resmi Petani Milenial',
    price: 'Rp 350.000 / orang',
    desc: 'Program bimbingan teknis dan pelatihan aplikatif bersama Owner Waroeng Jamur Mang Yayat sebagai narasumber tutor resmi dalam agenda Peningkatan Kapasitas & Pembinaan Petani Milenial binaan Dinas Pertanian Kab. Tasikmalaya. Membekali peserta dengan standar GAP (Good Agricultural Practices) jamur tiram, manajemen kumbung modern, perawatan baglog, hingga kemandirian agribisnis.',
    specs: [
      'Narasumber / Tutor: Owner Waroeng Jamur Mang Yayat (Tutor & Praktisi Pembinaan Petani Milenial Dinas Pertanian Kab. Tasikmalaya)',
      'Materi Inti: Standar GAP Jamur Tiram, sterilisasi drum 100°C, inokulasi bibit, tata kelola kumbung & penanganan panen',
      'Metode Pelatihan: Pemaparan materi kelas komprehensif dilanjutkan praktek lapangan langsung di kumbung',
      'Fasilitas Lengkap: Modul panduan agribisnis jamur, 5 baglog siap berbuah, sertifikat pelatihan, dan makan siang'
    ],
    img: 'assets/images/pelatihan-dinas.jpg?v=2',
    waText: 'Sampurasun Mang Yayat, saya ingin mendaftar Pelatihan & Pembinaan Budidaya Jamur Tiram bersama Owner Mang Yayat. Kapan jadwal terdekat?'
  },
  {
    id: 'kunjungan-studi-kasus-mahasiswa',
    category: 'pelatihan-kemitraan',
    categoryName: '4. Pelatihan dan B2B (Business-to-Business)',
    name: 'Kunjungan Edukasi & Studi Kasus Mahasiswa (Riset Agribisnis)',
    badge: 'Studi Kasus Akademisi',
    price: 'Sesuai Pengajuan Kampus',
    desc: 'Waroeng Jamur Mang Yayat terbuka dan aktif menerima kunjungan dari kalangan akademisi serta mahasiswa yang melakukan studi kasus, riset lapangan, maupun tugas kuliah. Kami memberikan pembelajaran langsung mengenai tahapan produksi dari hulu ke hilir hingga strategi pemasaran jamur tiram.',
    specs: [
      'Sasaran Program: Mahasiswa, Dosen, Peneliti & Kelompok Studi Akademik',
      'Pembelajaran Produksi: Formulasi serbuk kayu & dedak, sterilisasi 100°C, inokulasi bibit, hingga manajemen iklim mikro kumbung',
      'Pembelajaran Pemasaran: Saluran distribusi jamur segar harian, penetrasi pasar tradisional, suplai kuliner, dan analisis ekonomi agribisnis',
      'Metode Kunjungan: Diskusi interaktif langsung bersama owner di kumbung produksi serta observasi data riil lapangan',
      'Konfirmasi & Jadwal: Pengajuan melalui surat pengantar kampus atau koordinasi langsung via WhatsApp resmi'
    ],
    img: 'assets/images/kunjungan-mahasiswa.jpg?v=2',
    waText: 'Sampurasun Mang Yayat, kami dari akademisi/mahasiswa bermaksud mengajukan jadwal Kunjungan Studi Kasus dan Pembelajaran Agribisnis Jamur Tiram untuk tugas kuliah/riset.'
  }
];

function initProductFilter() {
  const tabs = document.querySelectorAll('.filter-tab');
  const container = document.getElementById('productsContainer');
  if (!container) return;

  function renderProducts(category = 'all') {
    container.innerHTML = '';
    const filtered = category === 'all' 
      ? productsData 
      : productsData.filter(p => p.category === category);

    filtered.forEach(p => {
      const card = document.createElement('div');
      card.className = 'card-ll overflow-hidden flex flex-col justify-between group';
      card.innerHTML = `
        <div>
          <div class="relative overflow-hidden aspect-[4/3] bg-stone-100">
            <img src="${p.img}" alt="${p.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
            <span class="absolute top-3 left-3 bg-forest-950/85 backdrop-blur-sm text-amber-300 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-amber-300/20">
              ${p.badge}
            </span>
          </div>
          <div class="p-5 sm:p-6">
            <span class="text-[11px] font-extrabold uppercase tracking-widest text-forest-700 block mb-1">
              ${p.categoryName}
            </span>
            <h3 class="text-base font-bold text-stone-900 group-hover:text-forest-700 transition-colors leading-snug mb-2">
              ${p.name}
            </h3>
            <p class="text-xs text-stone-600 line-clamp-2 leading-relaxed mb-4">
              ${p.desc}
            </p>
          </div>
        </div>
        <div class="p-5 sm:p-6 pt-0 border-t border-stone-100 flex items-center justify-between">
          <div>
            <span class="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">Harga / Tarif</span>
            <span class="text-sm font-extrabold text-forest-900">${p.price}</span>
          </div>
          <button onclick="openProductDetail('${p.id}')" class="px-3.5 py-2 rounded-full bg-forest-800 hover:bg-forest-950 text-white text-[11px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-sm">
            <span>Lihat Detail</span>
            <i data-lucide="arrow-right" class="w-3.5 h-3.5 text-amber-300"></i>
          </button>
        </div>
      `;
      container.appendChild(card);
    });

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const filter = tab.getAttribute('data-filter');
      renderProducts(filter);
    });
  });

  window.renderProducts = renderProducts;
  renderProducts('all');
}

// =========================================================================
// 5. MODAL DETAIL PRODUK
// =========================================================================
function initProductModal() {
  const modal = document.getElementById('productModal');
  const closeBtn = document.getElementById('closeProductModal');

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    });
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }
}

window.openProductDetail = function(productId) {
  const product = productsData.find(p => p.id === productId);
  if (!product) return;

  const modal = document.getElementById('productModal');
  const container = document.getElementById('productModalBody');

  const waUrl = `https://wa.me/6282119918783?text=${encodeURIComponent(product.waText)}`;

  container.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div class="rounded-2xl overflow-hidden aspect-square bg-stone-100 relative">
        <img src="${product.img}" alt="${product.name}" class="w-full h-full object-cover">
        <span class="absolute top-4 left-4 bg-forest-950/90 text-amber-300 text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-amber-300/30">
          ${product.badge}
        </span>
      </div>
      <div class="flex flex-col justify-between">
        <div>
          <span class="text-xs font-bold uppercase tracking-widest text-forest-700 bg-forest-50 px-3 py-1 rounded-full mb-3 inline-block">
            ${product.categoryName}
          </span>
          <h2 class="text-2xl font-extrabold text-stone-900 mb-2 leading-tight">${product.name}</h2>
          <div class="text-2xl font-black text-forest-700 mb-4">${product.price}</div>
          <p class="text-stone-600 text-sm leading-relaxed mb-6">${product.desc}</p>
          
          <div class="bg-cream-100 border border-stone-200/80 rounded-2xl p-4 mb-6">
            <h4 class="text-xs font-bold uppercase text-stone-800 tracking-wider mb-2.5 flex items-center gap-1.5">
              <i data-lucide="check-circle" class="w-4 h-4 text-forest-700"></i>
              Spesifikasi & Standar Mutu
            </h4>
            <ul class="text-xs text-stone-600 space-y-2">
              ${product.specs.map(s => `<li class="flex items-start gap-2"><span class="text-forest-700 font-bold">•</span><span>${s}</span></li>`).join('')}
            </ul>
          </div>
        </div>

        <div class="space-y-2 pt-2">
          <a href="${waUrl}" target="_blank" class="w-full btn-ll-primary !py-3.5">
            <i data-lucide="message-circle" class="w-4 h-4 text-amber-300"></i>
            <span>Pesan atau Konsultasi via WhatsApp Resmi</span>
          </a>
          <p class="text-center text-[11px] text-stone-400">
            *Pengiriman langsung siap melayani area Tasikmalaya dan jalur logistik Jawa Barat.
          </p>
        </div>
      </div>
    </div>
  `;

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  if (window.lucide) {
    window.lucide.createIcons();
  }
};

// =========================================================================
// 6. KALKULATOR POTENSI USAHA BUDIDAYA (SIMULASI ROI)
// =========================================================================
function initRoiCalculator() {
  const slider = document.getElementById('baglogSlider');
  const countDisplay = document.getElementById('baglogCountDisplay');
  const costDisplay = document.getElementById('calcCostDisplay');
  const harvestDisplay = document.getElementById('calcHarvestDisplay');
  const revenueDisplay = document.getElementById('calcRevenueDisplay');
  const profitDisplay = document.getElementById('calcProfitDisplay');
  const roiPeriodDisplay = document.getElementById('calcRoiPeriodDisplay');
  const waCalcBtn = document.getElementById('waCalcBtn');

  if (!slider) return;

  function updateCalculations() {
    const baglogs = parseInt(slider.value, 10);
    countDisplay.textContent = `${baglogs.toLocaleString('id-ID')} Baglog`;

    const cost = baglogs * 3000;
    const harvestKg = Math.round(baglogs * 0.45);
    const revenue = harvestKg * 16000;
    const profit = revenue - cost;

    costDisplay.textContent = `Rp ${cost.toLocaleString('id-ID')}`;
    harvestDisplay.textContent = `± ${harvestKg.toLocaleString('id-ID')} kg`;
    revenueDisplay.textContent = `Rp ${revenue.toLocaleString('id-ID')}`;
    profitDisplay.textContent = `Rp ${profit.toLocaleString('id-ID')}`;
    roiPeriodDisplay.textContent = '1,5 - 2 Bulan';

    if (waCalcBtn) {
      const msg = `Sampurasun Waroeng Jamur Mang Yayat, saya mencoba simulasi usaha budidaya untuk ${baglogs} baglog (estimasi potensi omzet Rp ${revenue.toLocaleString('id-ID')}). Saya ingin berkonsultasi mengenai pemesanan baglog dan panduan teknis kumbungnya.`;
      waCalcBtn.href = `https://wa.me/6282119918783?text=${encodeURIComponent(msg)}`;
    }
  }

  slider.addEventListener('input', updateCalculations);
  updateCalculations();
}

// =========================================================================
// 7. LIGHTBOX GALERI FOTO
// =========================================================================
function initGalleryLightbox() {
  const galleryItems = document.querySelectorAll('.gallery-thumb');
  const lightbox = document.getElementById('galleryLightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const closeBtn = document.getElementById('closeLightboxBtn');

  if (!lightbox) return;

  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const src = item.getAttribute('data-full') || item.querySelector('img').src;
      const caption = item.getAttribute('data-caption') || 'Dokumentasi Kumbung Waroeng Jamur Mang Yayat Tasikmalaya';
      lightboxImg.src = src;
      lightboxCaption.textContent = caption;
      lightbox.classList.remove('hidden');
      setTimeout(() => lightbox.classList.remove('opacity-0'), 10);
      document.body.style.overflow = 'hidden';
    });
  });

  function closeLightbox() {
    lightbox.classList.add('opacity-0');
    setTimeout(() => {
      lightbox.classList.add('hidden');
      document.body.style.overflow = '';
    }, 250);
  }

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.id === 'lightboxBackdrop') {
      closeLightbox();
    }
  });
}

// =========================================================================
// 8. MODAL RESEP DAPUR MANG YAYAT
// =========================================================================
const recipesData = {
  'pepes-jamur': {
    title: 'Pepes Jamur Tiram Sunda Gurih Wangi Kemangi',
    desc: 'Kuliner tradisional khas Priangan Timur: jamur tiram segar suwir berpadu rempah kunyit, daun bawang, dan aroma daun pisang bakar.',
    prepTime: '20 Menit',
    cookTime: '30 Menit',
    portion: '4 Porsi',
    ingredients: [
      '350 gr Jamur tiram putih Mang Yayat segar, cuci dan suwir kasar',
      '2 Ikat daun kemangi segar, petik daunnya',
      '2 Batang daun bawang, iris miring',
      '2 Buah tomat merah segar, potong dadu',
      'Cabai rawit merah utuh sesuai selera pedas',
      'Daun pisang dan lidi secukupnya untuk membungkus',
      'Bumbu Halus: 6 siung bawang merah, 3 siung bawang putih, 3 butir kemiri sangrai, 2 cm kunyit bakar, 1 sdt garam, 1/2 sdt kaldu jamur alami'
    ],
    steps: [
      'Peras suwiran jamur tiram perlahan agar kandungan airnya berkurang dan tekstur pepes tetap kenyal mantap.',
      'Campurkan suwiran jamur tiram dengan bumbu halus, potongan daun bawang, tomat, dan kemangi.',
      'Ambil selembar daun pisang, letakkan adonan jamur secukupnya di tengah, lalu gulung dan semat kedua ujungnya dengan tusuk lidi.',
      'Kukus pepes selama 20 menit hingga bumbu meresap matang harum.',
      'Panggang sebentar di atas teflon atau arang hingga daun pisang wangi kecokelatan. Sajikan hangat bersama nasi liwet!'
    ],
    img: 'assets/images/resep-tumis.jpg?v=2'
  },
  'jamur-krispi': {
    title: 'Jamur Tiram Crispy Renyah Seharian Daun Jeruk',
    desc: 'Camilan favorit keluarga bertekstur kriuk renyah tahan lama tanpa bahan pengawet dengan aroma segar daun jeruk purut.',
    prepTime: '15 Menit',
    cookTime: '15 Menit',
    portion: '4-5 Porsi',
    ingredients: [
      '300 gr Jamur tiram putih Mang Yayat, suwir lebar sedang',
      '150 gr Tepung beras & 50 gr Tepung tapioka / maizena',
      '5 Lembar daun jeruk purut, iris tipis halus tanpa tulang daun',
      '1 sdt Bawang putih bubuk & 1/2 sdt ketumbar bubuk',
      '1/2 sdt Baking powder (rahasia renyah tidak keras)',
      'Minyak goreng secukupnya untuk deep frying'
    ],
    steps: [
      'Cuci jamur tiram cepat, peras pelan hingga airnya tiris.',
      'Campurkan tepung beras, tapioka, baking powder, bawang putih, ketumbar, garam, dan irisan daun jeruk purut.',
      'Ambil 3 sendok makan campuran tepung, beri sedikit air es untuk membuat adonan celup basah encer.',
      'Celupkan suwiran jamur ke adonan basah, lalu balurkan ke adonan tepung kering sambil sedikit dicubit.',
      'Goreng di minyak panas dengan api sedang hingga berwarna kuning keemasan. Tiriskan dan nikmati!'
    ],
    img: 'assets/images/resep-crispy.jpg?v=2'
  },
  'sup-jamur': {
    title: 'Sup Jamur Tiram Bening Kaldu Gurih Sehat',
    desc: 'Hidangan kaya nutrisi dan penguat daya tahan tubuh, sangat cocok menghangatkan tubuh di udara sejuk Tasikmalaya.',
    prepTime: '10 Menit',
    cookTime: '20 Menit',
    portion: '3-4 Porsi',
    ingredients: [
      '250 gr Jamur tiram putih Mang Yayat, suwir',
      '1 Buah wortel manis, potong bulat',
      '1 Batang seledri & 1 batang daun bawang',
      '4 Siung bawang putih, cincang halus lalu tumis harum',
      '1/2 sdt Merica bubuk, garam secukupnya, dan kaldu jamur',
      '750 ml Air kaldu ayam atau kaldu sayuran alami'
    ],
    steps: [
      'Didihkan kuah kaldu di panci, masukkan potongan wortel hingga setengah empuk.',
      'Masukkan tumisan bawang putih cincang dan merica bubuk ke dalam kuah kaldu.',
      'Tambahkan jamur tiram suwir, daun bawang, dan seledri. Masak 3-5 menit agar jamur tetap kenyal segar.',
      'Koreksi rasa dengan garam dan kaldu jamur. Angkat dan sajikan selagi panas dengan taburan bawang merah goreng.'
    ],
    img: 'assets/images/resep-sup.jpg?v=2'
  }
};

function initRecipeModal() {
  const modal = document.getElementById('recipeModal');
  const closeBtn = document.getElementById('closeRecipeModal');
  const container = document.getElementById('recipeModalBody');

  window.openRecipe = function(key) {
    const r = recipesData[key];
    if (!r || !modal || !container) return;

    container.innerHTML = `
      <div class="mb-6 rounded-2xl overflow-hidden aspect-[16/9] bg-stone-100">
        <img src="${r.img}" alt="${r.title}" class="w-full h-full object-cover">
      </div>
      <h3 class="text-2xl font-extrabold text-stone-900 mb-2 leading-tight">${r.title}</h3>
      <p class="text-sm text-stone-600 mb-6 leading-relaxed">${r.desc}</p>
      
      <div class="grid grid-cols-3 gap-3 mb-6 bg-cream-100 p-4 rounded-2xl border border-stone-200 text-center">
        <div>
          <span class="block text-[10px] text-stone-400 uppercase tracking-widest font-bold">Waktu Persiapan</span>
          <span class="text-sm font-extrabold text-forest-900">${r.prepTime}</span>
        </div>
        <div>
          <span class="block text-[10px] text-stone-400 uppercase tracking-widest font-bold">Waktu Memasak</span>
          <span class="text-sm font-extrabold text-forest-900">${r.cookTime}</span>
        </div>
        <div>
          <span class="block text-[10px] text-stone-400 uppercase tracking-widest font-bold">Porsi</span>
          <span class="text-sm font-extrabold text-forest-900">${r.portion}</span>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div class="bg-white p-5 rounded-2xl border border-stone-200">
          <h4 class="font-bold text-xs uppercase tracking-wider text-forest-900 mb-3 flex items-center gap-1.5">
            <i data-lucide="utensils" class="w-4 h-4 text-forest-700"></i>
            Bahan Utama
          </h4>
          <ul class="text-xs text-stone-600 space-y-2">
            ${r.ingredients.map(i => `<li class="flex items-start gap-2"><span class="text-forest-700 font-bold">•</span><span>${i}</span></li>`).join('')}
          </ul>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-stone-200">
          <h4 class="font-bold text-xs uppercase tracking-wider text-forest-900 mb-3 flex items-center gap-1.5">
            <i data-lucide="chef-hat" class="w-4 h-4 text-forest-700"></i>
            Cara Memasak
          </h4>
          <ol class="text-xs text-stone-600 space-y-2.5">
            ${r.steps.map((s, idx) => `<li class="flex items-start gap-2"><span class="font-extrabold text-forest-800">${idx+1}.</span><span>${s}</span></li>`).join('')}
          </ol>
        </div>
      </div>

      <div class="pt-2 flex justify-end">
        <a href="https://wa.me/6282119918783?text=${encodeURIComponent(`Sampurasun Mang Yayat, saya ingin memesan jamur tiram segar untuk mempraktekkan resep ${r.title}!`)}" target="_blank" class="btn-ll-primary !text-xs !py-3">
          <i data-lucide="shopping-bag" class="w-4 h-4 text-amber-300"></i>
          <span>Beli Jamur Segar untuk Resep Ini</span>
        </a>
      </div>
    `;

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';

    if (window.lucide) {
      window.lucide.createIcons();
    }
  };

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    });
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }
}

// =========================================================================
// 9. AKORDION FAQ
// =========================================================================
function initFaqAccordion() {
  const faqButtons = document.querySelectorAll('.faq-btn');

  faqButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const content = btn.nextElementSibling;
      const icon = btn.querySelector('.faq-icon');
      const isOpen = !content.classList.contains('hidden');

      document.querySelectorAll('.faq-content').forEach(c => c.classList.add('hidden'));
      document.querySelectorAll('.faq-icon').forEach(i => i.classList.remove('rotate-180'));

      if (!isOpen) {
        content.classList.remove('hidden');
        if (icon) icon.classList.add('rotate-180');
      }
    });
  });
}

// =========================================================================
// 10. FORMULIR KONTAK WHATSAPP
// =========================================================================
function initContactForm() {
  const form = document.getElementById('consultationForm');
  if (!form) return;

  const phoneInput = document.getElementById('formPhone');
  if (phoneInput) {
    phoneInput.addEventListener('input', function() {
      // Standar input angka nasional
      this.value = this.value.replace(/[^0-9]/g, '');
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('formName').value.trim();
    const phone = document.getElementById('formPhone').value.trim().replace(/[^0-9]/g, '');
    const interest = document.getElementById('formInterest').value;
    const message = document.getElementById('formMessage').value.trim() || '-';

    // Validasi standar angka nasional WhatsApp (minimal 10 angka)
    if (!phone || phone.length < 10) {
      alert('Mohon masukkan nomor WhatsApp yang valid (berupa angka standar nasional, contoh: 081234567890).');
      if (phoneInput) phoneInput.focus();
      return;
    }

    // Rekam lead ke backend admin secara otomatis
    try {
      fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, interest, message })
      }).catch(() => {});
    } catch (e) {}

    const fullMsg = `Pesan Konsultasi Resmi - Waroeng Jamur Mang Yayat
Nama Pemesan: ${name}
Nomor WhatsApp: ${phone}
Keperluan / Produk: ${interest}
Detail Kebutuhan: ${message}

(Terkirim langsung via portal website resmi Waroeng Jamur Mang Yayat Tasikmalaya)`;

    window.open(`https://wa.me/6282119918783?text=${encodeURIComponent(fullMsg)}`, '_blank');
  });
}

// =========================================================================
// 11. SINKRONISASI OTOMATIS DATA DARI BACKEND STORE
// =========================================================================
async function syncWithBackendStore() {
  try {
    const res = await fetch('/api/data');
    if (res.ok) {
      const store = await res.json();
      if (store.products && store.products.length > 0) {
        productsData = store.products;
        if (typeof window.renderProducts === 'function') {
          window.renderProducts('all');
        }
      }
      if (store.site && store.site.marqueeText) {
        const marqueeSpans = document.querySelectorAll('.running-text-track span');
        marqueeSpans.forEach(span => {
          if (span.textContent.includes('Waroeng Jamur Mang Yayat •')) {
            span.textContent = store.site.marqueeText;
          }
        });
      }
      if (store.knowledgeBase && typeof window.updateKangSupaKnowledge === 'function') {
        window.updateKangSupaKnowledge(store.knowledgeBase, store.chatbotConfig);
      }
    }
  } catch (e) {
    const cached = localStorage.getItem('waroeng_jamur_store');
    if (cached) {
      try {
        const store = JSON.parse(cached);
        if (store.products && store.products.length > 0) {
          productsData = store.products;
          if (typeof window.renderProducts === 'function') {
            window.renderProducts('all');
          }
        }
        if (store.knowledgeBase && typeof window.updateKangSupaKnowledge === 'function') {
          window.updateKangSupaKnowledge(store.knowledgeBase, store.chatbotConfig);
        }
      } catch (err) {}
    }
  }
}

// =========================================================================
// 12. CHATBOT KANG SUPA: ASISTEN EDUKASI BUDIDAYA JAMUR TIRAM
// =========================================================================
function initKangSupaChatbot() {
  const toggleBtn = document.getElementById('kangSupaToggleBtn');
  const chatWindow = document.getElementById('kangSupaChatWindow');
  const backdrop = document.getElementById('kangSupaBackdrop');
  const closeBtn = document.getElementById('kangSupaCloseBtn');
  const resetBtn = document.getElementById('kangSupaResetBtn');
  const messagesContainer = document.getElementById('kangSupaMessages');
  const quickPromptsContainer = document.getElementById('kangSupaQuickPrompts');
  const form = document.getElementById('kangSupaForm');
  const input = document.getElementById('kangSupaInput');

  if (!toggleBtn || !chatWindow) return;

  let knowledge = [
  {
    "id": "kb-profil-usaha",
    "category": "Profil Usaha",
    "title": "Profil & Owner Waroeng Jamur Mang Yayat",
    "keywords": [
      "profil",
      "owner",
      "pemilik",
      "irwan",
      "setiawan",
      "sejarah",
      "berdiri",
      "2019",
      "tentang",
      "siapa",
      "pendiri",
      "pengelola",
      "lokasi",
      "alamat",
      "tasikmalaya",
      "kawalu",
      "sindangsuka",
      "cicarate"
    ],
    "answer": "Waroeng Jamur Mang Yayat (WJMY) adalah usaha agribisnis jamur tiram yang didirikan pada awal tahun **2019** oleh **Irwan Setiawan (Kang Irwan)**. Berdomisili di Kp. Sindangsuka / Cicarate RT 01/RW 09, Kelurahan Gununggede, Kecamatan Kawalu, Kota Tasikmalaya (WhatsApp: **0821-1991-8783**). Usaha ini mencakup penyediaan bibit indukan (F0-F2), baglog siap berbuah, jamur segar panen fajar, olahan krispi, dan pembinaan kemitraan."
  },
  {
    "id": "kb-alasan-usaha",
    "category": "Edukasi Bisnis",
    "title": "Alasan Memilih Usaha Budidaya Jamur Tiram",
    "keywords": [
      "kenapa",
      "mengapa",
      "alasan",
      "memilih",
      "keunggulan",
      "keuntungan",
      "peluang",
      "potensi",
      "usaha jamur",
      "agribisnis jamur",
      "pensiun",
      "tanah",
      "ruangan"
    ],
    "answer": "Alasan utama memilih usaha budidaya jamur tiram:\n• **Higienis & tertutup**: Tidak bersentuhan langsung dengan tanah; pemeliharaan baglog dan panen dilakukan di dalam ruangan tertutup (kumbung).\n• **Bahan baku melimpah & murah**: Memanfaatkan limbah serbuk gergaji kayu, dedak/huut, dan kapur dolomit.\n• **Harga pasar relatif stabil** dan permintaan konsumen tinggi karena lezat bernutrisi.\n• **Persaingan terkontrol**: Membutuhkan ketelatenan dan kesabaran (*rajin, tekun, telaten*).\n• Sangat ideal sebagai **persiapan usaha masa pensiun** maupun bisnis mandiri."
  },
  {
    "id": "kb-3-segmen",
    "category": "Edukasi Bisnis",
    "title": "3 Segmen Konsentrasi Usaha Budidaya Jamur Tiram",
    "keywords": [
      "segmen",
      "segmentasi",
      "3 segmen",
      "tahapan usaha",
      "fokus usaha",
      "pilihan usaha",
      "kategori",
      "pemula"
    ],
    "answer": "Usaha budidaya jamur tiram terbagi dalam 3 segmen konsentrasi:\n1. **Pembuat Bibit Jamur (F0/PDA, F1, F2)**: Menghasilkan biakan murni di botol kaca dengan alat laboratorium (autoclave/presto, pisau bedah steril, bunsen). Nilai jual tinggi, namun masih ada risiko kegagalan kontaminasi.\n2. **Pembuat Baglog (Media Tanam)**: Memerlukan ruang olah mixer adonan, mesin pres, drum steamer pengukusan, dan ruang inkubasi 25-40 hari.\n3. **Pembuahan & Pemasaran Jamur Segar**: Petani cukup membeli baglog siap panen dan merawatnya di kumbung. **Segmen ini paling minim risiko kegagalan dan sangat direkomendasikan untuk pemula**."
  },
  {
    "id": "kb-kumbung-jamur",
    "category": "Kumbung & Fasilitas",
    "title": "Kumbung Jamur & Standar Ukuran Rak",
    "keywords": [
      "kumbung",
      "ruang kumbung",
      "kandang",
      "bangunan",
      "rak",
      "ukuran rak",
      "jarak rak",
      "kontruksi",
      "pemeliharaan kumbung",
      "bambu",
      "paranet"
    ],
    "answer": "Kumbung adalah bangunan khusus tempat menyusun baglog agar jamur tumbuh optimal:\n• **Konstruksi**: Dinding bilik bambu/paranet/tembok permanen, atap genteng/rumbia, dan sirkulasi udara terkontrol.\n• **Standar Rak**: Jarak antar tiang rak ±80 cm, jarak antar susunan ambalan 40–50 cm (muat 3–5 baglog tidur), lebar rak 20–25 cm, tinggi maksimal 1,5–2 meter.\n• **Pemeliharaan**: Bersihkan atap dan halaman kumbung berkala, buat parit keliling penahan air hujan, tutup lubang dinding dari serangga luar, dan bersihkan gulma rumput di lantai."
  },
  {
    "id": "kb-komposisi-baglog",
    "category": "Media Tanam",
    "title": "Bahan Baku & Formulasi Pembuatan Baglog",
    "keywords": [
      "baglog",
      "komposisi baglog",
      "resep baglog",
      "bahan baglog",
      "campuran",
      "serbuk kayu",
      "dedak",
      "huut",
      "kapur",
      "dolomit",
      "gips",
      "kadar air"
    ],
    "answer": "Komposisi standar media baglog (per 100 kg serbuk kayu):\n• **Serbuk gergaji kayu halus**: 100 kg (diayak seragam tanpa potongan tajam).\n• **Dedak / Bekatul / Huut halus**: 15 kg (sumber nutrisi utama).\n• **Kapur dolomit**: 2 kg & **Gips**: 1 kg (penstabil pH media di kisaran 6–7).\n• **Air bersih**: hingga kadar air 60–65% (uji kepal: digenggam kuat hanya menetes 1 tetes air, saat dibuka kepalan tidak buyar).\nCampuran diaduk merata, dikomposkan 1–3 hari, lalu dipadatkan dalam plastik PP tahan panas (18x35 atau 20x35 cm) dan dipasang cincin leher."
  },
  {
    "id": "kb-sterilisasi-inokulasi",
    "category": "Teknis Budidaya",
    "title": "Sterilisasi (Steaming) & Inokulasi Bibit",
    "keywords": [
      "sterilisasi",
      "steam",
      "pengukusan",
      "mengukus",
      "drum steamer",
      "autoclave",
      "inokulasi",
      "tanam bibit",
      "bibit f2",
      "pendinginan",
      "spatula"
    ],
    "answer": "• **Sterilisasi (Pengukusan)**: Dilakukan menggunakan drum steamer pada suhu 70–100°C selama 5–8 jam (atau autoclave suhu 121°C tekanan 1 atm selama 4 jam) untuk membunuh bakteri dan spora jamur liar.\n• **Pendinginan**: Baglog didiamkan 8–12 jam hingga suhu turun ke 30–35°C sebelum ditanami bibit.\n• **Inokulasi**: Penanaman ±1 sendok teh bibit F2 steril ke dalam mulut baglog menggunakan spatula steril di dekat api bunsen, lalu mulut baglog ditutup kembali dengan kapas/penutup."
  },
  {
    "id": "kb-inkubasi-suhu",
    "category": "Perawatan Budidaya",
    "title": "Masa Inkubasi, Suhu & Kelembapan Ideal",
    "keywords": [
      "inkubasi",
      "miselium",
      "suhu",
      "kelembaban",
      "kelembapan",
      "berapa lama inkubasi",
      "tanda putih",
      "derajat",
      "cahaya"
    ],
    "answer": "• **Fase Inkubasi**: Suhu ruang 22–28°C (kelembaban 50–60%) dalam kondisi gelap/minim cahaya selama 25–45 hari hingga miselium merambat putih tebal merata 100%.\n• **Fase Pembuahan (Tumbuh Jamur)**: Suhu ideal 16–22°C (atau 22–28°C di dataran sedang), kelembaban tinggi 90–95%, dengan pencahayaan pantul 60–70% (tidak terkena sinar matahari langsung).\nJika kelembaban kurang, pinhead akan mengering; jika terlalu basah, tubuh buah akan membusuk."
  },
  {
    "id": "kb-penyiraman",
    "category": "Perawatan Budidaya",
    "title": "Teknik Penyiraman Baglog & Kumbung",
    "keywords": [
      "siram",
      "penyiraman",
      "cara menyiram",
      "pengkabutan",
      "mist spray",
      "kapan menyiram",
      "berapa kali siram",
      "air siram"
    ],
    "answer": "Teknik penyiraman jamur tiram yang benar:\n• Gunakan air bersih dengan **sistem pengkabutan (*mist spray*)**.\n• Arahkan kabut air ke lantai, dinding kumbung, dan lorong sela-sela baglog untuk menjaga kelembapan 90–95%.\n• **Peringatan**: Jangan menyemprot dengan semburan air kencang langsung ke dalam mulut baglog atau ke tudung jamur muda karena memicu pembusukan.\n• Frekuensi: 2–3 kali sehari (pagi, siang, sore) disesuaikan dengan suhu dan cuaca."
  },
  {
    "id": "kb-ciri-panen",
    "category": "Pemanenan",
    "title": "Ciri-Ciri Jamur Tiram Siap Panen",
    "keywords": [
      "panen",
      "ciri siap panen",
      "kapan panen",
      "waktu panen",
      "tanda siap petik",
      "usia panen",
      "bentuk jamur"
    ],
    "answer": "Ciri-ciri jamur tiram siap dipetik:\n• **Usia**: 3–5 hari setelah pinhead (tunas kecil) muncul.\n• **Batang**: Sudah seukuran jari orang dewasa normal.\n• **Tudung**: Mekar sempurna berdiameter 3–14 cm, tekstur kenyal kokoh, tepi belum keriting atau pecah/menguning.\n• **Warna**: Putih bersih / abu segar dan spora belum beterbangan.\nWaktu panen terbaik adalah waktu fajar (05.00–08.00 WIB) agar jamur tetap segar dan berbobot saat dipasarkan."
  },
  {
    "id": "kb-teknik-panen-pasca",
    "category": "Pemanenan",
    "title": "Teknik Petik & Perawatan Pasca Panen",
    "keywords": [
      "cara panen",
      "mencabut",
      "pasca panen",
      "sisa akar",
      "kerik baglog",
      "nutrisi baglog",
      "poc",
      "hormon",
      "siklus panen",
      "berapa kali panen"
    ],
    "answer": "• **Cara Panen**: Cabut seluruh rumpun jamur hingga ke pangkal akar terdalam. Jangan dipotong menyisakan tangkai di dalam mulut baglog karena akan membusuk dan mengundang ulat/belatung.\n• **Perawatan Pasca Panen**: Bersihkan sisa akar, kerik tipis permukaan media di mulut baglog, lalu semprotkan nutrisi POC organik atau hormonik perangsang.\n• **Hasil**: Pinhead baru akan tumbuh kembali dalam 4–7 hari. Satu baglog produktif dapat dipanen 6–10 kali selama masa produktif 3–4 bulan."
  },
  {
    "id": "kb-hama-penyakit",
    "category": "Hama & Penyakit",
    "title": "Hama, Penyakit & Pengendalian Organik",
    "keywords": [
      "hama",
      "penyakit",
      "ulat",
      "belatung",
      "lalat",
      "nyamuk",
      "kepik",
      "rametuk",
      "jamur hijau",
      "trichoderma",
      "jamur liar",
      "obat kimia",
      "pestisida"
    ],
    "answer": "• **Hama Umum**: Belatung/ulat (muncul jika panen terlambat atau ada sisa akar membusuk), nyamuk kebon, rametuk, lalat, kepik terbang, dan rayap.\n• **Penyakit/Kontaminasi**: Jamur hijau (*Trichoderma*), jamur oranye/karet, dan jamur susu.\n• **Pengendalian**: **Sangat tidak disarankan memakai obat kimia sintetis**. Gunakan pestisida nabati/organik, pasang jaring kasa/paranet pada ventilasi, jaga sanitasi lantai, serta segera pisahkan/buang baglog yang terkontaminasi parah."
  },
  {
    "id": "kb-gizi-khasiat",
    "category": "Edukasi Produk",
    "title": "Kandungan Gizi, Manfaat & Khasiat Kesehatan",
    "keywords": [
      "gizi",
      "nutrisi",
      "manfaat",
      "khasiat",
      "kesehatan",
      "protein",
      "kolesterol",
      "diet",
      "vitamin",
      "kanker",
      "obat"
    ],
    "answer": "Jamur tiram adalah sumber nutrisi super (*superfood*):\n• **Protein Tinggi**: Mengandung 10,5%–30,4% protein nabati (2 kali lebih tinggi dari asparagus dan kubis, jauh di atas beras).\n• **9 Asam Amino Esensial**: Kaya asam amino lengkap yang dibutuhkan tubuh manusia.\n• **Kaya Serat & Rendah Lemak**: Mengandung 72% asam lemak tak jenuh, aman dan efektif untuk diet sehat.\n• **Khasiat Medis**: Mengandung senyawa *pleuran*, *Beta-D-glucan*, dan efek statin alami (*plovastin*) yang terbukti klinis membantu menurunkan kolesterol, meningkatkan daya tahan tubuh, serta memiliki sifat antitumor dan antikanker."
  },
  {
    "id": "kb-manajemen-6m",
    "category": "Manajemen Usaha",
    "title": "Manajemen Agribisnis 6M Waroeng Jamur",
    "keywords": [
      "manajemen",
      "6m",
      "man",
      "money",
      "machine",
      "material",
      "market",
      "methods",
      "sop",
      "pengelolaan"
    ],
    "answer": "Penerapan 6M dalam budidaya jamur tiram:\n• **Man (Manusia)**: Tenaga kerja teliti, tekun, dan disiplin SOP.\n• **Money (Modal/Uang)**: Pengelolaan modal kerja, perhitungan cashflow, dan simulasi ROI.\n• **Machine (Peralatan)**: Mesin mixer, alat pres baglog, drum steamer, dan sprayer pengkabut.\n• **Material (Bahan)**: Kualitas serbuk kayu, bibit unggul F0-F2 teruji, dan dedak murni.\n• **Market (Pasar)**: Saluran pasokan pasar tradisional, restoran, reseller, hingga konsumen akhir.\n• **Methods (Metode/SOP)**: Prosedur operasional terstandar dari inokulasi hingga penanganan pasca panen."
  },
  {
    "id": "kb-pemasaran-olahan",
    "category": "Pemasaran",
    "title": "Teknik Pemasaran & Diversifikasi Produk Olahan",
    "keywords": [
      "pemasaran",
      "jual jamur",
      "strategi",
      "pasar",
      "target pasar",
      "olahan",
      "keripik",
      "krispi",
      "abon",
      "nugget",
      "kuliner"
    ],
    "answer": "Strategi pemasaran Waroeng Jamur Mang Yayat:\n• **Jamur Segar**: Pasokan subuh ke pasar induk, pedagang sayur keliling, rumah makan, dan hotel.\n• **Produk Olahan Bernilai Tambah**: Mengolah jamur menjadi keripik jamur crispy rendah minyak (*spinner*), abon jamur, dan camilan sehat.\n• **Paket Edukasi & Kemitraan**: Penjualan paket kumbung mini rumahan, bibit botol kultur, dan baglog siap berbuah bagi pembudidaya baru."
  },
  {
    "id": "kb-katalog-harga",
    "category": "Produk & Harga",
    "title": "Daftar Produk & Harga Resmi",
    "keywords": [
      "produk",
      "katalog",
      "harga",
      "jual",
      "beli",
      "pesan",
      "order",
      "biaya",
      "baglog berapa",
      "jamur sekilo"
    ],
    "answer": "Daftar produk resmi Waroeng Jamur Mang Yayat:\n1. **Jamur Tiram Putih Segar Grade A**: Rp 16.000 / kg (panen fajar 05.00 WIB, segar tanpa bahan kimia).\n2. **Baglog Jamur Siap Berbuah**: Rp 3.500 / baglog (miselium 90–100% tebal, siap tumbuh).\n3. **Keripik Jamur Tiram Crispy**: Rp 15.000 / pouch (renyah gurih, ditiriskan mesin spinner).\n4. **Paket Kumbung Mini Edukasi Rumahan**: Rp 55.000 / paket (isi 5 baglog + sprayer kabut mini).\n5. **Bibit Murni Jamur F0, F1, F2**: Hubungi langsung untuk stok kultur botol.\nPemesanan via WhatsApp: **0821-1991-8783**."
  },
  {
    "id": "kb-kemitraan-pelatihan",
    "category": "Kemitraan",
    "title": "Program Kemitraan, Pelatihan & Kunjungan Riset",
    "keywords": [
      "kemitraan",
      "mitra",
      "pelatihan",
      "kursus",
      "belajar",
      "kunjungan",
      "studi",
      "mahasiswa",
      "unsil",
      "kerjasama",
      "b2b"
    ],
    "answer": "Waroeng Jamur Mang Yayat membuka program kemitraan dan edukasi:\n• **Kemitraan Budidaya**: Pasokan rutin baglog berkualitas disertai pendampingan teknis hingga panen.\n• **Pelatihan Budidaya Jamur**: Bimbingan langsung bersama instruktur berpengalaman binaan Dinas Pertanian.\n• **Kunjungan Studi / Magang Riset**: Terbuka untuk mahasiswa (seperti UNSIL dan universitas lain), pelajar SMK Pertanian, dan instansi.\nHubungi WhatsApp: **0821-1991-8783**."
  },
  {
    "id": "kb-kontak-lokasi",
    "category": "Kontak & Lokasi",
    "title": "Alamat Kumbung, Jam Buka & Kontak WhatsApp",
    "keywords": [
      "alamat",
      "lokasi",
      "dimana",
      "jalan",
      "buka jam berapa",
      "jam operasional",
      "kontak",
      "nomor wa",
      "whatsapp",
      "telepon"
    ],
    "answer": "• **Alamat**: Kp. Cicarate / Sindangsuka RT 003/RW 009 (dan RT 01/RW 09), Kelurahan Gununggede, Kecamatan Kawalu, Kota Tasikmalaya, Jawa Barat 46182.\n• **Jam Operasional**: Setiap hari (Senin–Minggu) pukul 09.00–16.00 WIB.\n• **Waktu Panen Segar**: Pukul 05.00–08.00 WIB.\n• **WhatsApp Resmi Owner (Kang Irwan)**: **0821-1991-8783**."
  }
];
  let config = {
    botName: 'KANG SUPA',
    greeting: 'Sampurasun. Saya **KANG SUPA**, asisten virtual Waroeng Jamur Mang Yayat. Silakan ajukan pertanyaan seputar usaha budidaya jamur tiram, baglog, produk, maupun kemitraan kami.',
    quickQuestions: []
  };

  let hasGreeted = false;

  window.updateKangSupaKnowledge = function(newKb, newConfig) {
    if (newKb) knowledge = newKb;
    if (newConfig) {
      config = Object.assign(config, newConfig);
    }
  };

  function toggleChat(open) {
    if (open) {
      if (backdrop) backdrop.classList.remove('hidden');
      chatWindow.classList.remove('hidden');
      setTimeout(() => {
        chatWindow.classList.remove('scale-95', 'opacity-0');
        chatWindow.classList.add('scale-100', 'opacity-100');
      }, 10);
      toggleBtn.classList.add('hidden');
      if (!hasGreeted) {
        showGreeting();
        hasGreeted = true;
      }
      if (input) setTimeout(() => input.focus(), 150);
    } else {
      if (backdrop) backdrop.classList.add('hidden');
      chatWindow.classList.remove('scale-100', 'opacity-100');
      chatWindow.classList.add('scale-95', 'opacity-0');
      setTimeout(() => {
        chatWindow.classList.add('hidden');
        toggleBtn.classList.remove('hidden');
      }, 250);
    }
  }

  toggleBtn.addEventListener('click', () => toggleChat(true));
  closeBtn.addEventListener('click', () => toggleChat(false));
  if (backdrop) backdrop.addEventListener('click', () => toggleChat(false));
  resetBtn.addEventListener('click', () => {
    messagesContainer.innerHTML = '';
    showGreeting();
  });

  function showGreeting() {
    appendBotMessage(config.greeting || 'Sampurasun. Saya **KANG SUPA**, asisten virtual Waroeng Jamur Mang Yayat. Silakan ajukan pertanyaan seputar usaha budidaya jamur tiram, baglog, produk, maupun kemitraan kami.');
  }

  function renderQuickPrompts() {
    if (!quickPromptsContainer) return;
    quickPromptsContainer.innerHTML = '';
    quickPromptsContainer.classList.add('hidden');
  }

  function appendUserMessage(text) {
    const bubble = document.createElement('div');
    bubble.className = 'flex justify-end';
    bubble.innerHTML = `
      <div class="max-w-[85%] bg-forest-800 text-white p-3 rounded-2xl rounded-tr-none shadow-sm space-y-1">
        <p class="leading-relaxed">${escapeHtml(text)}</p>
        <span class="block text-[9px] text-emerald-200 text-right">${getCurrentTime()}</span>
      </div>
    `;
    messagesContainer.appendChild(bubble);
    scrollToBottom();
  }

  function appendBotMessage(text) {
    const bubble = document.createElement('div');
    bubble.className = 'flex items-start gap-2';

    // Parse simple markdown: **bold**, *italic*, bullets, and linebreaks
    let formatted = escapeHtml(text)
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>')
      .replace(/• (.*?)(<br>|$)/g, '<div class="flex items-start gap-1.5 my-0.5"><span class="text-amber-500 font-bold">•</span><span>$1</span></div>');

    bubble.innerHTML = `
      <div class="w-7 h-7 rounded-full bg-amber-500 overflow-hidden shrink-0 shadow-sm mt-0.5 border border-amber-300">
        <img src="assets/images/kang-supa-avatar.png" alt="Kang Supa" class="w-full h-full object-cover">
      </div>
      <div class="max-w-[86%] bg-white text-stone-800 p-3.5 rounded-2xl rounded-tl-none border border-stone-200 shadow-sm space-y-2 leading-relaxed">
        <div>${formatted}</div>
        <div class="pt-1 flex items-center justify-between text-[9px] text-stone-400 border-t border-stone-100">
          <span>KANG SUPA • Waroeng Jamur</span>
          <a href="https://wa.me/6282119918783?text=${encodeURIComponent(`Sampurasun Mang Yayat, saya ingin konsultasi lebih lanjut terkait informasi Waroeng Jamur.`)}" target="_blank" class="inline-flex items-center gap-1 font-bold text-emerald-700 hover:underline">
            <span>WhatsApp Owner</span> ➜
          </a>
        </div>
      </div>
    `;
    messagesContainer.appendChild(bubble);
    scrollToBottom();
  }

  function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'kangSupaTyping';
    indicator.className = 'flex items-center gap-2 text-stone-400 text-xs';
    indicator.innerHTML = `
      <div class="w-6 h-6 rounded-full overflow-hidden shrink-0 border border-amber-300">
        <img src="assets/images/kang-supa-avatar.png" alt="Kang Supa" class="w-full h-full object-cover">
      </div>
      <div class="bg-white px-3 py-2 rounded-2xl rounded-tl-none border border-stone-200 flex items-center gap-1">
        <span class="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce"></span>
        <span class="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce" style="animation-delay: 0.15s"></span>
        <span class="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce" style="animation-delay: 0.3s"></span>
      </div>
    `;
    messagesContainer.appendChild(indicator);
    scrollToBottom();
  }

  function removeTypingIndicator() {
    const el = document.getElementById('kangSupaTyping');
    if (el) el.remove();
  }

  function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, function(m) {
      return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'}[m];
    });
  }

  function getCurrentTime() {
    const now = new Date();
    return now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
  }

  function handleUserQuery(query) {
    const q = query.trim();
    if (!q) return;

    appendUserMessage(q);
    showTypingIndicator();

    setTimeout(() => {
      removeTypingIndicator();
      const answer = findAnswer(q);
      appendBotMessage(answer);
    }, 350);
  }

  function findAnswer(query) {
    const raw = query.trim();
    const q = raw.toLowerCase();
    const tokens = q.split(/[\s,?.!-]+/).filter(t => t.length > 0);

    if (tokens.length === 0) {
      return 'Sampurasun. Silakan ajukan pertanyaan seputar usaha budidaya jamur tiram, baglog, produk, maupun kemitraan Waroeng Jamur Mang Yayat.';
    }

    // 1. Deteksi Sapaan Khusus Sesuai Ketikan Tamu (Hi, Hallo, Allo, Selamat Pagi, Siang, Sore, Malam)
    // Sesuai instruksi: balas dengan ketikan mereka + " Sampurasun. Saya KANG SUPA, asisten virtual Waroeng Jamur Mang Yayat. Silakan ajukan pertanyaan seputar usaha budidaya jamur tiram, baglog, produk, maupun kemitraan kami."
    const cleanGreeting = q.replace(/[!.?]+$/, '').trim();
    const isShortQuery = tokens.length <= 4;
    const hasCoreMushroomKeyword = tokens.some(t => [
      'jamur', 'baglog', 'kumbung', 'bibit', 'harga', 'beli', 'panen', 'hama', 'nutrisi', 'cara', 'alamat', 'pesan', 'roi'
    ].includes(t));

    if (isShortQuery && !hasCoreMushroomKeyword) {
      let matchedGreeting = null;

      if (/^(?:hi|hai|hey|hei)\b/i.test(cleanGreeting)) {
        matchedGreeting = cleanGreeting.startsWith('hai') ? 'Hai.' : 'Hi.';
      } else if (/^(?:hallo|halo|hello)\b/i.test(cleanGreeting)) {
        matchedGreeting = cleanGreeting.startsWith('halo') ? 'Halo.' : 'Hallo.';
      } else if (/^(?:allo|alo)\b/i.test(cleanGreeting)) {
        matchedGreeting = 'Allo.';
      } else if (cleanGreeting.includes('pagi')) {
        matchedGreeting = cleanGreeting.includes('selamat') ? 'Selamat pagi.' : 'Pagi.';
      } else if (cleanGreeting.includes('siang')) {
        matchedGreeting = cleanGreeting.includes('selamat') ? 'Selamat siang.' : 'Siang.';
      } else if (cleanGreeting.includes('sore')) {
        matchedGreeting = cleanGreeting.includes('selamat') ? 'Selamat sore.' : 'Sore.';
      } else if (cleanGreeting.includes('malam')) {
        matchedGreeting = cleanGreeting.includes('selamat') ? 'Selamat malam.' : 'Malam.';
      } else if (/^(?:assalamu['’]?alaikum|assalamualaikum|ass)\b/i.test(cleanGreeting)) {
        matchedGreeting = "Wa'alaikumussalam.";
      } else if (/^(?:sampurasun)\b/i.test(cleanGreeting)) {
        matchedGreeting = 'Rampes.';
      }

      if (matchedGreeting) {
        return `${matchedGreeting} Sampurasun. Saya **KANG SUPA**, asisten virtual Waroeng Jamur Mang Yayat. Silakan ajukan pertanyaan seputar usaha budidaya jamur tiram, baglog, produk, maupun kemitraan kami.`;
      }
    }

    const thanks = ['terima kasih', 'terimakasih', 'makasih', 'hatur nuhun', 'nuhun', 'thanks'];
    if (tokens.some(t => thanks.some(th => q.includes(th)))) {
      return 'Sami-sami! Senang bisa melayani Anda. Silakan tanyakan kembali jika ada hal lain yang ingin Anda ketahui seputar usaha budidaya jamur tiram kami.';
    }

    // 2. Deteksi Pertanyaan di Luar Topik (Out of Scope)
    const outOfScopeKeywords = [
      'presiden', 'politik', 'pemilu', 'partai', 'pilkada', 'menteri', 'dpr', 'uu', 'negara',
      'coding', 'python', 'javascript', 'html', 'css', 'php', 'program', 'java', 'react', 'code', 'script',
      'mobil', 'motor', 'bengkel', 'otomotif', 'bensin', 'honda', 'yamaha', 'toyota', 'daihatsu',
      'kucing', 'anjing', 'burung', 'lele', 'cupang', 'sapi', 'kambing', 'ayam', 'bebek',
      'game', 'film', 'movie', 'musik', 'lagu', 'sepak bola', 'bola', 'chelsea', 'mu', 'persib',
      'crypto', 'saham', 'bitcoin', 'trading', 'forex', 'pinjol', 'slot', 'judi',
      'cuaca hari ini', 'ramalan', 'zodiak', 'horoskop', 'pacar', 'jodoh', 'cinta'
    ];
    if (tokens.some(t => outOfScopeKeywords.includes(t))) {
      return 'Mohon maaf, itu diluar pengetahuan saya. Tanyakan lebih lanjut ke WA **0821-1991-8783** langsung kepada Owner Waroeng Jamur Mang Yayat (Kang Irwan).';
    }

    // 3. Pencocokan Cerdas & Presisi ke Basis Pengetahuan (Knowledge Base)
    if (!knowledge || knowledge.length === 0) {
      return 'Waroeng Jamur Mang Yayat siap melayani pemesanan jamur tiram segar, baglog siap berbuah, dan kemitraan agribisnis. Silakan hubungi WhatsApp resmi: **0821-1991-8783**.';
    }

    let scored = knowledge.map(item => {
      let score = 0;
      const titleLower = (item.title || '').toLowerCase();
      const answerLower = (item.answer || '').toLowerCase();
      const keywords = (item.keywords || []).map(k => k.toLowerCase());

      tokens.forEach(tok => {
        if (tok.length <= 1) return;
        if (keywords.includes(tok)) score += 16;
        else if (keywords.some(k => k.includes(tok) || tok.includes(k))) score += 8;
        if (titleLower.includes(tok)) score += 10;
        if (answerLower.includes(tok)) score += 2;
      });

      return { item, score };
    });

    scored.sort((a, b) => b.score - a.score);

    if (scored[0] && scored[0].score >= 6) {
      return scored[0].item.answer;
    }

    // 4. Verifikasi Konteks Domain Jamur / Pertanian / Usaha
    const domainTerms = [
      'jamur', 'tiram', 'baglog', 'kumbung', 'bibit', 'panen', 'miselium', 'spora', 'pinhead',
      'sterilisasi', 'steam', 'inokulasi', 'inkubasi', 'pengukusan', 'serbuk', 'kayu', 'dedak', 'huut', 'kapur', 'dolomit',
      'olahan', 'keripik', 'crispy', 'hama', 'ulat', 'belatung', 'rametuk', 'lalat', 'tikus', 'penyakit', 'trichoderma',
      'sprayer', 'kabut', 'fogging', 'rak', 'kemitraan', 'mitra', 'kuliner', 'pasar', 'segmen', '6m',
      'pelatihan', 'kampus', 'mahasiswa', 'unsil', 'tugas', 'wawancara', 'studi', 'riset',
      'suhu', 'lembab', 'kelembaban', 'modal', 'roi', 'hasil', 'berat', 'omset',
      'alamat', 'lokasi', 'tempat', 'dimana', 'cicarate', 'sindangsuka', 'kawalu', 'tasikmalaya',
      'kontak', 'wa', 'whatsapp', 'telepon', 'pemilik', 'owner', 'irwan', 'mang yayat',
      'harga', 'beli', 'pesan', 'order', 'gizi', 'manfaat', 'khasiat', 'protein', 'kolesterol'
    ];
    const isDomainQuery = tokens.some(t => domainTerms.some(d => d.includes(t) || t.includes(d)));

    if (!isDomainQuery) {
      return 'Mohon maaf, itu diluar pengetahuan saya. Tanyakan lebih lanjut ke WA **0821-1991-8783** langsung kepada Owner Waroeng Jamur Mang Yayat (Kang Irwan).';
    }

    return 'Terima kasih atas pertanyaan Anda. Untuk konsultasi teknis lebih rinci mengenai hal tersebut, silakan hubungi langsung Owner Waroeng Jamur Mang Yayat (Kang Irwan) melalui WhatsApp resmi di nomor **0821-1991-8783**.'
  };

  window.askKangSupa = function(q) {
    if (input) input.value = q;
    handleUserQuery(q);
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = input.value;
    input.value = '';
    handleUserQuery(val);
  });
}
