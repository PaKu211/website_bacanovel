# Hugo Novel Theme — README

Ringkasan singkat: tema Hugo ini dioptimalkan untuk membaca novel — rapi, responsif, dengan kontrol ukuran teks, dark mode, placeholder iklan, dan integrasi komentar Cusdis.

## Struktur proyek

```
/ (project root)
├─ archetypes/
│  └─ chapter.md            # archetype untuk bab baru
├─ assets/
│  └─ css/main.css          # entrypoint Tailwind
├─ layouts/
│  ├─ _default/
│  │  ├─ baseof.html        # layout dasar (blocks)
│  │  ├─ list.html          # section listing (chapters)
│  │  └─ single.html        # halaman baca (meng-extend baseof)
│  ├─ index.html            # homepage (extends baseof)
│  └─ partials/
│     ├─ ad-slot.html       # partial iklan (parametrik)
│     ├─ cusdis.html        # partial Cusdis (parametrik)
│     ├─ novel-card.html    # partial kartu novel untuk homepage
│     ├─ chapter-nav.html   # partial navigasi chapter
│     ├─ reading-controls.html
│     ├─ site-header.html
│     └─ theme-toggle-script.html
├─ static/
│  └─ css/                 # optional: compiled css jika Anda pakai Tailwind CLI
├─ content/                # tempat Hugo content (novel-slug/chapter-1.md)
├─ package.json            # skrip build css (npm run build:css)
├─ tailwind.config.js
├─ hugo.toml
├─ importer.py             # (opsional) script bantu impor teks ke markdown
└─ README.md
```

## `importer.py` — mengimpor teks mentah menjadi chapter markdown

Script kecil `importer.py` membantu mengonversi file teks menjadi file markdown dengan front matter Hugo.

Format teks mentah:
- Jika tidak memberikan `--title`, script akan mengambil baris pertama non-kosong sebagai judul bab.
- Baris-baris berikutnya dianggap isi bab (markdown-friendly).

Contoh penggunaan:

```bash
# Membuat content/my-novel/chapter-1.md dari file teks
python3 importer.py my-chapter.txt --novel-slug "My Novel" --chapter 1

# Membaca dari stdin:
cat my-chapter.txt | python3 importer.py - --novel-slug "My Novel" --chapter 2 --title "Bab Dua"
```

Output: sebuah file `content/my-novel/chapter-1.md` dengan front matter:
```
---
title: "..."
novel_title: "My Novel"
chapter_number: 1
date: YYYY-MM-DD
draft: true
next_chapter: ""
previous_chapter: ""
---

...isi...
```

> Catatan: `importer.py` adalah utilitas kecil yang tidak mengubah file lain. Selalu cek hasilnya dan ubah `draft` ke `false` jika siap dipublikasikan.

## `ad-slot.html` — pemakaian parametris dan `safeHTML`

Partial `layouts/partials/ad-slot.html` menerima sebuah `dict` dengan kunci opsional:
- `slot`: salah satu `top`, `middle`, `bottom`, atau default `generic`.
- `html`: string HTML mentah yang akan di-render *aman* menggunakan `safeHTML`.

Contoh pemakaian (placeholder default berdasarkan slot):

```gohtml
{{ partial "ad-slot.html" (dict "slot" "top") }}
```

Contoh pemakaian dengan HTML/skrip iklan mentah (aman dipanggil via `safeHTML`):

```gohtml
{{ $adHTML := "<ins class=\"adsbygoogle\" style=\"display:block\">...script...</ins>" }}
{{ partial "ad-slot.html" (dict "slot" "middle" "html" $adHTML) }}
```

Partial akan memeriksa apakah `html` tidak kosong; jika ada, ia akan merendernya dengan `safeHTML`. Jika kosong, ia menampilkan placeholder untuk slot yang diberikan.

## `cusdis.html` — pemakaian partial komentar

Partial `layouts/partials/cusdis.html` menerima `dict` berisi nilai-nilai berikut:
- `pageID` (mis: `.RelPermalink`)
- `pageURL` (mis: `.Permalink`)
- `pageTitle` (mis: `.Title`)
- `appID` (ID aplikasi Cusdis Anda)
- `host` (default `https://cusdis.com`)

Contoh pemanggilan di `single.html`:

```gohtml
{{ partial "cusdis.html" (dict "pageID" .RelPermalink "pageURL" .Permalink "pageTitle" .Title "appID" "your-cusdis-app-id" "host" "https://cusdis.com") }}
```

Ini akan me-render container komentar dan menambahkan loader script Cusdis secara otomatis.

## Cara menjalankan build lokal

Langkah singkat (asumsi Anda sudah menginstall `node`, `npm`, dan `hugo`):

1. Install dependensi Node (Tailwind CLI dan PostCSS):

```bash
npm install
```

2. Compile Tailwind ke CSS statis (opsional, tapi berguna jika Hugo di-server tidak memproses Tailwind otomatis):

```bash
npm run build:css
# atau jalankan mode watch saat develop
npm run watch:css
```

Perintah ini akan menghasilkan `static/css/main.css` (skrip di `package.json`), sehingga Hugo akan melayani CSS tercompile.

3. Jalankan Hugo server untuk melihat hasilnya secara lokal:

```bash
hugo server -D
```

Catatan tentang pipeline CSS dan Hugo Pipes
- Template menggunakan `resources.Get "css/main.css" | css.TailwindCSS | minify | fingerprint` di partial `head.html`. Jika versi Hugo Anda mendukung `css.TailwindCSS`, Hugo akan mencoba memproses `assets/css/main.css` lewat Tailwind secara internal.
- Jika Hugo Anda tidak mendukung pipeline itu, gunakan skrip `npm run build:css` untuk menghasilkan `static/css/main.css` dan pastikan template Anda merujuk ke lokasi tersebut.

## Contoh ringkas: menambahkan iklan custom middle

Di template `single.html` Anda bisa memanggil:

```gohtml
{{ $raw := "<div class=\"my-ad\">Ad code here</div>" }}
{{ partial "ad-slot.html" (dict "slot" "middle" "html" $raw) }}
```

## Troubleshooting singkat
- Jika style tidak muncul, pastikan `static/css/main.css` ada setelah `npm run build:css`, atau gunakan Hugo versi yang mendukung `css.TailwindCSS`.
- Jika Cusdis tidak tampil, cek `appID` dan koneksi ke `host`.

---

Jika mau, saya bisa menambahkan contoh file `content/my-novel/chapter-1.md` sebagai sampel, atau menambahkan skrip npm untuk men-serve Hugo otomatis. Mau lanjutkan dengan contoh content sampel? 
