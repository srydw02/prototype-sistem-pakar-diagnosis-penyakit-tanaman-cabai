let knowledgeBase = {};
let currentGejalaIndex = 0;
let selectedGejala = [];
let gejalaKeys = [];

fetch('/data/data.json')
  .then(function(response) {
    return response.json();
  })
  .then(function(data) {
    knowledgeBase = data;
    gejalaKeys = Object.keys(data.gejala);
    
    // CEK SESSION STORAGE: Jika ada sesi diagnosis yang tersimpan saat user klik 'back'
    let savedDiagnosis = sessionStorage.getItem('savedDiagnosis');
    if (savedDiagnosis) {
        selectedGejala = JSON.parse(savedDiagnosis);
        prosesDiagnosis(); // Langsung lompat ke hasil
    } else {
        tampilkanPertanyaan(); // Jika tidak ada, mulai dari pertanyaan pertama
    }
  });

function forwardChaining(faktaTerpilih) {
  let workingMemory = new Set(faktaTerpilih);
  let hasil = {};

  for (let i = 0; i < knowledgeBase.aturan.length; i++) {
    let aturan = knowledgeBase.aturan[i];
    let semuaTerpenuhi = true;

    for (let j = 0; j < aturan.kondisi.length; j++) {
      let syarat = aturan.kondisi[j];
      if (!workingMemory.has(syarat)) {
        semuaTerpenuhi = false;
        break;
      }
    }

    if (semuaTerpenuhi) {
      let kodePenyakit = aturan.kesimpulan;
      if (hasil[kodePenyakit] === undefined) {
        hasil[kodePenyakit] = [];
      }
      hasil[kodePenyakit].push(aturan.id);
    }
  }

  return hasil;
}

// --- UPDATE FUNGSI TAMPILKAN PERTANYAAN DENGAN RATIO TERKUNCI & MARGIN ---
function tampilkanPertanyaan() {
  let gejalaContainer = document.getElementById('gejala-list');
  gejalaContainer.innerHTML = '';

  if (currentGejalaIndex < gejalaKeys.length) {
    let kode       = gejalaKeys[currentGejalaIndex];
    let dataGejala = knowledgeBase.gejala[kode];
    let nomorSoal  = currentGejalaIndex + 1;
    let total      = gejalaKeys.length;

    let disableKembali = '';
    if (currentGejalaIndex === 0) disableKembali = 'disabled';

    let persenProgress = Math.round((currentGejalaIndex / total) * 100);

    gejalaContainer.innerHTML =
      '<div class="progress mb-3" style="height:6px;">' +
        '<div class="progress-bar bg-success" style="width:' + persenProgress + '%"></div>' +
      '</div>' +
      '<p class="text-muted mb-2" style="font-size:0.85rem;">Pertanyaan ' + nomorSoal + ' dari ' + total + '</p>' +
      
      // Menambah padding pada card (p-4) agar space putih lebih luas
      '<div class="card p-4 text-center border-0 shadow-sm" style="border-radius: 15px;">' +

        // --- BUNGKUSAN GAMBAR (CONTAINER) ---
        '<div style="position: relative; overflow: hidden; border-radius: 12px; margin: 15px auto 20px auto; width: 92%; aspect-ratio: 4 / 3; background-color: #f8f9fa;">' +
          
          '<img src="' + dataGejala.gambar + '" style="width: 100%; height: 100%; object-fit: cover; display: block;">' +

          // OVERLAY KIRI (YA)
          '<div onclick="pilihGejala(true)" ' +
               'onmouseenter="this.style.opacity=\'1\'" ' +
               'onmouseleave="this.style.opacity=\'0\'" ' +
               'style="position: absolute; top: 0; left: 0; width: 50%; height: 100%; ' +
               'background-color: rgba(40, 167, 69, 0.85); color: white; display: flex; ' +
               'align-items: center; justify-content: center; font-size: 2.5rem; font-weight: bold; ' +
               'opacity: 0; transition: opacity 0.3s ease; cursor: pointer;">' +
            'YA' +
          '</div>' +

          // OVERLAY KANAN (TIDAK)
          '<div onclick="pilihGejala(false)" ' +
               'onmouseenter="this.style.opacity=\'1\'" ' +
               'onmouseleave="this.style.opacity=\'0\'" ' +
               'style="position: absolute; top: 0; right: 0; width: 50%; height: 100%; ' +
               'background-color: rgba(220, 53, 69, 0.85); color: white; display: flex; ' +
               'align-items: center; justify-content: center; font-size: 2.5rem; font-weight: bold; ' +
               'opacity: 0; transition: opacity 0.3s ease; cursor: pointer;">' +
            'TIDAK' +
          '</div>' +

        '</div>' +
        // --- AKHIR BUNGKUSAN GAMBAR ---

        '<h5 class="mb-2" style="font-weight: 600;">' + dataGejala.teks + '</h5>' +
        '<p class="text-muted small px-3">' + dataGejala.keterangan + '</p>' +
        
        '<p class="text-primary small mt-3 mb-0" style="font-weight: 500; font-size: 0.75rem;">' +
          'Klik sisi kiri gambar (YA) atau sisi kanan (TIDAK)' +
        '</p>' +
      '</div>' +
      
      '<div class="mt-4">' +
        '<button type="button" class="btn btn-light text-muted" onclick="prevQuestion()" ' + disableKembali + '>← Kembali</button>' +
      '</div>';
  } else {
    prosesDiagnosis();
  }
}

