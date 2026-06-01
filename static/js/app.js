class SPARouter {
  constructor() {
    this.db = null;
    this.init();
  }

  async init() {
    try {
      // 1. Ambil database JSON tunggal buatan Hugo
      const response = await fetch('/index.json');
      const data = await response.json();
      this.db = data;

      // 2. Render daftar bab di halaman utama
      this.renderHomepage();

      // 3. Dengarkan perubahan URL hash (#)
      window.addEventListener('hashchange', () => this.handleRoute());
      this.handleRoute();
    } catch (error) {
      console.error("Gagal memuat database novel:", error);
    }
  }

  renderHomepage() {
    const listContainer = document.getElementById('novel-list');
    if (!listContainer || !this.db) return;

    // Kelompokkan bab berdasarkan novelnya (ekstrak dinamis)
    listContainer.innerHTML = this.db.map(chap => `
      <div class="p-4 rounded-xl border border-neutral-800 bg-[#181818] hover:bg-[#202020] transition-all">
        <h3 class="text-lg font-bold text-white">${chap.title}</h3>
        <p class="text-xs text-neutral-500 mt-1">Kategori: ${chap.novel}</p>
        <a href="#/read/${chap.slug}" class="inline-block mt-3 text-sm font-medium text-blue-400 hover:underline">
          Baca Bab Ini →
        </a>
      </div>
    `).join('');
  }

  handleRoute() {
    const hash = window.location.hash;
    const homeView = document.getElementById('homepage-view');
    const readView = document.getElementById('reading-view');

    if (hash.startsWith('#/read/')) {
      // Skenario Pembaca Membuka Halaman Baca Bab
      const slug = hash.replace('#/read/', '');
      const chapter = this.db?.find(c => c.slug === slug);

      if (chapter) {
        document.getElementById('chapter-title').innerText = chapter.title;
        document.getElementById('novel-parent-name').innerText = `Novel: ${chapter.novel}`;
        document.getElementById('chapter-content').innerHTML = chapter.content;

        homeView.classList.add('hidden');
        readView.classList.remove('hidden');
        window.scrollTo(0, 0);
      }
    } else {
      // Skenario Default (Halaman Utama / Beranda)
      readView.classList.add('hidden');
      homeView.classList.remove('hidden');
    }
  }

  navigate(path) {
    window.location.hash = path === '/' ? '' : `#${path}`;
  }
}

// Jalankan sistem Router SPA saat halaman siap
const router = new SPARouter();
