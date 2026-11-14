#!/usr/bin/env python3
"""
Catàleg amb contrasenya: xifra l'HTML perquè es pugui publicar a GitHub Pages
amb preus, clients i costos sense que ningú els pugui llegir sense la contrasenya.

Com funciona (xifratge real, no una simple pantalla de contrasenya):
  - Hi ha un parell de claus (ECDH P-256). La clau pública és a clau.json i
    serveix per xifrar cada versió del catàleg (AES-256-GCM).
  - La clau privada també és a clau.json, però xifrada amb la contrasenya
    (PBKDF2-SHA256, 600.000 iteracions + AES-256-GCM). Només amb la
    contrasenya es pot desxifrar el catàleg.
  - Per canviar la contrasenya no cal tornar a xifrar el catàleg: només canvia
    clau.json. La pàgina mateixa ho fa (obrir-la amb ?clau) i dona el text nou
    per enganxar a GitHub.

  python3 tools/xifrar.py init                       # crea data/clau-pagina.json (demana la contrasenya)
  python3 tools/xifrar.py page ENTRADA.html SORTIDA.html CLAU.json
"""
import base64
import getpass
import gzip
import json
import os
import sys

from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CLAU_DATA = os.path.join(ROOT, 'data', 'clau-pagina.json')
ITER = 600000

b64 = lambda b: base64.b64encode(b).decode('ascii')
unb64 = base64.b64decode


def pw_key(password, salt, it=ITER):
    return PBKDF2HMAC(algorithm=hashes.SHA256(), length=32, salt=salt, iterations=it).derive(password.encode('utf-8'))


def make_clau(password, priv=None):
    priv = priv or ec.generate_private_key(ec.SECP256R1())
    pkcs8 = priv.private_bytes(serialization.Encoding.DER, serialization.PrivateFormat.PKCS8,
                               serialization.NoEncryption())
    pub = priv.public_key().public_bytes(serialization.Encoding.X962, serialization.PublicFormat.UncompressedPoint)
    salt, iv = os.urandom(16), os.urandom(12)
    return {'v': 1, 'pub': b64(pub), 'iter': ITER, 'salt': b64(salt), 'iv': b64(iv),
            'wrapped': b64(AESGCM(pw_key(password, salt)).encrypt(iv, pkcs8, None))}


def check_password(clau, password):
    k = pw_key(password, unb64(clau['salt']), clau['iter'])
    AESGCM(k).decrypt(unb64(clau['iv']), unb64(clau['wrapped']), None)  # llança error si no és


def encrypt(html, clau):
    pub = ec.EllipticCurvePublicKey.from_encoded_point(ec.SECP256R1(), unb64(clau['pub']))
    eph = ec.generate_private_key(ec.SECP256R1())
    key = eph.exchange(ec.ECDH(), pub)  # 32 bytes (coordenada x), igual que deriveBits de WebCrypto
    iv = os.urandom(12)
    data = AESGCM(key).encrypt(iv, gzip.compress(html.encode('utf-8'), 6), None)
    epk = eph.public_key().public_bytes(serialization.Encoding.X962, serialization.PublicFormat.UncompressedPoint)
    return {'epk': b64(epk), 'iv': b64(iv), 'data': b64(data)}


def page(html, clau):
    payload = encrypt(html, clau)
    loader = open(os.path.join(ROOT, 'src', 'xifrat.html'), encoding='utf-8').read()
    return (loader.replace('__CLAU__', json.dumps(clau))
                  .replace('__PAYLOAD__', json.dumps(payload)))


def main():
    a = sys.argv[1:]
    if a[:1] == ['init']:
        pw = os.environ.get('NEXE_CONTRASENYA') or getpass.getpass('Contrasenya: ')
        if len(pw) < 8:
            sys.exit('La contrasenya ha de tenir com a mínim 8 caràcters')
        json.dump(make_clau(pw), open(CLAU_DATA, 'w'), indent=1)
        print('Creat', os.path.relpath(CLAU_DATA, ROOT))
    elif a[:1] == ['page'] and len(a) == 4:
        clau = json.load(open(a[3]))
        html = open(a[1], encoding='utf-8').read()
        open(a[2], 'w', encoding='utf-8').write(page(html, clau))
        print('Catàleg xifrat: %s (%.1f MB)' % (os.path.relpath(a[2]), os.path.getsize(a[2]) / 1e6))
    else:
        sys.exit(__doc__)


if __name__ == '__main__':
    main()
