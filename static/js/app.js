class SPARouter {
  constructor() {
    this.db = null;
    this.init();
  }

  async init() {
    try {
      const response = await fetch('/index.json');
      const data = await response.json();
      this.db = data;

      window.addEventListener('hashchange', () => this.handleRoute());
      this.handleRoute();
    } catch (error) {
      console.error("Gagal memuat database novel:", error);
    }
  }

  // LEVEL 1: Render Daftar Novel Unik (Katalog)
  renderNovelKatalog() {
    const listContainer = document.getElementById('novel-list');
    if (!listContainer || !this.db) return;

    // Ambil daftar nama novel yang unik (tanpa duplikat)
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

  // LEVEL 2: Render Daftar Bab khusus untuk Novel yang dipilih
  renderDaftarBab(namaNovel) {
    const listContainer = document.getElementById('novel-list');
    if (!listContainer || !this.db) return;

    // Filter bab yang hanya dimiliki oleh novel ini
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

  handleRoute() {
    const hash = window.location.hash;
    const homeView = document.getElementById('homepage-view');
    const readView = document.getElementById('reading-view');
    const headerTitle = homeView.querySelector('h1');
    const headerDesc = homeView.querySelector('p');

    if (hash.startsWith('#/novel/')) {
      // JALUR TAMPILAN: DAFTAR BAB NOVEL
      const namaNovel = decodeURIComponent(hash.replace('#/novel/', ''));
      
      headerTitle.innerText = namaNovel;
      headerDesc.innerHTML = `<button onclick="window.location.hash=''" class="text-blue-400 hover:underline font-medium">← Kembali ke Katalog Utama</button>`;
      
      this.renderDaftarBab(namaNovel);
      homeView.classList.remove('hidden');
      readView.classList.add('hidden');

    } else if (hash.startsWith('#/read/')) {
      // JALUR TAMPILAN: HALAMAN BACA ISI CERITA
      const slug = hash.replace('#/read/', '');
      const chapter = this.db?.find(c => c.slug === slug);

      if (chapter) {
        document.getElementById('chapter-title').innerText = chapter.title;
        document.getElementById('novel-parent-name').innerHTML = `<button onclick="window.location.hash='#/novel/${encodeURIComponent(chapter.novel)}'" class="text-blue-400 hover:underline">Novel: ${chapter.novel}</button>`;
        document.getElementById('chapter-content').innerHTML = chapter.content;

        // Modifikasi tombol kembali di halaman baca agar kembali ke daftar bab novelnya, bukan katalog utama
        const backBtn = readView.querySelector('button');
        backBtn.setAttribute('onclick', `window.location.hash='#/novel/${encodeURIComponent(chapter.novel)}'`);

        homeView.classList.add('hidden');
        readView.classList.remove('hidden');
        window.scrollTo(0, 0);
      }
    } else {
      // JALUR TAMPILAN: KATALOG UTAMA (DEFAULT)
      headerTitle.innerText = "Katalog Novel";
      headerDesc.innerText = "Selamat membaca proyek hobi buatan sendiri.";
      
      this.renderNovelKatalog();
      homeView.classList.remove('hidden');
      readView.classList.add('hidden');
    }
  }

  navigate(path) {
    window.location.hash = path === '/' ? '' : `#${path}`;
  }
}

const router = new SPARouter();