// --- FUNGSI UNTUK PILIH GEJALA OTOMATIS ---
function pilihGejala(isYa) {
  let kode = gejalaKeys[currentGejalaIndex];
  
  // Bersihkan jawaban sebelumnya untuk gejala ini jika ada
  let jawabanBersih = [];
  for (let i = 0; i < selectedGejala.length; i++) {
    if (selectedGejala[i] !== kode && selectedGejala[i] !== '!' + kode) {
      jawabanBersih.push(selectedGejala[i]);
    }
  }
  selectedGejala = jawabanBersih;

  // Masukkan jawaban baru
  if (isYa) {
    selectedGejala.push(kode);
  } else {
    selectedGejala.push('!' + kode);
  }

  // Otomatis maju ke pertanyaan berikutnya
  currentGejalaIndex++;
  tampilkanPertanyaan();
}

function prevQuestion() {
  if (currentGejalaIndex > 0) {
    currentGejalaIndex--;
    tampilkanPertanyaan();
  }
}

function prosesDiagnosis() {
  // SIMPAN JAWABAN KE SESSION STORAGE
  sessionStorage.setItem('savedDiagnosis', JSON.stringify(selectedGejala));

  let faktaTerpilih = [];
  for (let i = 0; i < selectedGejala.length; i++) {
    if (selectedGejala[i][0] !== '!') {
      faktaTerpilih.push(selectedGejala[i]);
    }
  }

  let hasilFC = forwardChaining(faktaTerpilih);
  let hasilArray = [];

  let daftarKode = Object.keys(knowledgeBase.penyakit);
  for (let i = 0; i < daftarKode.length; i++) {
    let kode = daftarKode[i];

    if (hasilFC[kode] !== undefined) {
      hasilArray.push({
        nama         : knowledgeBase.penyakit[kode].nama,
        jumlahAturan : hasilFC[kode].length,
        link         : knowledgeBase.penyakit[kode].link
      });
    }
  }

  for (let i = 0; i < hasilArray.length - 1; i++) {
    for (let j = 0; j < hasilArray.length - 1 - i; j++) {
      if (hasilArray[j].jumlahAturan < hasilArray[j + 1].jumlahAturan) {
        let temp          = hasilArray[j];
        hasilArray[j]     = hasilArray[j + 1];
        hasilArray[j + 1] = temp;
      }
    }
  }

  let htmlGejala = '';
  if (faktaTerpilih.length === 0) {
    htmlGejala = '<li><em>Tidak ada gejala yang dipilih</em></li>';
  } else {
    for (let i = 0; i < faktaTerpilih.length; i++) {
      let kodeGejala = faktaTerpilih[i];
      let teksGejala = knowledgeBase.gejala[kodeGejala].teks;
      htmlGejala += '<li>' + teksGejala + '</li>';
    }
  }

  let output = document.getElementById('hasil');

  output.innerHTML =
    '<h5 class="mt-3">Fakta yang dimasukkan:</h5>' +
    '<ul style="padding-left:20px;margin-top:8px;">' + htmlGejala + '</ul>' +
    '<h4 class="mt-4">Hasil Diagnosis (Forward Chaining):</h4>';

  if (hasilArray.length === 0) {
    output.innerHTML +=
      '<div class="alert alert-warning mt-2">' +
        '<strong>Tidak terdiagnosis.</strong> Gejala yang dipilih tidak memenuhi kondisi ' +
        'aturan manapun dalam basis pengetahuan. Silakan ulangi dan periksa gejala lebih teliti.' +
      '</div>';
  } else {
    for (let i = 0; i < hasilArray.length; i++) {
      let item = hasilArray[i];

      let labelUrutan;
      if (i === 0) { labelUrutan = 'Diagnosis Utama';  }
      else         { labelUrutan = 'Kemungkinan ' + (i + 1); }

      output.innerHTML +=
        '<div class="card mb-3 p-3 shadow-sm border-0">' +
          '<div class="d-flex align-items-center justify-content-between mb-2">' +
            '<h5 class="mb-0">' + item.nama + '</h5>' +
            '<span style="color: #2f281e; font-weight: 500;">' + labelUrutan + '</span>' +
          '</div>' +
          // '<a href="' + item.link + '" class="btn btn-lihat-info btn-sm mt-2">Lihat informasi</a>' +
             '<a href="' + item.link + '?ref=diagnosis" class="btn btn-lihat-info btn-sm mt-2">Lihat informasi</a>' +
        '</div>';
    }
  }

  // TAMBAHKAN TOMBOL UNTUK MENGULANG DIAGNOSIS BARU
  output.innerHTML += 
    '<div class="mt-4 mb-5 text-center">' +
        '<button class="btn btn-outline-success px-4 py-2" onclick="ulangiDiagnosis()" style="border-radius:10px; font-weight:600;">' +
            '↻ Mulai Diagnosis Baru' +
        '</button>' +
    '</div>';

  document.getElementById('diagnosisForm').style.display = 'none';
}

// --- FUNGSI UNTUK MERESET (MENGHAPUS SESI) ---
function ulangiDiagnosis() {
    sessionStorage.removeItem('savedDiagnosis'); // Hapus memori jawaban
    currentGejalaIndex = 0;
    selectedGejala = [];
    document.getElementById('hasil').innerHTML = ''; // Kosongkan hasil
    document.getElementById('diagnosisForm').style.display = 'block'; // Tampilkan ulang form
    tampilkanPertanyaan();
}