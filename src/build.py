#!/usr/bin/env python3
"""Builds index.html (single file, works by double-click) and Kazakh narration MP3s.

Usage:  python3 src/build.py            # build html + generate missing audio
        python3 src/build.py --no-audio # html only
"""
import asyncio, json, os, sys, hashlib

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'src')
AUDIO = os.path.join(ROOT, 'audio')
VOICE = 'kk-KZ-AigulNeural'

with open(os.path.join(SRC, 'content.json'), encoding='utf-8') as f:
    C = json.load(f)

# ---- collect narration texts -------------------------------------------------
items = {}
for s in C['slides']:
    items['slide_' + s['id']] = s['narration']
    for k, h in (s.get('hotspots') or {}).items():
        items[f"hs_{s['id']}_{k}"] = h['title'] + '. ' + h['text']
for k, h in C['generic'].items():
    items['gen_' + k] = h['title'] + '. ' + h['text']
for m in C['museum']:
    items['mus_' + m['id']] = m['title'] + '. ' + m['text']


async def gen_audio():
    import edge_tts
    os.makedirs(AUDIO, exist_ok=True)
    manifest_p = os.path.join(AUDIO, 'manifest.json')
    manifest = json.load(open(manifest_p)) if os.path.exists(manifest_p) else {}
    sem = asyncio.Semaphore(4)

    async def one(key, text):
        h = hashlib.md5((VOICE + text).encode()).hexdigest()
        out = os.path.join(AUDIO, key + '.mp3')
        if manifest.get(key) == h and os.path.exists(out):
            return
        async with sem:
            for attempt in range(3):
                try:
                    await edge_tts.Communicate(text, VOICE, rate='-6%').save(out)
                    manifest[key] = h
                    print('  ✓', key)
                    return
                except Exception as e:  # network hiccup
                    print('  retry', key, e)
                    await asyncio.sleep(2)

    await asyncio.gather(*(one(k, t) for k, t in items.items()))
    json.dump(manifest, open(manifest_p, 'w'), indent=1)


if '--no-audio' not in sys.argv:
    print('Generating Kazakh narration…')
    asyncio.run(gen_audio())

C['audio'] = sorted(k for k in items if os.path.exists(os.path.join(AUDIO, k + '.mp3')))

tpl = open(os.path.join(SRC, 'template.html'), encoding='utf-8').read()
jsdir = os.path.join(SRC, 'js')
app = '\n'.join(open(os.path.join(jsdir, f), encoding='utf-8').read() for f in sorted(os.listdir(jsdir)) if f.endswith('.js'))
data = 'window.CONTENT = ' + json.dumps(C, ensure_ascii=False) + ';'
html = tpl.replace('/*__DATA__*/', data).replace('/*__APP__*/', app)
open(os.path.join(ROOT, 'index.html'), 'w', encoding='utf-8').write(html)
print(f'index.html written · {len(C["audio"])} audio clips')
