"""Proves locals dels catàlegs públics. No publiquen ni contacten WhatsApp."""
import argparse
import functools
import http.server
import json
import re
import shutil
import subprocess
import sys
import tempfile
import threading
from pathlib import Path
from urllib.parse import urlsplit

from playwright.sync_api import expect, sync_playwright

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'tools'))
import crown_app  # noqa: E402
import public_legal  # noqa: E402


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def products(html):
    return json.loads(re.search(r'^var insemac_products = (.*);$', html, re.M)[1])


def check_build(site, baseline):
    for branch in ('', 'crown'):
        folder = site / branch
        html = (folder / 'index.html').read_text()
        assert re.search(r'var initialClients = \[\];', html)
        assert re.search(r'apiKey: ""', html)
        assert not re.search(r'signInWithEmailAndPassword\(\s*\'(?!\')', html)
        assert '{{firebase:' not in html
        assert not any((folder / name).exists() for name in ('clau.json', 'private', 'firebase.json'))
        assert "wa.me/" in html and f'https://wa.me/{public_legal.WHATSAPP}?' not in html
        assert not re.search(r'<script\s+[^>]*src=', html, re.I)
        if baseline:
            old = (baseline / branch / 'index.html').read_text()
            assert products(html) == products(old), branch
    crown_records = products((site / 'crown/index.html').read_text())
    assert [(p['r'], p['p']) for p in crown_records] == [
        (row['ref'], row['preu']) for row in crown_app.gp.llegir()
    ]
    public_records = products((site / 'index.html').read_text())
    assert not any(p.get('p') or p.get('cost') for p in public_records)
    print(f'Generació i dades verificades: {len(public_records)} registres NEXE, '
          f'{len(crown_records)} referències Crown.')


def monitor(context, origin):
    errors, external, popups = [], [], []

    def watch(page):
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.on('console', lambda msg: errors.append(msg.text)
                if msg.type == 'error' and msg.location.get('url') == page.url else None)
        page.on('popup', lambda popup: popups.append(popup))

    def request(route):
        url = route.request.url
        if url.startswith(origin):
            route.continue_()
        else:
            external.append(url)
            route.fulfill(status=200, body='Prova local de càrrega externa')

    context.on('page', watch)
    context.route('**/*', request)
    return errors, external, popups


def open_product(page, reference):
    page.locator('.nav-item[data-page="search"]').click()
    page.locator('#searchInput').fill(reference)
    page.locator('.search-result-item').first.click()
    expect(page.locator('#prodDetail')).to_be_visible()


def close_product(page):
    page.locator('#detailClose').click()
    page.locator('#searchCancel').click()


def check_links(page, url):
    footer = page.locator('#main .legal-footer')
    for slug, title in public_legal.TITLES.items():
        link = footer.get_by_role('link', name=title, exact=True)
        expect(link).to_have_attribute('href', f'{slug}.html')
        response = page.request.get(f'{url}{slug}.html')
        assert response.ok and f'<h1>{title}</h1>' in response.text()
        if slug in ('avis-legal', 'privacitat', 'contacte'):
            for legal_info in (
                '43734502W',
                'Polígon Collestret, carrer B, nau 1A, 25180 Alcarràs, Lleida, Espanya',
                'cristian@nexeindustrial.es',
            ):
                assert legal_info in response.text()


def check_request(page, context, *, crown=False):
    reference = crown_app.gp.llegir()[0]['ref'] if crown else '17/DGMS100'
    open_product(page, reference)
    page.locator('#addOrderBtn').click()
    page.locator('#addNotes').fill('observació de producte fictícia')
    page.locator('#addConfirm').click()
    close_product(page)
    page.locator('#orderBtn').click()
    expect(page.locator('#orderLegal')).to_be_visible()
    expect(page.locator('#orderLegal a[href="privacitat.html"]')).to_be_visible()
    page.locator('#orderNotes').fill('observació general fictícia')
    if not crown:
        page.locator('#orderShare').click()
        expect(page.locator('#cf_nom')).to_be_focused()
        assert not page.locator('#waDraft').evaluate('(el) => el.open')
        for field, value in {
            'nom': 'Nom inventat', 'empresa': 'Empresa inventada',
            'tel': '600000000', 'poblacio': 'Població inventada',
        }.items():
            page.locator('#cf_' + field).fill(value)
    page.locator('#orderShare').click()
    expect(page.locator('#waDraft')).to_be_visible()
    draft = page.locator('#waText').input_value()
    assert 'observació de producte fictícia' in draft and 'observació general fictícia' in draft
    assert 'TOTAL ORIENTATIU SENSE IVA' in draft if crown else 'Empresa inventada' in draft
    assert not any(secret in page.evaluate('JSON.stringify(localStorage)')
                   for secret in ('observació', 'inventat', 'inventada', '600000000', 'dada anterior'))
    page.locator('#waCopy').click()
    expect(page.locator('#waStatus')).to_have_text('Missatge copiat.')
    assert page.evaluate('navigator.clipboard.readText()') == draft
    target = page.locator('#waOpen').get_attribute('href')
    with page.expect_popup() as popup:
        page.locator('#waOpen').click()
    popup.value.wait_for_load_state()
    assert popup.value.url == target == 'https://wa.me/34610732047'
    assert not urlsplit(target).query
    popup.value.close()
    page.get_by_role('button', name='Tanca', exact=True).click()
    expect(page.locator('#waText')).to_have_value('')
    assert not context.cookies()
    assert page.evaluate('sessionStorage.length') == 0
    page.locator('#orderPanelClose').click()


