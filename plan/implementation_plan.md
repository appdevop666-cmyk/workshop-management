# Plan Implementasi: BengkelSync (Aplikasi PWA Checklist Sparepart Mobil)

Aplikasi Progressive Web App (PWA) ini dirancang khusus untuk mendigitalisasi proses inspeksi dan estimasi biaya pada **bengkel modifikasi mobil**. Aplikasi ini dapat diakses dengan lancar baik melalui perangkat mobile (untuk mekanik di lapangan) maupun desktop (untuk verifikator di kantor).



## 1. Arsitektur & Tech Stack
*   **Frontend Core:** React.js (menggunakan Vite untuk performa build yang cepat).
*   **PWA Support:** `vite-plugin-pwa` agar aplikasi bisa diinstal di HP dan memiliki kemampuan caching offline dasar.
*   **Styling:** CSS Vanilla (atau TailwindCSS jika diizinkan, sangat disarankan untuk mempercepat pembuatan UI yang responsif).
*   **State Management:** Zustand atau React Context API (ringan dan cukup untuk kebutuhan aplikasi ini).
*   **Routing:** React Router DOM.
*   **Backend & Auth (Rekomendasi):** Supabase (PostgreSQL + GoTrue Auth) untuk manajemen user dan database realtime.

## 2. Peran Pengguna (User Roles)
Aplikasi ini akan memiliki sistem Role-Based Access Control (RBAC):
1.  **Mekanik (Tukang Ceklist):**
    *   Mengakses aplikasi utamanya via Mobile/HP.
    *   Bisa melihat daftar antrean kendaraan/klien.
    *   Mengisi form checklist (memilih bagian mobil/sparepart yang diperbaiki).
    *   Menambahkan catatan perbaikan.
    *   Mengirim (Submit) checklist ke Verifikator.
2.  **Verifikator (Admin/Kasir):**
    *   Mengakses aplikasi utamanya via Desktop/Tablet.
    *   Menerima notifikasi atau melihat daftar checklist yang baru masuk.
    *   Mereview detail checklist dari Mekanik.
    *   Menginputkan harga (estimasi biaya) untuk setiap item/sparepart.
    *   Menyetujui dan mencetak/menyimpan estimasi akhir.
    *   Mengelola Master Data (Kategori dan Daftar Sparepart).
3.  **QC / Quality Control (Coming Soon):**
    *   Mengakses aplikasi untuk melakukan verifikasi pra-pengerjaan (mengecek kondisi awal mobil/rencana modifikasi) dan juga pengecekan akhir setelah pengerjaan selesai.
    *   Memberikan *final approval* sebelum mobil masuk pengerjaan maupun sebelum diserahkan kembali ke klien.

## 3. Fitur Utama (Core Features)

### A. Autentikasi (Login) & Navigasi Awal
*   Menggunakan metode login standar dengan **Email dan Password**.
*   **Screen Pemilihan Mode (Post-Login):** Setelah login, user operasional di lapangan akan diarahkan ke layar pemilihan mode: masuk ke menu **Checklist (Mekanik)** atau menu **QC (Coming Soon)**.
*   Proteksi *route* sehingga hanya user yang login yang bisa mengakses halaman utama.

### B. Modul Checklist (Khusus Mekanik)
*   **Form Klien/Kendaraan:** Input Plat Nomor, Nama Klien, Merek Mobil.
*   **Form Checklist Interaktif:** UI berbentuk list dengan checkbox untuk menandai bagian mana saja yang perlu diperbaiki (Mesin, Rem, Kaki-kaki, Eksterior, dll).
*   **Submit Workflow:** Tombol kirim yang akan mengubah status dokumen menjadi "Menunggu Verifikasi".

### C. Modul Verifikasi & Pricing (Khusus Verifikator)
*   **Dashboard Antrean:** Tabel berisi daftar kendaraan yang sedang diservis dan statusnya.
*   **Form Pricing:** Menampilkan detail dari mekanik dengan tambahan kolom input harga di sebelah setiap item sparepart.
*   **Kalkulasi Otomatis:** Menghitung total harga (Subtotal, Pajak/Diskon jika ada, Total Akhir).

### D. Modul Report (Laporan)
*   Laporan rekap pendapatan harian/mingguan/bulanan.
*   Riwayat servis berdasarkan klien atau plat nomor kendaraan.
*   **Fitur Export/Cetak:** Laporan dan tagihan estimasi perbaikan dapat di-*export* dan diunduh dalam format **PDF**.

### E. Modul Master Data (Khusus Verifikator)
*   **Kategori Sparepart (Fokus MVP):** Mengelola kategori utama. Untuk peluncuran awal, sistem akan difokuskan pada 2 kategori:
    *   **Exterior:** (contoh item: Cat, Bumper, Kaca, Lampu, dll).
    *   **Interior:** (contoh item: Audio, Jok, Dashboard, AC, dll).
*   **Daftar Item:** Menambah item sparepart spesifik di dalam setiap kategori sebagai database acuan checklist. Mekanik hanya tinggal memilih dari master data ini. *(Catatan MVP: Fitur manajemen jumlah Stok/Inventory tidak diperlukan untuk saat ini dan akan diabaikan/di-hidden agar aplikasi lebih sederhana).*

### F. Modul QC / Quality Control (Coming Soon)
*   **Form Pengecekan Akhir:** Menampilkan list perbaikan yang telah dikerjakan untuk di-crosscheck ulang secara fisik.
*   **Status Approval:** Mengubah status dari "Selesai/Priced" menjadi "QC Passed" (Siap Diambil) atau "Need Rework" (Perlu Perbaikan Ulang).

## 4. Alur Kerja (Workflow)
1.  **Klien Datang** ➡️ Mekanik membuka PWA di HP.
2.  Mekanik membuat **Tiket Baru** (Input Plat & Nama).
3.  Mekanik melakukan inspeksi dan mengisi **Checklist Sparepart/Perbaikan**, lalu klik **Kirim**.
4.  Data masuk ke Dashboard Verifikator dengan status *Pending*.
5.  **Verifikator** membuka tiket tersebut, mengecek item, dan **menginputkan Harga**.
6.  Verifikator menyimpan data, status berubah menjadi *Selesai/Priced*.
7.  **(Coming Soon) Tahap QC:** Bagian QC melakukan pengecekan akhir dan memberikan status *QC Passed*.
8.  Data tersimpan dan masuk ke **Report/Laporan**.

---
*Silakan klik tombol 'Proceed' jika Anda setuju dengan rencana ini atau berikan tanggapan untuk bagian yang perlu disesuaikan.*
