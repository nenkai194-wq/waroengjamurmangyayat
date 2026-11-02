#!/usr/bin/env python3
"""
Server Backend Resmi Waroeng Jamur Mang Yayat
Menyediakan server file statis (Frontend & Admin), REST API untuk manajemen konten (CRUD),
sistem autentikasi Login/Logout, dan optimasi SEO Google.
"""

import http.server
import socketserver
import json
import os
import sys
import secrets
import urllib.parse
from datetime import datetime

PORT = 8080
STORE_PATH = os.path.join(os.path.dirname(__file__), 'data', 'store.json')
AUTH_PATH = os.path.join(os.path.dirname(__file__), 'data', 'auth.json')
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Token session storage in-memory: token -> {"username": username, "time": timestamp}
ACTIVE_TOKENS = {}

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
Disallow: /admin.html
Disallow: /login.html
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

        # Aliases
        if path == '/login' or path == '/login/':
            self.send_response(301)
            self.send_header('Location', '/login.html')
            self.end_headers()
            return

        if path == '/admin' or path == '/admin/':
            self.send_response(301)
            self.send_header('Location', '/admin.html')
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

        # API: Login
        if path == '/api/auth/login':
            username = req_data.get('username', '').strip()
            password = req_data.get('password', '').strip()
            auth_cfg = get_auth_config()

            stored_user = auth_cfg.get('username', 'admin')
            stored_pwd = auth_cfg.get('password', 'mangyayat2026')

            # Toleran terhadap huruf besar/kecil pada username
            if username.lower() == stored_user.lower() and password == stored_pwd:
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

        # API: Record new Lead from contact form
        if path == '/api/leads':
            store = get_store_data()
            leads = store.get('leads', [])
            new_lead = {
                'id': f"lead-{int(datetime.now().timestamp())}",
                'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'name': req_data.get('name', 'Anonim'),
                'phone': req_data.get('phone', '-'),
                'interest': req_data.get('interest', '-'),
                'message': req_data.get('message', '-'),
                'status': 'Baru'
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
        print(f"Login: http://localhost:{PORT}/login.html")
        print(f"Admin Backend: http://localhost:{PORT}/admin.html")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer shutting down gracefully.")
            httpd.server_close()

if __name__ == '__main__':
    run()
