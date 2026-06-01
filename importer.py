import json
import os
import re
import sys
import shutil

def slugify(text):
    """Mengubah judul novel menjadi format folder yang aman (lowercase & strip)"""
    text = text.lower()
    text = re.sub(r'[^a-z0-9\-]', '-', text)
    text = re.sub(r'-+', '-', text)
    return text.strip('-')

def import_split_novel(target_folder):
    if not os.path.exists(target_folder):
        print(f"Error: Folder {target_folder} tidak ditemukan!")
        return

    meta_path = os.path.join(target_folder, 'meta.json')
    if not os.path.exists(meta_path):
        print(f"Error: Tidak menemukan meta.json di dalam {target_folder}!")
        return

    # Baca metadata novel
    print(f"Membaca metadata dari {meta_path}...")
    with open(meta_path, 'r', encoding='utf-8') as f:
        meta_data = json.load(f)

    novel_title = meta_data.get('title', 'Novel Tanpa Judul').strip()
    novel_slug = slugify(novel_title)
    
    # Deteksi letak root Hugo agar tidak salah naruh folder content
    hugo_root = '.' if os.path.exists('hugo.toml') else '..'
    novel_dir = os.path.join(hugo_root, 'content', 'novel', novel_slug)
    os.makedirs(novel_dir, exist_ok=True)

    # 1. Buat file _index.md untuk identitas induk novel
    index_path = os.path.join(novel_dir, '_index.md')
    with open(index_path, 'w', encoding='utf-8') as f:
        f.write('---\n')
        f.write(f'title: "{novel_title}"\n')
        f.write('---\n')
    print(f"==> Katalog induk siap di Hugo: {novel_title}")

    # 2. Amankan Gambar Sampul (cover.jpg) ke folder static Hugo untuk kebutuhan SPA
    cover_src = os.path.join(target_folder, 'cover.jpg')
    if os.path.exists(cover_src):
        static_img_dir = os.path.join(hugo_root, 'static', 'images')
        os.makedirs(static_img_dir, exist_ok=True)
        shutil.copy(cover_src, os.path.join(static_img_dir, f"{novel_slug}.jpg"))
        print(f"==> Gambar sampul disalin ke: static/images/{novel_slug}.jpg")

    # 3. Cari folder volume numerik (001, 002, dll) di dalam target folder
    volumes = [d for d in os.listdir(target_folder) if os.path.isdir(os.path.join(target_folder, d)) and d.isdigit()]
    volumes.sort(key=int) # Urutkan volume dari 1, 2, 3...

    global_ch_idx = 1
    
    # Looping membaca tiap folder volume
    for vol in volumes:
        vol_dir = os.path.join(target_folder, vol)
        # Ambil semua file bab berformat .json di dalam folder volume
        ch_files = [f for f in os.listdir(vol_dir) if f.endswith('.json')]
        
        # Sort nama file secara numerik alami (agar bab 2.json tidak lompat setelah 19.json)
        ch_files.sort(key=lambda f: int(re.findall(r'\d+', f)[0]) if re.findall(r'\d+', f) else 0)

        print(f"-> Memproses Volume {vol}: Ditemukan {len(ch_files)} bab...")
        
        # Looping membaca isi teks cerita per bab
        for ch_file in ch_files:
            ch_path = os.path.join(vol_dir, ch_file)
            with open(ch_path, 'r', encoding='utf-8') as f:
                ch_data = json.load(f)

            ch_title = ch_data.get('title', f'Chapter {global_ch_idx}').strip()
            ch_body = ch_data.get('body', ch_data.get('content', ''))

            # Beri padding nama file Markdown Hugo agar berurutan rapi (ch-0001.md)
            ch_slug = f"ch-{global_ch_idx:04d}"
            ch_file_path = os.path.join(novel_dir, f"{ch_slug}.md")

            # Cetak file markdown Hugo
            with open(ch_file_path, 'w', encoding='utf-8') as f:
                f.write('---\n')
                f.write(f'title: "{ch_title}"\n')
                f.write(f'weight: {global_ch_idx}\n')
                f.write('---\n')
                f.write(ch_body)

            global_ch_idx += 1

    print(f"🚀 BERHASIL! Total {global_ch_idx - 1} bab dari '{novel_title}' sukses dipecah ke Hugo content.")

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Cara pakai: python importer.py <nama_folder_hasil_unzip>")
    else:
        import_split_novel(sys.argv[1])