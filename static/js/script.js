/**
 * SISTEM PAKAR DIAGNOSIS PENYAKIT CABAI
 * Metode: Certainty Factor (CF)
 * Mode: Local / Offline (Relative Path) + Sliding Pill Radio UI + The Ultimate Logic Memory
 */

// MAPPING FOTO PENYAKIT (ID Penyakit -> Relative Path File Gambar)
const fotoPenyakitMap = {
    'P01': '../static/images/assetPenyakit/BusukBuahAntraknosa.jpg',
    'P02': '../static/images/assetPenyakit/PenyakitVirusKuning.png',
    'P03': '../static/images/assetPenyakit/LayuFusarium.png',
    'P04': '../static/images/assetPenyakit/LayuBakteri.jpg',
    'P05': '../static/images/assetPenyakit/BercakDaun.png',
    'P06': '../static/images/assetPenyakit/HamaThrips.jpg',
    'P07': '../static/images/assetPenyakit/KutuDaun.png',
    'P08': '../static/images/assetPenyakit/KutuBuah.png'
};

document.addEventListener('DOMContentLoaded', () => {
    // Validasi apakah data.js sudah berhasil di-load oleh HTML
    if (typeof pakarData !== 'undefined') {
        renderForm();
        restoreStateMemory(); // Panggil memori saat halaman selesai dirender
    } else {
        const formContainer = document.getElementById('gejala-list');
        if (formContainer) {
            formContainer.innerHTML = `
                <div class="alert alert-danger text-center shadow-sm">
                    <strong><i class="fas fa-exclamation-triangle"></i> Fatal Error:</strong> 
                    Data pakar tidak ditemukan. Pastikan file <code>data.js</code> sudah dipanggil di HTML sebelum <code>script.js</code>.
                </div>
            `;
        }
    }
});

// Fungsi pembantu untuk menggerakkan animasi pill selector
function updateSliderPill(radio) {
    if (!radio.checked) return;
    const group = radio.closest('.slider-radio-group');
    const pill = group.querySelector('.slider-pill');
    const labels = group.querySelectorAll('.slider-opt-label');
    
    let index = 0;
    labels.forEach((label, i) => {
        if (label.contains(radio)) {
            index = i;
        }
    });
    
    // Meluncurkan pill menggunakan transform translateX berdasarkan index
    pill.style.transform = `translateX(${index * 100}%)`;
}

function renderForm() {
    const formContainer = document.getElementById('gejala-list');
    let html = '';

    // Keterangan Pilihan (LEGEND)
    html += `
    <div class="legend-opsi mb-4">
        <strong>Keterangan Pilihan:</strong>
        <div><span>[SY]</span> Sangat Yakin</div>
        <div><span>[Y]</span> Yakin</div>
        <div><span>[CY]</span> Cukup Yakin</div>
        <div><span>[R]</span> Ragu-ragu</div>
        <div><span>[T]</span> Tidak</div>
    </div>`;

    // Generate Sliding Pill Radio UI
    pakarData.gejala.forEach((g, index) => {
        html += `
        <div class="card mb-3 shadow-sm">
            <div class="card-body">
                <h6 class="font-weight-bold text-dark mb-3">
                    <span class="badge badge-danger mr-2">${index + 1}</span> Apakah ${g.nama}?
                </h6>
                
                <div class="slider-radio-group">
                    <div class="slider-track">
                        <div class="slider-pill"></div>
                    </div>
                    <div class="slider-options">
                        <label class="slider-opt-label">
                            <input type="radio" name="${g.id}" value="1.0">
                            <span>SY</span>
                        </label>
                        <label class="slider-opt-label">
                            <input type="radio" name="${g.id}" value="0.8">
                            <span>Y</span>
                        </label>
                        <label class="slider-opt-label">
                            <input type="radio" name="${g.id}" value="0.6">
                            <span>CY</span>
                        </label>
                        <label class="slider-opt-label">
                            <input type="radio" name="${g.id}" value="0.4">
                            <span>R</span>
                        </label>
                        <label class="slider-opt-label">
                            <input type="radio" name="${g.id}" value="0.0" checked>
                            <span>T</span>
                        </label>
                    </div>
                </div>
                
            </div>
        </div>`;
    });

    html += `
    <div class="text-center mt-5 mb-4">
        <button type="button" class="btn btn-danger btn-lg px-5 shadow" onclick="hitungCF()">
            <i class="fas fa-stethoscope mr-2"></i> Analisis Diagnosis
        </button>
    </div>`;

    formContainer.innerHTML = html;

    // Inisialisasi event listener
    const radios = document.querySelectorAll('.slider-opt-label input[type="radio"]');
    radios.forEach(radio => {
        radio.addEventListener('change', function() {
            updateSliderPill(this);
            saveStateLive();
            
            // THE ULTIMATE LOGIC: Hapus kotak hasil jika user merubah data iseng-iseng setelah diagnosis
            const hasilContainer = document.getElementById('hasil');
            if (hasilContainer && hasilContainer.innerHTML.trim() !== '') {
                hasilContainer.innerHTML = ''; 
                sessionStorage.removeItem('isAnalyzed'); 
            }
        });
    });

    // Set posisi awal pill pada opsi default (T / value 0.0)
    document.querySelectorAll('.slider-opt-label input[type="radio"]:checked').forEach(radio => {
        updateSliderPill(radio);
    });
}

