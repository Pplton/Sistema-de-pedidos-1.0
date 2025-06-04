from http.server import HTTPServer, SimpleHTTPRequestHandler
import json
import os
from urllib.parse import parse_qs, urlparse

class JSONHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith('/data/'):
            try:
                file_path = self.path[1:]  # Remove a barra inicial
                if os.path.exists(file_path):
                    # Lê o arquivo JSON
                    with open(file_path, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                    # Envia a resposta
                    self.send_response(200)
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps(data).encode())
                else:
                    # Se o arquivo não existe, retorna um array vazio
                    self.send_response(200)
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps([]).encode())
            except Exception as e:
                self.send_error(500, str(e))
        else:
            return SimpleHTTPRequestHandler.do_GET(self)

    def do_POST(self):
        if self.path.startswith('/data/'):
            try:
                # Lê o corpo da requisição
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                data = json.loads(post_data.decode('utf-8'))

                # Garante que o diretório existe
                os.makedirs(os.path.dirname(self.path[1:]), exist_ok=True)

                # Salva como JSON
                with open(self.path[1:], 'w', encoding='utf-8') as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)

                # Envia resposta de sucesso
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"success": True}).encode())
            except Exception as e:
                self.send_error(500, str(e))
        else:
            self.send_error(404, "Not found")

def run(server_class=HTTPServer, handler_class=JSONHandler, port=8000):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f"Starting server on port {port}...")
    httpd.serve_forever()

if __name__ == '__main__':
    run() 