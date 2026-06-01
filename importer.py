import json
import os
import re
import sys

def slugify(text):
    """Mengubah judul novel menjadi format folder yang aman (lowercase & strip)"""
    text = text.lower()
    text = re.sub(r'[^a-z0-9\-]', '-', text)
    text = re.sub(r'-+', '-', text)
    return text.strip('-')

def import_novel(json_path):
    if not os.path.exists(json_path):
        print(f"Error: File {json_path} tidak ditemukan!")
        return

    print(f"Membuka file hasil crawl: {json_path}...")
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # 1. Ambil nama novel & buat folder tujuan
    novel_title = data.get('title', 'Novel Tanpa Judul').strip()
    novel_slug = slugify(novel_title)
    novel_dir = os.path.join('content', 'novel', novel_slug)
    os.makedirs(novel_dir, exist_ok=True)

    # 2. Buat file _index.md untuk mengunci nama induk novel di Hugo
    index_path = os.path.join(novel_dir, '_index.md')
    if not os.path.exists(index_path):
        with open(index_path, 'w', encoding='utf-8') as f:
            f.write('---\n')
            f.write(f'title: "{novel_title}"\n')
            f.write('---\n')
        print(f"==> Katalog induk baru dibuat untuk: {novel_title}")

    # 3. Bongkar dan potong seluruh isi bab
    chapters = data.get('chapters', [])
    print(f"==> Ditemukan {len(chapters)} bab. Memulai konversi massal...")

    for idx, ch in enumerate(chapters):
        ch_title = ch.get('title', f'Chapter {idx+1}').strip()
        ch_body = ch.get('body', '') # Mengambil HTML teks cerita dari lncrawl
        
        # Penamaan file dengan padding angka agar berurutan di sistem (ch-0001.md)
        ch_slug = f"ch-{idx+1:04d}"
        ch_file_path = os.path.join(novel_dir, f"{ch_slug}.md")
        
        # Tulis ke file Markdown standar Hugo
        with open(ch_file_path, 'w', encoding='utf-8') as f:
            f.write('---\n')
            f.write(f'title: "{ch_title}"\n')
            f.write(f'weight: {idx+1}\n')
            f.write('---\n')
            f.write(ch_body) # Menyuntikkan langsung teks cerita HTML asli

    print(f"🚀 Sukses! {len(chapters)} bab Novel '{novel_title}' berhasil diimpor.")

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Cara pakai: python importer.py <jalur_file_lncrawl.json>")
    else:
        import_novel(sys.argv[1])