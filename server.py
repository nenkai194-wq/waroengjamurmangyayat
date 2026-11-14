#!/usr/bin/env python3
"""
Server Backend Resmi Waroeng Jamur Mang Yayat
Menyediakan server file statis (Frontend & Admin), REST API untuk manajemen konten (CRUD),
sistem autentikasi Login/Logout, dan optimasi SEO Google.
"""

import http.server
import socketserver
import json
import time
import re
import os
import sys
import secrets
import urllib.parse
import base64
from datetime import datetime
import compressor

PORT = int(os.environ.get('PORT', 8080))
STORE_PATH = os.path.join(os.path.dirname(__file__), 'data', 'store.json')
AUTH_PATH = os.path.join(os.path.dirname(__file__), 'data', 'auth.json')
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Token session storage in-memory: token -> {"username": username, "time": timestamp}
ACTIVE_TOKENS = {}

# Security & Anti-Spam state (in-memory sliding window):
IP_LEAD_REQUESTS = {}   # IP -> [timestamps]
LOGIN_ATTEMPTS = {}     # IP -> {"count": int, "locked_until": timestamp}

def check_ip_rate_limit(ip, max_requests=5, window_seconds=300):
    """Sliding-window rate limiter for leads/form submissions"""
    now = time.time()
    reqs = IP_LEAD_REQUESTS.get(ip, [])
    reqs = [t for t in reqs if now - t < window_seconds]
    if len(reqs) >= max_requests:
        IP_LEAD_REQUESTS[ip] = reqs
        return False, int(window_seconds - (now - reqs[0]))
    reqs.append(now)
    IP_LEAD_REQUESTS[ip] = reqs
    return True, 0

def check_login_lockout(ip, max_failures=5, lockout_seconds=900):
    """Brute-force protection for admin login attempts"""
    now = time.time()
    record = LOGIN_ATTEMPTS.get(ip)
    if record and record.get('locked_until', 0) > now:
        remaining = int(record['locked_until'] - now)
        return False, remaining
    return True, 0

def record_failed_login(ip, max_failures=5, lockout_seconds=900):
    now = time.time()
    record = LOGIN_ATTEMPTS.get(ip, {'count': 0, 'locked_until': 0})
    record['count'] += 1
    if record['count'] >= max_failures:
        record['locked_until'] = now + lockout_seconds
    LOGIN_ATTEMPTS[ip] = record

def clear_login_attempts(ip):
    if ip in LOGIN_ATTEMPTS:
        del LOGIN_ATTEMPTS[ip]


def get_store_data():
    if not os.path.exists(STORE_PATH):
        return {}
    try:
        with open(STORE_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"[Error] Failed to read store: {e}")
        return {}

