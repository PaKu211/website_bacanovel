#!/usr/bin/env python3
"""
Simple importer to create Hugo chapter markdown files from a plain text file.
Usage examples are in README.md. This script is intentionally small and dependency-free.
"""

import argparse
import os
import sys
from datetime import datetime


def safe_slug(s: str) -> str:
    # simple slug: lowercase, replace spaces with '-', keep alphanum and '-'
    import re
    s = s.strip().lower()
    s = re.sub(r"[^a-z0-9\-\s]", "", s)
    s = re.sub(r"[\s]+", "-", s)
    return s


def main():
    parser = argparse.ArgumentParser(description='Import a plain text file into a Hugo chapter markdown file')
    parser.add_argument('input', help='Input text file (UTF-8). If - use stdin')
    parser.add_argument('--novel-slug', required=True, help='Novel slug (used as content directory)')
    parser.add_argument('--chapter', required=True, help='Chapter number (integer)')
    parser.add_argument('--title', required=False, help='Chapter title (overrides first line)')
    parser.add_argument('--date', required=False, help='Date (YYYY-MM-DD). Defaults to today')
    parser.add_argument('--output-dir', default='content', help='Content root (default: content)')
    args = parser.parse_args()

    # Read input
    if args.input == '-':
        raw = sys.stdin.read()
    else:
        with open(args.input, 'r', encoding='utf-8') as f:
            raw = f.read()

    raw = raw.strip('\n')
    if not raw:
        print('Empty input', file=sys.stderr)
        sys.exit(2)

    # If title not given, take first non-empty line as title
    title = args.title
    lines = raw.splitlines()
    content_body = raw
    if not title:
        for i, L in enumerate(lines):
            if L.strip():
                title = L.strip()
                # remove first line from content if it's the title
                content_body = '\n'.join(lines[i+1:]).lstrip('\n')
                break

    if not title:
        title = f'Chapter {args.chapter}'

    date = args.date or datetime.utcnow().strftime('%Y-%m-%d')

    novel_slug = safe_slug(args.novel_slug)
    chapter_number = str(args.chapter)

    out_dir = os.path.join(args.output_dir, novel_slug)
    os.makedirs(out_dir, exist_ok=True)

    filename = f'chapter-{chapter_number}.md'
    out_path = os.path.join(out_dir, filename)

    frontmatter = (
        '---\n'
        f'title: "{title.replace("\"", "\\\"")}"\n'
        f'novel_title: "{args.novel_slug}"\n'
        f'chapter_number: {chapter_number}\n'
        f'date: {date}\n'
        'draft: true\n'
        'next_chapter: ""\n'
        'previous_chapter: ""\n'
        '---\n\n'
    )

    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(frontmatter)
        f.write(content_body)

    print(f'Wrote: {out_path}')


if __name__ == '__main__':
    main()