/* --- MANAJEMEN MEMORI SESSION STORAGE --- */
function saveStateLive() {
    const selectedRadios = document.querySelectorAll('.slider-opt-label input[type="radio"]:checked');
    let userInput = {};
    selectedRadios.forEach(radio => {
        const val = parseFloat(radio.value);
        if (val > 0) { 
            userInput[radio.name] = val;
        }
    });
    sessionStorage.setItem('savedDiagnosis', JSON.stringify(userInput));
}

function restoreStateMemory() {
    const savedState = sessionStorage.getItem('savedDiagnosis');
    if (savedState) {
        const userInput = JSON.parse(savedState);
        
        Object.keys(userInput).forEach(name => {
            const val = userInput[name];
            const radio = document.querySelector(`.slider-opt-label input[type="radio"][name="${name}"][value="${val}"]`);
            if (radio) {
                radio.checked = true;
                updateSliderPill(radio); // Animasikan pill ke posisi terseleksi
            }
        });
        
        // Cek jika user sudah pernah klik tombol Analisis sebelumnya tanpa merubah form lagi
        if (sessionStorage.getItem('isAnalyzed') === 'true') {
            hitungCF(true); // Run mode background (tanpa auto-scroll)
        }
    }
}

function resetDiagnosis() {
    const konfirmasi = confirm("Yakin ingin mereset semua data diagnosis? Form gejala dan hasil analisis akan dihapus.");
    
    if (konfirmasi) {
        sessionStorage.removeItem('savedDiagnosis');
        sessionStorage.removeItem('isAnalyzed');
        window.scrollTo(0, 0);
        location.reload();
    }
}
/* ---------------------------------------- */

function hitungCF(isAutoRestore = false) {
    const selectedRadios = document.querySelectorAll('.slider-opt-label input[type="radio"]:checked');
    let userInput = {};
    let adaInput = false;

    selectedRadios.forEach(radio => {
        const val = parseFloat(radio.value);
        if (val > 0) {
            userInput[radio.name] = val;
            adaInput = true;
        }
    });

    if (!adaInput) {
        if (!isAutoRestore) {
            alert("Pilih minimal satu gejala yang terlihat pada tanaman cabai Anda!");
        }
        return;
    }

    // Tandai status bahwa hasil sudah dieksekusi untuk cache memori
    sessionStorage.setItem('isAnalyzed', 'true');
    saveStateLive();

    let hasilDiagnosis = [];

    pakarData.rules.forEach(rule => {
        let cfGabungan = 0;

        rule.gejala.forEach(g => {
            if (userInput[g.id_gejala]) {
                let cfHE = g.cf_pakar * userInput[g.id_gejala];

                if (cfGabungan === 0) {
                    cfGabungan = cfHE;
                } else {
                    cfGabungan = cfGabungan + cfHE * (1 - cfGabungan);
                }
            }
        });

        if (cfGabungan > 0) {
            const detailPenyakit = pakarData.penyakit.find(p => p.id === rule.id_penyakit);
            hasilDiagnosis.push({
                id: rule.id_penyakit,
                nama: detailPenyakit.nama,
                deskripsi: detailPenyakit.deskripsi,
                solusi: detailPenyakit.solusi,
                persentase: (cfGabungan * 100).toFixed(2)
            });
        }
    });

    hasilDiagnosis.sort((a, b) => b.persentase - a.persentase);
    tampilkanHasil(hasilDiagnosis, isAutoRestore);
}

