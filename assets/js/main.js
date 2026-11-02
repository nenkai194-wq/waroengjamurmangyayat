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

  let knowledge = [];
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
    const q = query.trim().toLowerCase();
    const tokens = q.split(/[\s,?.!-]+/).filter(t => t.length > 1);

    if (tokens.length === 0) {
      return 'Sampurasun. Silakan ketik pertanyaan seputar budidaya jamur tiram, baglog, produk, atau kemitraan Waroeng Jamur Mang Yayat.';
    }

    // 1. Deteksi Sapaan Umum & Ucapan Terima Kasih
    const greetings = ['halo', 'hai', 'hello', 'sampurasun', 'pagi', 'siang', 'sore', 'malam', 'assalamualaikum', 'ass', 'kulanuwun'];
    if (tokens.some(t => greetings.includes(t)) && tokens.length <= 3) {
      return 'Sampurasun. Saya **KANG SUPA**, asisten virtual Waroeng Jamur Mang Yayat. Silakan ajukan pertanyaan seputar usaha budidaya jamur tiram, baglog, produk olahan, atau kemitraan kami.';
    }

    const thanks = ['terima kasih', 'terimakasih', 'makasih', 'hatur nuhun', 'nuhun', 'thanks'];
    if (tokens.some(t => thanks.some(th => q.includes(th)))) {
      return 'Sami-sami! Senang bisa melayani Anda dengan baik. Silakan tanyakan kembali jika ada hal lain yang ingin Anda ketahui seputar usaha budidaya jamur tiram kami.';
    }

    // 2. Deteksi Pertanyaan di Luar Topik (Out of Scope)
    const outOfScopeKeywords = [
      'presiden', 'politik', 'pemilu', 'partai', 'pilkada', 'menteri', 'dpr', 'uu',
      'coding', 'python', 'javascript', 'html', 'css', 'php', 'program', 'java', 'react', 'code',
      'mobil', 'motor', 'bengkel', 'otomotif', 'bensin', 'honda', 'yamaha', 'toyota',
      'kucing', 'anjing', 'burung', 'lele', 'cupang', 'sapi', 'kambing', 'ayam',
      'game', 'film', 'movie', 'musik', 'lagu', 'sepak bola', 'bola', 'chelsea', 'mu', 'persib',
      'crypto', 'saham', 'bitcoin', 'trading', 'forex', 'pinjol', 'slot', 'judi',
      'cuaca hari ini', 'ramalan', 'zodiak', 'horoskop', 'pacar', 'jodoh'
    ];
    if (tokens.some(t => outOfScopeKeywords.includes(t))) {
      return 'Mohon maaf, hal tersebut di luar pengetahuan saya. Silakan tanyakan langsung ke Owner Waroeng Jamur Mang Yayat (Kang Irwan) melalui WhatsApp resmi di nomor **0821-1991-8783**.';
    }

    // 3. Pencocokan Relevansi dengan Basis Pengetahuan (Knowledge Base)
    if (!knowledge || knowledge.length === 0) {
      return 'Waroeng Jamur Mang Yayat siap melayani pemesanan jamur tiram, baglog siap berbuah, dan kemitraan. Silakan hubungi WhatsApp resmi di **0821-1991-8783**.';
    }

    let scored = knowledge.map(item => {
      let score = 0;
      const titleLower = (item.title || '').toLowerCase();
      const answerLower = (item.answer || '').toLowerCase();
      const keywords = (item.keywords || []).map(k => k.toLowerCase());

      tokens.forEach(tok => {
        if (tok.length <= 1) return;
        if (keywords.includes(tok)) score += 12;
        else if (keywords.some(k => k.includes(tok) || tok.includes(k))) score += 6;
        if (titleLower.includes(tok)) score += 8;
        if (answerLower.includes(tok)) score += 1;
      });

      return { item, score };
    });

    scored.sort((a, b) => b.score - a.score);

    if (scored[0] && scored[0].score >= 4) {
      return scored[0].item.answer;
    }

    // 4. Verifikasi Konteks Jamur / Pertanian / Waroeng Jamur
    const domainTerms = [
      'jamur', 'tiram', 'baglog', 'kumbung', 'bibit', 'panen', 'miselium',
      'sterilisasi', 'olahan', 'keripik', 'crispy', 'hama', 'rametuk', 'lalat', 'tikus', 'penyakit',
      'sprayer', 'kabut', 'fogging', 'rak', 'kemitraan', 'mitra', 'kuliner', 'pasar',
      'pelatihan', 'kampus', 'mahasiswa', 'unsil', 'tugas', 'wawancara', 'studi',
      'suhu', 'lembab', 'kelembaban', 'modal', 'roi', 'hasil', 'berat', 'omset',
      'alamat', 'lokasi', 'tempat', 'dimana', 'cicarate', 'kawalu', 'tasikmalaya',
      'kontak', 'wa', 'whatsapp', 'telepon', 'pemilik', 'owner', 'irwan', 'mang yayat',
      'harga', 'beli', 'pesan', 'order', 'gizi', 'manfaat', 'khasiat'
    ];
    const isDomainQuery = tokens.some(t => domainTerms.some(d => d.includes(t) || t.includes(d)));

    if (!isDomainQuery) {
      return 'Mohon maaf, hal tersebut di luar pengetahuan saya. Silakan tanyakan langsung ke Owner Waroeng Jamur Mang Yayat (Kang Irwan) melalui WhatsApp resmi di nomor **0821-1991-8783**.';
    }

    // Default response jika konteks budidaya tapi belum ada detail spesifik
    return 'Terima kasih atas pertanyaannya. Untuk informasi atau konfirmasi teknis lebih lanjut terkait hal tersebut, silakan langsung menghubungi Owner Mang Yayat melalui WhatsApp resmi di **0821-1991-8783**.';
  }

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
