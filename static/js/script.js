document.addEventListener('DOMContentLoaded', () => {
    // Validasi apakah data.js sudah berhasil di-load oleh HTML
    if (typeof pakarData !== 'undefined') {
        renderForm();
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

function renderForm() {
    const formContainer = document.getElementById('gejala-list');
    let html = '';

    // Generate Custom Dropdown (Div & UL/LI) menggantikan Select/Option
    pakarData.gejala.forEach((g, index) => {
        html += `
        <div class="card mb-3 shadow-sm">
            <div class="card-body">
                <h6 class="font-weight-bold text-dark mb-3">
                    <span class="badge badge-danger mr-2">${index + 1}</span> Apakah ${g.nama}?
                </h6>
                
                <div class="custom-dropdown" data-id="${g.id}" data-value="0.0">
                    <div class="dropdown-selected">Tidak (0%)</div>
                    <ul class="dropdown-options">
                        <li data-value="0.0" class="selected-item">Tidak (0%)</li>
                        <li data-value="0.2">Tidak Tahu (20%)</li>
                        <li data-value="0.4">Sedikit Yakin (40%)</li>
                        <li data-value="0.6">Cukup Yakin (60%)</li>
                        <li data-value="0.8">Yakin (80%)</li>
                        <li data-value="1.0">Sangat Yakin (100%)</li>
                    </ul>
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

    // Inisialisasi event listener untuk dropdown baru
    initCustomDropdowns();
}

function initCustomDropdowns() {
    const dropdowns = document.querySelectorAll('.custom-dropdown');

    dropdowns.forEach(dropdown => {
        const selected = dropdown.querySelector('.dropdown-selected');
        const optionsList = dropdown.querySelector('.dropdown-options');
        const options = dropdown.querySelectorAll('.dropdown-options li');

        // Buka/Tutup dropdown saat diklik
        selected.addEventListener('click', (e) => {
            e.stopPropagation(); // Mencegah event lari ke window (click outside)
            
            // Tutup dropdown lain yang sedang terbuka
            document.querySelectorAll('.custom-dropdown').forEach(d => {
                if (d !== dropdown) d.classList.remove('active');
            });
            
            dropdown.classList.toggle('active');
        });

        // Pilih opsi
        options.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                
                // Ubah teks yang ditampilkan
                selected.innerText = option.innerText;
                
                // Simpan nilai value ke atribut parent container untuk dihitung nanti
                dropdown.setAttribute('data-value', option.getAttribute('data-value'));
                
                // Tandai opsi yang sedang aktif (untuk CSS marker)
                options.forEach(opt => opt.classList.remove('selected-item'));
                option.classList.add('selected-item');

                // Tutup dropdown
                dropdown.classList.remove('active');
            });
        });
    });

    // Fitur Click Outside: Tutup semua dropdown jika user ngeklik area luar
    document.addEventListener('click', () => {
        document.querySelectorAll('.custom-dropdown').forEach(d => {
            d.classList.remove('active');
        });
    });
}

function hitungCF() {
    // Tangkap dari div custom-dropdown, bukan class form-control
    const dropdowns = document.querySelectorAll('.custom-dropdown');
    let userInput = {};
    let adaInput = false;

    dropdowns.forEach(dropdown => {
        const val = parseFloat(dropdown.getAttribute('data-value'));
        if (val > 0) {
            userInput[dropdown.getAttribute('data-id')] = val;
            adaInput = true;
        }
    });

    if (!adaInput) {
        alert("Pilih minimal satu gejala yang terlihat pada tanaman cabai Anda!");
        return;
    }

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
    tampilkanHasil(hasilDiagnosis);
}

function tampilkanHasil(hasil) {
    const hasilContainer = document.getElementById('hasil');

    if (hasil.length === 0) {
        hasilContainer.innerHTML = `
        <div class="alert alert-warning text-center shadow-sm">
            <h5 class="alert-heading font-weight-bold mb-2"><i class="fas fa-exclamation-triangle"></i> Diagnosis Tidak Ditemukan</h5>
            <p class="mb-0">Gejala yang Anda masukkan tidak cocok dengan basis data penyakit cabai kami.</p>
        </div>`;
        hasilContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
    }

    const penyakitUtama = hasil[0];

    let html = `
    <div class="card shadow-lg mb-4">
        <div class="card-header bg-danger text-white py-3">
            <h4 class="mb-0 font-weight-bold text-center"><i class="fas fa-poll-h mr-2"></i> Hasil Diagnosis Sistem Pakar</h4>
        </div>
        <div class="card-body p-4 text-center">
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

    html += `
    <div class="text-center mt-4 mb-5">
        <button class="btn btn-outline-danger px-4 py-2 font-weight-bold" onclick="window.print()">
            <i class="fas fa-print mr-2"></i> Cetak Laporan PDF
        </button>
        <button class="btn btn-secondary px-4 py-2 font-weight-bold ml-2" onclick="location.reload()">
            <i class="fas fa-redo-alt mr-2"></i> Diagnosis Ulang
        </button>
    </div>`;

    hasilContainer.innerHTML = html;
    
    setTimeout(() => {
        hasilContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}