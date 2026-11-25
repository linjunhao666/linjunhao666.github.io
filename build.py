"""Generate the GitHub Pages HTML from the shared layout and page content."""
import argparse
import hashlib
import json
import re
from html import escape
from pathlib import Path


ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / 'source'


def asset_version(path):
    return hashlib.sha256((ROOT / path).read_bytes()).hexdigest()[:10]


def navigation_link(page, active, label_en=None, label_zh=None):
    current = ' aria-current="page"' if page == active else ''
    return (
        f'<a href="./{escape(page["file"])}.html" data-page="{escape(page["id"])}"'
        f'{current} data-zh="{escape(label_zh or page["zh"])}">'
        f'{escape(label_en or page["en"])}</a>'
    )


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true', help='Verify generated HTML is current.')
    args = parser.parse_args()

    layout = (SOURCE / 'layout.html').read_text(encoding='utf-8')
    pages = json.loads((SOURCE / 'pages.json').read_text(encoding='utf-8'))
    home = pages[0]
    versions = {
        'css_version': asset_version('assets/css/profile.css'),
        'js_version': asset_version('assets/js/profile.js'),
    }
    stale = []
    for page in pages:
        is_home = page == home
        heading_id = ' id="about-me"' if is_home else ''
        values = {
            **versions,
            'title_en': 'Junhao Lin | Sun Yat-sen University' if is_home else escape(f'{page["en"]} | Junhao Lin'),
            'title_zh': '林俊豪 | 中山大学' if is_home else escape(f'{page["zh"]} | 林俊豪'),
            'navigation': '\n'.join('  ' + navigation_link(item, page) for item in pages),
            'back_link': '' if is_home else '<p>' + navigation_link(home, None, 'Back to About Me', '返回关于我') + '</p>\n',
            'heading': f'<h2{heading_id} data-zh="{escape(page["zh"])}">{escape(page["en"])}</h2>',
            'content': (SOURCE / 'pages' / f'{page["file"]}.html').read_text(encoding='utf-8'),
        }
        html = re.sub(r'\{\{(\w+)\}\}', lambda match: values[match[1]], layout)
        target = ROOT / f'{page["file"]}.html'
        if args.check:
            if not target.exists() or target.read_text(encoding='utf-8') != html:
                stale.append(target.name)
        else:
            target.write_text(html, encoding='utf-8')
    if stale:
        parser.exit(1, 'Regenerate: ' + ', '.join(stale) + '\n')


if __name__ == '__main__':
    main()