def check_nexe(context, origin):
    errors, external, popups = monitor(context, origin)
    page = context.new_page()
    page.goto(origin)
    page.evaluate("""() => {
      localStorage.setItem('client_dades', '{"nom":"dada anterior"}');
      localStorage.setItem('nexe_order_notes', 'dada anterior');
      localStorage.setItem('nexe_order', '[{"idx":0,"qty":1,"notes":"dada anterior"}]');
    }""")
    page.reload()
    check_links(page, origin)
    expect(page.locator('#mediaNotice')).to_be_visible()
    open_product(page, '17/DGMS100')
    expect(page.locator('.legal-video')).to_have_count(1)
    assert not page.locator('iframe').count()
    assert not external
    page.locator('#mediaNone').click()
    page.reload()
    expect(page.locator('#mediaNotice')).to_be_hidden()
    assert not external
    check_request(page, context)
    assert len(popups) == 1
    external.clear()

    page.locator('.legal-footer [data-media-settings]').click()
    expect(page.locator('#mediaSettings')).to_be_visible()
    with page.expect_navigation():
        page.locator('#mediaForm [name="videos"]').check()
        page.get_by_role('button', name='Desa la selecció').click()
    open_product(page, '17/DGMS100')
    expect(page.locator('iframe')).to_have_count(1)
    page.wait_for_load_state('networkidle')
    assert external and all(urlsplit(url).hostname == 'www.youtube.com' for url in external)

    page.goto(origin)
    page.locator('.legal-footer [data-media-settings]').click()
    external.clear()
    with page.expect_navigation():
        page.locator('#mediaForm [name="videos"]').uncheck()
        page.locator('#mediaForm [name="photos"]').check()
        page.get_by_role('button', name='Desa la selecció').click()
    open_product(page, 'CIMASER/varilla-en-fibra-de-carbono-para-encimer')
    page.wait_for_load_state('networkidle')
    assert external and all(urlsplit(url).hostname in {'www.cimaser.com', 'www.insemactools.es'}
                            for url in external)

    page.goto(origin)
    page.locator('.legal-footer [data-media-settings]').click()
    with page.expect_navigation():
        page.locator('#mediaAccept').click()
    external.clear()
    open_product(page, '17/DGMS100')
    page.wait_for_load_state('networkidle')
    assert any('www.youtube.com' in url for url in external)
    page.goto(origin)
    page.locator('.legal-footer [data-media-settings]').click()
    with page.expect_navigation():
        page.locator('#mediaReject').click()
    external.clear()
    open_product(page, 'CIMASER/varilla-en-fibra-de-carbono-para-encimer')
    expect(page.get_by_role('button', name='Configura les fotos externes')).to_be_visible()
    close_product(page)
    open_product(page, '17/DGMS100')
    page.wait_for_load_state('networkidle')
    assert not external and not page.locator('iframe').count()
    assert not page.evaluate('navigator.serviceWorker.getRegistrations().then(rs => rs.length)')
    assert not errors, errors
    print('NEXE: formulari, WhatsApp, rebuig, categories separades, acceptació i retirada verificats.')


def check_crown(context, origin):
    errors, external, _ = monitor(context, origin)
    page = context.new_page()
    url = origin + 'crown/'
    page.goto(url)
    page.wait_for_function('navigator.serviceWorker.controller !== null')
    check_links(page, url)
    assert not page.locator('#mediaNotice').count()
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    assert not external
    check_request(page, context, crown=True)
    # Visitar un avís en línia no ha de substituir la pàgina de la PWA a la cau.
    page.goto(url + 'avis-legal.html')
    expect(page.locator('h1')).to_have_text('Avís legal')
    context.set_offline(True)
    page.goto(url)
    expect(page.locator('#page-home')).to_have_class(re.compile(r'\bactive\b'))
    page.get_by_role('link', name='Privacitat', exact=True).click()
    expect(page.locator('h1')).to_have_text('Privacitat')
    assert not errors, errors
    print('Crown: sol·licitud, vista mòbil i navegació sense connexió verificades.')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--baseline', type=Path, help='Sortida dels generadors de la branca base.')
    args = parser.parse_args()
    with tempfile.TemporaryDirectory(prefix='nexe-public-') as directory:
        site = Path(directory)
        for generator, dest in (('client_app', site), ('crown_app', site / 'crown')):
            subprocess.run([sys.executable, f'tools/{generator}.py', '--site', str(dest)],
                           cwd=ROOT, check=True)
        check_build(site, args.baseline)
        handler = functools.partial(QuietHandler, directory=directory)
        with http.server.ThreadingHTTPServer(('127.0.0.1', 0), handler) as server:
            worker = threading.Thread(target=server.serve_forever, daemon=True)
            worker.start()
            try:
                origin = f'http://127.0.0.1:{server.server_port}/'
                with sync_playwright() as pw:
                    browser = pw.chromium.launch(executable_path=shutil.which('chromium'))
                    for check in (check_nexe, check_crown):
                        context = browser.new_context(
                            viewport={'width': 390, 'height': 720}, is_mobile=True, has_touch=True,
                            permissions=['clipboard-read', 'clipboard-write'], locale='ca-ES',
                        )
                        check(context, origin)
                        context.close()
            finally:
                server.shutdown()
                worker.join()


if __name__ == '__main__':
    main()