function tampilkanHasil(hasil, isAutoRestore = false) {
    const hasilContainer = document.getElementById('hasil');

    if (hasil.length === 0) {
        hasilContainer.innerHTML = `
        <div class="alert alert-warning text-center shadow-sm">
            <h5 class="alert-heading font-weight-bold mb-2"><i class="fas fa-exclamation-triangle"></i> Diagnosis Tidak Ditemukan</h5>
            <p class="mb-0">Gejala yang Anda masukkan tidak cocok dengan basis data penyakit cabai kami.</p>
        </div>`;
        if (!isAutoRestore) hasilContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
    }

    const penyakitUtama = hasil[0];
    
    // Ambil foto dari mapping menggunakan relative path
    const imgSrc = fotoPenyakitMap[penyakitUtama.id] || '';

    // Mulai kerangka hasil
    let html = `
    <div id="print-area">
        <div class="card shadow-lg mb-4">
            <div class="card-header bg-danger text-white py-3">
                <h4 class="mb-0 font-weight-bold text-center"><i class="fas fa-poll-h mr-2"></i> Hasil Diagnosis Sistem Pakar</h4>
            </div>
            <div class="card-body p-4 text-center">
                
                ${imgSrc ? `
                <img id="hasil-foto-penyakit" 
                     src="${imgSrc}" 
                     alt="Foto ${penyakitUtama.nama}"
                     onerror="this.style.display='none';"
                     style="border-radius: 15px; box-shadow: 0 6px 20px rgba(185, 30, 30, 0.15); max-width: 100%; width: 320px; height: auto; object-fit: cover; margin-bottom: 25px; border: 4px solid #f8e9e9;">
                ` : ''}
                     
                <p class="text-muted font-weight-bold mb-1">TINGKAT KEYAKINAN:</p>
                <h1 class="display-4 font-weight-bold text-danger">${penyakitUtama.persentase}%</h1>
                <h3 class="text-dark font-weight-bold mt-3">${penyakitUtama.nama}</h3>
                
                <div class="text-left mt-5">
                    <h5 class="font-weight-bold text-dark"><i class="fas fa-info-circle text-danger mr-2"></i> Deskripsi Singkat</h5>
                    <p class="text-secondary">${penyakitUtama.deskripsi}</p>
                    
                    <h5 class="font-weight-bold text-dark mt-4"><i class="fas fa-prescription-bottle-alt text-danger mr-2"></i> Solusi & Penanganan</h5>
                    <p class="text-secondary" style="white-space: pre-line;">${penyakitUtama.solusi}</p>
                </div>
            </div>
        </div>`;

    if (hasil.length > 1) {
        html += `
        <div class="card shadow-sm mb-4">
            <div class="card-header bg-white pt-4 pb-2">
                <h6 class="mb-0 font-weight-bold text-secondary">Kemungkinan Penyakit Lainnya:</h6>
            </div>
            <ul class="list-group list-group-flush">`;
        
        for (let i = 1; i < Math.min(hasil.length, 4); i++) {
            html += `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <span class="font-weight-bold text-dark">${hasil[i].nama}</span>
                <span class="badge badge-warning text-dark px-3 py-2">${hasil[i].persentase}%</span>
            </li>`;
        }
        
        html += `</ul></div>`;
    }

    html += `</div>`; // Tutup div print-area

    // Tombol Cetak PDF dan Diagnosis Ulang
    html += `
    <div class="text-center mt-4 mb-5 d-print-none action-buttons">
        <button class="btn btn-outline-danger px-4 py-2 font-weight-bold" onclick="window.print()">
            <i class="fas fa-print mr-2"></i> Cetak Laporan PDF
        </button>
        <button class="btn btn-secondary px-4 py-2 font-weight-bold ml-2" onclick="resetDiagnosis()">
            <i class="fas fa-redo-alt mr-2"></i> Diagnosis Ulang
        </button>
    </div>`;

    hasilContainer.innerHTML = html;
    
    if (!isAutoRestore) {
        setTimeout(() => {
            hasilContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }
}