# 🍄 Website Profil Perusahaan: Waroeng Jamur Mang Yayat (Tasikmalaya)

Website profil modern, responsif, dan elegan untuk **Waroeng Jamur Mang Yayat**—pelaku usaha agribisnis budidaya dan produk olahan jamur tiram organik di Kota Tasikmalaya, Jawa Barat.

Desain dan arsitektur website ini mengadopsi konsep **ATM (Amati, Tiru, Modifikasi)** dari official site **[Ladang Lima](https://ladanglima.com/)**, yang terkenal dengan visual *earthy*, narasi *from farm to table*, *brand storytelling*, serta integrasi ekosistem kemitraan dan produk sehat.

---

## 🌾 Konsep ATM (Amati, Tiru, Modifikasi) dari Ladang Lima

| Elemen Ladang Lima | Amati & Tiru | Modifikasi untuk Waroeng Jamur Mang Yayat |
| :--- | :--- | :--- |
| **Palet Warna & Nuansa** | Earthy green, organic warm cream, harvest gold, clean white | Forest green (`#1B3822`, `#2B5A37`), Harvest gold (`#C9822B`), Cream (`#FAF7F2`) |
| **5 Elements / Value Pillars** | 5 pilar kesehatan gluten-free & petani singkong | **5 Pilar Kebaikan Mang Yayat**: Organik, Panen Subuh, Baglog Super, Pemberdayaan Petani, Inovasi Olahan Gurih |
| **From Roots to Results Story** | Menampilkan perjalanan dari petani Jawa Timur ke produk jadi | **Dari Kumbung ke Meja Makan**: Cerita dedikasi Mang Yayat di Kawalu Tasikmalaya + Validasi Riset SWOT Unsil & Jurnal ASRITANI |
| **Product Showcase** | Grid produk bersih dengan filter kategori dan info nutrisi | Filter dinamis: Jamur Segar, Baglog & Bibit, Olahan Krispi, Paket Pelatihan & Suplai Horeka |
| **Interactive Feature** | Recipe ideas & lifestyle healthy alternatives | **Kalkulator Simulasi ROI Usaha Jamur**, Popup Resep Tradisional Sunda (Pepes Jamur, Jamur Crispy Daun Jeruk, Sup Bening), & Lightbox Galeri |
| **Call to Action (CTA)** | B2B Export / WhatsApp inquiry | Tombol pemesanan langsung WhatsApp dinamis dengan template teks otomatis |

---

## 📁 Struktur Direktori

```
waroengjamurmangyayat/
├── index.html                   # Halaman utama profil perusahaan (Single Page App)
├── README.md                    # Dokumentasi lengkap proyek
└── assets/
    ├── css/
    │   └── style.css            # Custom CSS, animasi, styling Ladang Lima aesthetic
    ├── js/
    │   └── main.js              # Interaktivitas (Filter, Modal, Kalkulator ROI, Lightbox, WA Form)
    └── images/
        ├── logo.svg             # Logo vektor Waroeng Jamur Mang Yayat
        ├── favicon.svg          # Favicon website
        ├── hero-mushroom.jpg    # Foto jamur tiram segar
        ├── jamur-tiram-putih.jpg
        ├── baglog-jamur.jpg     # Foto media tanam baglog
        ├── kumbung-rak.jpg      # Foto interior rak kumbung
        ├── mang-yayat.jpg       # Foto dedikasi Mang Yayat
        ├── keripik-jamur.jpg    # Produk olahan keripik krispi
        ├── edukasi-workshop.jpg # Foto pelatihan & riset kampus
        ├── bibit-f1.jpg         # Foto bibit unggul
        └── ...
```

---

## 🚀 Fitur-Fitur Utama

1. **Top Announcement Strip & Responsive Navbar**: Informasi panen subuh, jam buka, tombol kontak cepat, serta navigasi mobile drawer.
2. **Hero Section dengan Visual Collage**: Tagline kuat *"Segar Dari Kumbung, Penuh Kebaikan Nutrisi Untuk Keluarga Anda"*.
3. **5 Pilar Kebaikan Mang Yayat**: Menekankan 100% alami, panen subuh harian, miselium baglog 100% padat, binaan UMKM, dan alternatif kuliner nabati sehat.
4. **Kisah Perjalanan & Validasi Akademis**: Cerita Mang Yayat di Kp. Cicarate, Gununggede, Kawalu, Tasikmalaya, serta rujukan kajian ilmiah analisis SWOT Universitas Siliwangi (Jurnal ASRITANI).
5. **Katalog Produk Interaktif & Filter**:
   - Jamur Tiram Putih Segar Grade A
   - Baglog Siap Tumbuh (Miselium 100%)
   - Keripik Jamur Tiram Crispy
   - Bibit Jamur Tiram F1 & F2
   - Paket Kumbung Mini Edukasi Rumahan
   - Pelatihan Budidaya 1 Hari
   - Kemitraan Pasokan Horeka & Pasar
6. **Kalkulator Potensi Usaha Jamur (Interactive ROI Calculator)**:
   - Pengunjung dapat menggeser slider jumlah baglog (100 - 3.000 baglog) untuk menghitung estimasi modal, hasil panen (kg), omzet penjualan, dan estimasi laba bersih secara real-time!
7. **Dapur Mang Yayat (Resep Sehat Interaktif)**: Resep Pepes Jamur Sunda, Jamur Crispy Daun Jeruk, dan Sup Kaldu Jamur lengkap dengan langkah dan tombol pesan bahan baku langsung.
8. **Galeri Aktivitas & Lightbox Modal**: Dokumentasi visual kumbung, proses inokulasi, dan panen.
9. **FAQ Accordion & Formulir Konsultasi WhatsApp**: Form terintegrasi yang otomatis menyusun pesan WhatsApp rapi ke nomor Mang Yayat.
10. **Floating Action WhatsApp Button**: Memudahkan pengunjung chat langsung kapan saja.

---

## 💻 Cara Menjalankan Secara Lokal

Buka terminal di folder project ini:

```bash
# Menggunakan Python (yang sudah terpasang)
python -m http.server 8000
```
Lalu buka browser Anda di `http://localhost:8000`.
