# Sistem Pakar Diagnosis Penyakit Tanaman Padi
Sistem Pakar Diagnosis Penyakit Tanaman Padi Berbasis Web menggunakan Metode Forward Chaining.

## 👥 Pembagian Tugas & Ruang Lingkup Pengembangan

Untuk menghindari *merge conflict* pada repository, pengerjaan dibagi berdasarkan spesialisasi file:

**1. Data & Asset Engineer (Anggota 1/Anaspunya)**
* **Ruang Lingkup:** `data/data.json` dan `static/images/fotoGejala` dan `static/images/fotoPadi`.
* **Deskripsi Tugas:** Menyusun basis pengetahuan (gejala dan aturan penyakit) ke dalam format JSON. Mengumpulkan, memotong (*crop*), dan memastikan standardisasi penamaan file gambar/aset visual.

**2. Landing Page Developer (Anggota 2/Bonanza-dev)**
* **Ruang Lingkup:** `index.html` dan `static/style/style.css` dan `static/images`.
* **Deskripsi Tugas:** Merancang dan merapikan *User Interface* (UI) halaman utama (*Hero section*), mengatur tata letak, serta menyusun materi penjelasan mengenai metode Forward Chaining.

**3. Catalog UI Developer (Anggota 3/YesiNurFitriana)**
* **Ruang Lingkup:** `template/informasi.html` dan `static/style/style2.css`.
* **Deskripsi Tugas:** Membangun antarmuka katalog penyakit menggunakan komponen *Card* dan fitur *Accordion* untuk menampilkan daftar gejala secara dinamis.

**4. Detail Pages Developer (Anggota 4/elvita386)**
* **Ruang Lingkup:** Direktori `template/detailPenyakit/` (`p1.html` - `p5.html`).
* **Deskripsi Tugas:** Menyusun kerangka dan konten dari lima halaman detail penyakit, mencakup penyebab, deskripsi rinci, dan solusi penanganan.

**5. Diagnosis UI Developer (Anggota 5/elyzamaharani1006-cmyk)**
* **Ruang Lingkup:** `template/diagnosis.html` dan `static/style/style3.css`.
* **Deskripsi Tugas:** Membangun *form* input identitas pengguna dan menyiapkan *container* kosong (contoh: `<div id="gejala-list"></div>`) sebagai wadah *render* DOM. Anggota ini hanya fokus pada struktur HTML/CSS tanpa manipulasi logika.

**6. Algorithm & Logic Engineer (Anggota 6/srydw02)**
* **Ruang Lingkup:** `static/js/script.js` (100%).
* **Deskripsi Tugas:** Menulis logika *Asynchronous* (`fetch` API) untuk menarik data JSON, merender DOM untuk memunculkan *checkbox* gejala, dan mengimplementasikan algoritma **Forward Chaining** (struktur *If-Else*) untuk memproses hasil diagnosis akhir.

---

## 🚀 Cara Menjalankan Project (Local Development)
Karena project ini menggunakan `fetch` API untuk mengambil file eksternal (`data.json`), project ini tidak dapat dijalankan hanya dengan *double-click* file HTML akibat pembatasan CORS pada *browser*. 

**Langkah eksekusi:**
1. Buka folder project menggunakan kode editor (contoh: Visual Studio Code).
2. Pastikan ekstensi **Live Server** sudah terinstal.
3. Klik kanan pada file `index.html` lalu pilih **"Open with Live Server"**.