def save_store_data(data):
    try:
        os.makedirs(os.path.dirname(STORE_PATH), exist_ok=True)
        with open(STORE_PATH, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        return True
    except Exception as e:
        print(f"[Error] Failed to save store: {e}")
        return False

def get_auth_config():
    auth = {}
    if os.path.exists(AUTH_PATH):
        try:
            with open(AUTH_PATH, 'r', encoding='utf-8') as f:
                auth = json.load(f)
        except Exception as e:
            print(f"[Error] Failed to read auth: {e}")
            auth = {}

    username = auth.get('username') or 'admin'
    password = auth.get('password') or 'mangyayat2026'

    if not os.path.exists(AUTH_PATH):
        save_auth_config(username, password)

    return {
        'username': username,
        'password': password,
        'updatedAt': auth.get('updatedAt', datetime.now().isoformat())
    }

def save_auth_config(username, password):
    try:
        os.makedirs(os.path.dirname(AUTH_PATH), exist_ok=True)
        data = {
            'username': username,
            'password': password,
            'updatedAt': datetime.now().isoformat()
        }
        with open(AUTH_PATH, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
        return True
    except Exception as e:
        print(f"[Error] Failed to save auth: {e}")
        return False

def verify_token(headers, query_params=None):
    # 1. Check Authorization: Bearer <token>
    auth_header = headers.get('Authorization', '')
    if auth_header.startswith('Bearer '):
        token = auth_header[7:].strip()
        if token in ACTIVE_TOKENS:
            return token, ACTIVE_TOKENS[token]

    # 2. Check query parameter ?token=
    if query_params:
        token = query_params.get('token', [''])[0]
        if token in ACTIVE_TOKENS:
            return token, ACTIVE_TOKENS[token]

    return None, None

def generate_sitemap_and_robots(data):
    try:
        base_url = data.get('seo', {}).get('canonicalUrl', 'https://waroengjamurmangyayat.com/').rstrip('/')
        today = datetime.now().strftime('%Y-%m-%d')
        
        # 1. Sitemap XML
        sitemap_content = f'''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>{base_url}/</loc>
    <lastmod>{today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>{base_url}/#produk</loc>
    <lastmod>{today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>{base_url}/#kemitraan</loc>
    <lastmod>{today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>{base_url}/#edukasi</loc>
    <lastmod>{today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>'''

        # 2. Robots TXT
        robots_content = f'''# Robots.txt Resmi Waroeng Jamur Mang Yayat
User-agent: *
Allow: /
Disallow: /dapur.html
Disallow: /dapur-utama.html
Disallow: /data/

Sitemap: {base_url}/sitemap.xml
'''

        sitemap_path = os.path.join(BASE_DIR, 'sitemap.xml')
        robots_path = os.path.join(BASE_DIR, 'robots.txt')

        with open(sitemap_path, 'w', encoding='utf-8') as f:
            f.write(sitemap_content.strip())

        with open(robots_path, 'w', encoding='utf-8') as f:
            f.write(robots_content.strip())

        return True, "Sitemap XML & Robots.txt berhasil digenerate!"
    except Exception as e:
        return False, str(e)

class WaroengJamurHandler(http.server.SimpleHTTPRequestHandler):
    def get_client_ip(self):
        forwarded = self.headers.get('X-Forwarded-For')
        if forwarded:
            return forwarded.split(',')[0].strip()
        real_ip = self.headers.get('X-Real-IP')
        if real_ip:
            return real_ip.strip()
        return self.client_address[0] if self.client_address else '127.0.0.1'

    def end_headers(self):
        # Enable CORS and caching headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query_params = urllib.parse.parse_qs(parsed.query)

        # Aliases & Stealth Admin Routing
        if path in ('/dapur', '/dapur/'):
            self.send_response(301)
            self.send_header('Location', '/dapur.html')
            self.end_headers()
            return

        if path in ('/dapur-utama', '/dapur-utama/'):
            self.send_response(301)
            self.send_header('Location', '/dapur-utama.html')
            self.end_headers()
            return

        # Anti-Probing Defense: Redirect any probing to old admin or login URLs straight to homepage
        if path in ('/admin', '/admin/', '/admin.html', '/login', '/login/', '/login.html'):
            self.send_response(302)
            self.send_header('Location', '/')
            self.end_headers()
            return

        # API: Verify Auth Session
        if path == '/api/auth/verify':
            token, session = verify_token(self.headers, query_params)
            if token and session:
                resp = {
                    'authenticated': True,
                    'username': session.get('username', 'Admin'),
                    'loginTime': session.get('time')
                }
                payload = json.dumps(resp).encode('utf-8')
                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Content-Length', str(len(payload)))
                self.end_headers()
                self.wfile.write(payload)
                return
            else:
                resp = {'authenticated': False, 'message': 'Sesi belum aktif atau telah kedaluwarsa'}
                payload = json.dumps(resp).encode('utf-8')
                self.send_response(401)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Content-Length', str(len(payload)))
                self.end_headers()
                self.wfile.write(payload)
                return

        # API: Get Data Store
        if path == '/api/data':
            data = get_store_data()
            # Do not expose raw password in public /api/data response
            safe_data = json.loads(json.dumps(data))
            if 'auth' in safe_data:
                safe_data['auth'] = {'username': safe_data['auth'].get('username', 'admin')}
            payload = json.dumps(safe_data, ensure_ascii=False).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Content-Length', str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
            return

        # API: Status
        if path == '/api/status':
            status = {
                'status': 'online',
                'server': 'Waroeng Jamur Backend API v2.2 (Auth Protected)',
                'timestamp': datetime.now().isoformat(),
                'activeSessions': len(ACTIVE_TOKENS),
                'port': PORT
            }
            payload = json.dumps(status).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Content-Length', str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
            return

        # Default static file handling
        super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)

        try:
            req_data = json.loads(body.decode('utf-8')) if body else {}
        except Exception:
            req_data = {}

        # API: Login dengan Proteksi Anti-Brute-Force Lockout
        if path == '/api/auth/login':
            client_ip = self.get_client_ip()

            # Cek status lockout IP
            can_attempt, wait_sec = check_login_lockout(client_ip, max_failures=5, lockout_seconds=900)
            if not can_attempt:
                resp = {
                    'success': False,
                    'message': f'Akun/IP sementara dikunci demi keamanan karena 5x percobaan gagal. Silakan coba lagi dalam {int(wait_sec/60) + 1} menit.'
                }
                payload = json.dumps(resp).encode('utf-8')
                self.send_response(429)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Retry-After', str(wait_sec))
                self.send_header('Content-Length', str(len(payload)))
                self.end_headers()
                self.wfile.write(payload)
                return

            username = req_data.get('username', '').strip()
            password = req_data.get('password', '').strip()
            auth_cfg = get_auth_config()

            stored_user = auth_cfg.get('username', 'admin')
            stored_pwd = auth_cfg.get('password', 'mangyayat2026')

            # Toleran terhadap huruf besar/kecil pada username
            if username.lower() == stored_user.lower() and password == stored_pwd:
                clear_login_attempts(client_ip)
                token = secrets.token_hex(24)
                ACTIVE_TOKENS[token] = {
                    'username': stored_user,
                    'time': datetime.now().isoformat()
                }
                resp = {
                    'success': True,
                    'token': token,
                    'username': stored_user,
                    'message': 'Login berhasil! Selamat datang di Panel Admin Waroeng Jamur Mang Yayat.'
                }
                payload = json.dumps(resp).encode('utf-8')
                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Content-Length', str(len(payload)))
                self.end_headers()
                self.wfile.write(payload)
                return
            else:
                record_failed_login(client_ip, max_failures=5, lockout_seconds=900)
                resp = {
                    'success': False,
                    'message': 'Username atau kata sandi tidak cocok. Silakan periksa kembali!'
                }
                payload = json.dumps(resp).encode('utf-8')
                self.send_response(401)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Content-Length', str(len(payload)))
                self.end_headers()
                self.wfile.write(payload)
                return

        # API: Logout
        if path == '/api/auth/logout':
            token, _ = verify_token(self.headers)
            if not token:
                token = req_data.get('token', '')
            if token and token in ACTIVE_TOKENS:
                ACTIVE_TOKENS.pop(token, None)
            resp = {'success': True, 'message': 'Anda telah berhasil logout dari sistem.'}
            payload = json.dumps(resp).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Content-Length', str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
            return

        # API: Change Password / Username
        if path == '/api/auth/change-credentials':
            token, session = verify_token(self.headers)
            if not token:
                resp = {'success': False, 'message': 'Akses ditolak. Sesi tidak valid.'}
                payload = json.dumps(resp).encode('utf-8')
                self.send_response(401)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Content-Length', str(len(payload)))
                self.end_headers()
                self.wfile.write(payload)
                return

            current_pwd = req_data.get('currentPassword', '')
            new_username = req_data.get('newUsername', '').strip()
            new_password = req_data.get('newPassword', '').strip()
            auth_cfg = get_auth_config()

            if current_pwd != auth_cfg.get('password'):
                resp = {'success': False, 'message': 'Kata sandi saat ini salah!'}
                payload = json.dumps(resp).encode('utf-8')
                self.send_response(400)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Content-Length', str(len(payload)))
                self.end_headers()
                self.wfile.write(payload)
                return

            if not new_username or not new_password or len(new_password) < 6:
                resp = {'success': False, 'message': 'Username tidak boleh kosong dan kata sandi baru minimal 6 karakter!'}
                payload = json.dumps(resp).encode('utf-8')
                self.send_response(400)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Content-Length', str(len(payload)))
                self.end_headers()
                self.wfile.write(payload)
                return

            save_auth_config(new_username, new_password)
            ACTIVE_TOKENS[token]['username'] = new_username

            resp = {
                'success': True,
                'message': 'Kredensial berhasil diperbarui!',
                'newUsername': new_username
            }
            payload = json.dumps(resp).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Content-Length', str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
            return

        # API: Save Full Data Store
        if path == '/api/data':
            if not req_data:
                self.send_error(400, "Invalid JSON data")
                return

            # Keep existing auth if not explicitly updating
            existing_store = get_store_data()
            if 'auth' not in req_data and 'auth' in existing_store:
                req_data['auth'] = existing_store['auth']

            success = save_store_data(req_data)
            generate_sitemap_and_robots(req_data)

            resp = {'success': success, 'message': 'Data berhasil disimpan dan disinkronkan ke frontend!'}
            payload = json.dumps(resp).encode('utf-8')
            self.send_response(200 if success else 500)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Content-Length', str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
            return

        # API: Leads (Pesan / Konsultasi Masuk) dengan Proteksi Anti-Spam & Honeypot
        if path == '/api/leads':
            client_ip = self.get_client_ip()

            # 1. IP Rate Limiter: Maksimal 5 kiriman per 5 menit per IP
            is_allowed, retry_after = check_ip_rate_limit(client_ip, max_requests=5, window_seconds=300)
            if not is_allowed:
                resp = {
                    'success': False,
                    'message': f'Terlalu banyak permintaan pesan dari perangkat Anda. Mohon tunggu {retry_after} detik sebelum mengirim kembali demi keamanan sistem.'
                }
                payload = json.dumps(resp).encode('utf-8')
                self.send_response(429)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Retry-After', str(retry_after))
                self.send_header('Content-Length', str(len(payload)))
                self.end_headers()
                self.wfile.write(payload)
                return

            # 2. Honeypot check: bot otomatis mengisi hidden field
            hp = str(req_data.get('hp', '')).strip()
            if hp:
                # Diam-diam pura-pura sukses agar bot tidak mencari celah lain, tapi jangan simpan ke database!
                resp = {'success': True, 'lead': {'id': 'hp-trap', 'name': 'Filtered', 'status': 'Dropped'}}
                payload = json.dumps(resp).encode('utf-8')
                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Content-Length', str(len(payload)))
                self.end_headers()
                self.wfile.write(payload)
                return

            # 3. Sanitasi & Validasi Payload
            raw_name = str(req_data.get('name', 'Anonim'))[:100].strip()
            raw_phone = re.sub(r'[^0-9+]', '', str(req_data.get('phone', '-')))[:20].strip()
            raw_interest = str(req_data.get('interest', '-'))[:200].strip()
            raw_message = str(req_data.get('message', '-'))[:1000].strip()

            def clean_text(t):
                return re.sub(r'<[^>]*>', '', t)

            name = clean_text(raw_name)
            message = clean_text(raw_message)

            # Deteksi keyword spam mencurigakan (judi, slot, casino, link phishing asing)
            spam_triggers = ['slot', 'judi', 'casino', 'poker', 'gacor', 'viagra', 'crypto', 'loan', 't.me/']
            is_spam = any(k in message.lower() or k in name.lower() for k in spam_triggers)

            store = get_store_data()
            leads = store.get('leads', [])
            new_lead = {
                'id': f"lead-{int(datetime.now().timestamp())}",
                'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'name': name,
                'phone': raw_phone,
                'interest': raw_interest,
                'message': message,
                'status': 'Spam' if is_spam else 'Baru',
                'ip': client_ip
            }
            leads.insert(0, new_lead)
            store['leads'] = leads
            save_store_data(store)

            resp = {'success': True, 'lead': new_lead}
            payload = json.dumps(resp).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Content-Length', str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
            return

        # API: Generate Sitemap & Robots
        if path == '/api/seo/generate':
            store = get_store_data()
            ok, msg = generate_sitemap_and_robots(store)
            resp = {'success': ok, 'message': msg}
            payload = json.dumps(resp).encode('utf-8')
            self.send_response(200 if ok else 500)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Content-Length', str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
            return

        # API: Upload & Kompresi Otomatis Media (Foto & Video)
        if path == '/api/upload':
            token, session = verify_token(self.headers)
            if not token:
                body_token = req_data.get('token', '')
                if body_token in ACTIVE_TOKENS:
                    token = body_token
                    session = ACTIVE_TOKENS[body_token]

            if not token:
                self.send_response(401)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                self.wfile.write(json.dumps({'success': False, 'message': 'Autentikasi admin diperlukan'}).encode('utf-8'))
                return

            filename = req_data.get('filename', 'upload.jpg')
            category = req_data.get('category', 'galeri')
            data_b64 = req_data.get('data', '')
            add_to_gallery = req_data.get('addToGallery', False)
            title = req_data.get('title', 'Dokumentasi Kumbung')

            if ',' in data_b64:
                data_b64 = data_b64.split(',', 1)[1]

            try:
                raw_bytes = base64.b64decode(data_b64)
            except Exception as e:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                self.wfile.write(json.dumps({'success': False, 'message': f'Gagal decode base64: {e}'}).encode('utf-8'))
                return

            ext = os.path.splitext(filename)[1].lower()
            safe_basename = "".join(c for c in os.path.splitext(filename)[0] if c.isalnum() or c in ('-', '_')).rstrip()
            if not safe_basename:
                safe_basename = 'upload'
            timestamp = int(datetime.now().timestamp())
            unique_name = f"{safe_basename}-{timestamp}{ext}"

            # Tentukan direktori penyimpanan
            if ext in ['.mp4', '.mov', '.avi', '.mkv']:
                target_rel = os.path.join('assets', 'videos', unique_name)
                target_full = os.path.join(BASE_DIR, target_rel)
                result = compressor.compress_video_data(raw_bytes, target_full)
                file_type = 'video'
            else:
                target_rel = os.path.join('assets', 'images', category, unique_name)
                target_full = os.path.join(BASE_DIR, target_rel)
                result = compressor.compress_image_data(raw_bytes, target_full)
                file_type = 'image'

            url = target_rel.replace('\\', '/')

            # Jika add_to_gallery aktif, catat ke store.json
            if add_to_gallery:
                store = get_store_data()
                if 'gallery' not in store:
                    store['gallery'] = []
                new_item = {
                    'id': f'gal-{timestamp}',
                    'title': title,
                    'type': file_type,
                    'url': url,
                    'thumb': url,
                    'origSize': result.get('orig_size', 0),
                    'compressedSize': result.get('compressed_size', 0),
                    'savedPercent': result.get('saved_percent', 0.0),
                    'createdAt': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                }
                store['gallery'].insert(0, new_item)
                save_store_data(store)

            resp = {
                'success': True,
                'url': url,
                'fileType': file_type,
                'origSize': result.get('orig_size', 0),
                'compressedSize': result.get('compressed_size', 0),
                'savedPercent': result.get('saved_percent', 0.0),
                'message': f"File berhasil dikompresi ({result.get('saved_percent', 0.0)}% hemat storage)"
            }
            payload = json.dumps(resp).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Content-Length', str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
            return

        self.send_error(404, "API route not found")

def run():
    os.chdir(BASE_DIR)
    store = get_store_data()
    generate_sitemap_and_robots(store)

    handler = WaroengJamurHandler
    server_class = getattr(http.server, 'ThreadingHTTPServer', socketserver.ThreadingTCPServer)
    server_class.allow_reuse_address = True
    with server_class(("0.0.0.0", PORT), handler) as httpd:
        print(f"[Waroeng Jamur Mang Yayat] Server running on port {PORT} (Multi-threaded)")
        print(f"Frontend: http://localhost:{PORT}")
        print(f"Login: http://localhost:{PORT}/dapur.html")
        print(f"Admin Backend: http://localhost:{PORT}/dapur-utama.html")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer shutting down gracefully.")
            httpd.server_close()

if __name__ == '__main__':
    run()
