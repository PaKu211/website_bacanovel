class SPARouter {
  constructor() {
    this.db = null;
    this.currentNovelHash = '';
    this.currentFontSize = 100; // Persentase ukuran font dasar
    this.init();
  }

  async init() {
    try {
      const response = await fetch('/index.json');
      const data = await response.json();
      this.db = data;

      this.renderNovelKatalog();

      window.addEventListener('hashchange', () => this.handleRoute());
      this.handleRoute();
    } catch (error) {
      console.error("Gagal memuat database novel:", error);
    }
  }

  renderNovelKatalog() {
    const listContainer = document.getElementById('novel-list');
    if (!listContainer || !this.db) return;

    const daftarNovel = [...new Set(this.db.map(chap => chap.novel))];

    listContainer.innerHTML = daftarNovel.map(namaNovel => {
      const totalBab = this.db.filter(c => c.novel === namaNovel).length;
      return `
        <div class="p-5 rounded-xl border border-neutral-800 bg-[#181818] hover:bg-[#202020] transition-all group flex justify-between items-center">
          <div>
            <h3 class="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">${namaNovel}</h3>
            <p class="text-xs text-neutral-500 mt-1">${totalBab} Bab Terunggah</p>
          </div>
          <a href="#/novel/${encodeURIComponent(namaNovel)}" class="px-4 py-2 text-sm font-medium bg-neutral-800 text-white rounded-lg hover:bg-blue-600 transition-colors">
            Buka Novel →
          </a>
        </div>
      `;
    }).join('');
  }

  renderDaftarBab(namaNovel) {
    const listContainer = document.getElementById('novel-list');
    if (!listContainer || !this.db) return;

    const babNovel = this.db.filter(c => c.novel === namaNovel);

    listContainer.innerHTML = babNovel.map(chap => `
      <div class="p-4 rounded-xl border border-neutral-800 bg-[#181818] hover:bg-[#202020] transition-all">
        <h4 class="text-base font-semibold text-white">${chap.title}</h4>
        <a href="#/read/${chap.slug}" class="inline-block mt-2 text-sm font-medium text-blue-400 hover:underline">
          Mulai Membaca →
        </a>
      </div>
    `).join('');
  }

  // Fitur Mengubah Ukuran Huruf Cerita secara Instan
  changeFontSize(direction) {
    this.currentFontSize += direction * 10;
    if (this.currentFontSize < 70) this.currentFontSize = 70; // Batas terkecil
    if (this.currentFontSize > 150) this.currentFontSize = 150; // Batas terbesar
    
    const contentDiv = document.getElementById('chapter-content');
    if (contentDiv) {
      contentDiv.style.fontSize = `${this.currentFontSize}%`;
      document.getElementById('font-size-indicator').innerText = `${this.currentFontSize}%`;
    }
  }

  // Fitur Hitung Tombol Next & Prev Bab Otomatis
  setupNavigationButtons(currentChapter) {
    const prevBtn = document.getElementById('prev-chap-btn');
    const nextBtn = document.getElementById('next-chap-btn');
    
    // Ambil semua bab dari novel yang sama, lalu cari posisi indeks bab saat ini
    const sekumpulanBab = this.db.filter(c => c.novel === currentChapter.novel);
    const currentIdx = sekumpulanBab.findIndex(c => c.slug === currentChapter.slug);

    // Atur tombol Bab Sebelumnya
    if (currentIdx > 0) {
      prevBtn.href = `#/read/${sekumpulanBab[currentIdx - 1].slug}`;
      prevBtn.classList.remove('hidden');
    } else {
      prevBtn.classList.add('hidden');
    }

    // Atur tombol Bab Selanjutnya
    if (currentIdx < sekumpulanBab.length - 1) {
      nextBtn.href = `#/read/${sekumpulanBab[currentIdx + 1].slug}`;
      nextBtn.classList.remove('hidden');
    } else {
      nextBtn.classList.add('hidden');
    }
  }

  // Fitur Memuat Ulang Komentar Cusdis untuk Bab yang Aktif
  reloadComments(chapter) {
    const el = document.getElementById('cusdis_thread');
    if (el && window.renderCusdis) {
      el.setAttribute('data-page-id', chapter.slug);
      el.setAttribute('data-page-title', chapter.title);
      el.setAttribute('data-page-url', window.location.href);
      window.renderCusdis(el); // Paksa SDK Cusdis menggambar ulang form komentar bab ini
    }
  }

  handleRoute() {
    const hash = window.location.hash;
    const homeView = document.getElementById('homepage-view');
    const readView = document.getElementById('reading-view');
    const headerTitle = homeView.querySelector('h1');
    const headerDesc = homeView.querySelector('p');

    if (hash.startsWith('#/novel/')) {
      const namaNovel = decodeURIComponent(hash.replace('#/novel/', ''));
      this.currentNovelHash = hash;
      
      headerTitle.innerText = namaNovel;
      headerDesc.innerHTML = `<button onclick="window.location.hash=''" class="text-blue-400 hover:underline font-medium cursor-pointer">← Kembali ke Katalog Utama</button>`;
      
      this.renderDaftarBab(namaNovel);
      homeView.classList.remove('hidden');
      readView.classList.add('hidden');

    } else if (hash.startsWith('#/read/')) {
      const slug = hash.replace('#/read/', '');
      const chapter = this.db?.find(c => c.slug === slug);

      if (chapter) {
        this.currentNovelHash = `#/novel/${encodeURIComponent(chapter.novel)}`;
        
        document.getElementById('chapter-title').innerText = chapter.title;
        document.getElementById('novel-parent-name').innerHTML = `<a href="${this.currentNovelHash}" class="text-blue-400 hover:underline">Novel: ${chapter.novel}</a>`;
        document.getElementById('chapter-content').innerHTML = chapter.content;

        // Jalankan fitur navigasi, reset ukuran font, dan load komentar bab
        this.setupNavigationButtons(chapter);
        this.reloadComments(chapter);
        
        // Terapkan ukuran font yang disimpan user
        document.getElementById('chapter-content').style.fontSize = `${this.currentFontSize}%`;

        homeView.classList.add('hidden');
        readView.classList.remove('hidden');
        window.scrollTo(0, 0);
      }
    } else {
      headerTitle.innerText = "Katalog Novel";
      headerDesc.innerText = "Selamat membaca proyek hobi buatan sendiri.";
      
      this.renderNovelKatalog();
      homeView.classList.remove('hidden');
      readView.classList.add('hidden');
    }
  }
}

const router = new SPARouter();