import http, { IncomingMessage, ServerResponse, createServer } from "http";
import https, { createServer as createSecureServer, ServerOptions } from "https";
import { URL } from "url";

interface Route {
    path: string;
    method: string;
    callback: (req: IncomingMessage, res: ServerResponse) => void;
}

interface SecureOption extends ServerOptions {
    enableSsl?: true;
}

interface Option extends ServerOptions {
    enableSsl?: false;
}

type ServerOptionsProps = SecureOption | Option;

class Server {
    server: https.Server | http.Server;
    routes: Route[] = [];

    constructor(option: ServerOptionsProps = { enableSsl: false }) {
        if (option.enableSsl) {
            const { enableSsl, ...sslOptions } = option;
            this.server = createSecureServer(sslOptions, this.handleRequest.bind(this));
        }
        else {
            this.server = createServer(this.handleRequest.bind(this));
        }
    }

    get(path: string, callback: (req: IncomingMessage, res: ServerResponse) => void) {
        this.routes.push({ path, method: "GET", callback });
    }

    post(path: string, callback: (req: IncomingMessage, res: ServerResponse) => void) {
        this.routes.push({ path, method: "POST", callback });
    }

    listen(port: number, callback?: () => void) {
        this.server.listen(port, () => {
            console.log(`Server running at http://localhost:${port}/`);
            if (callback) {
                callback();
            }
        });
    }

    handleRequest(req: IncomingMessage, res: ServerResponse) {
        const { pathname } = new URL(req.url || "", `http://${req.headers.host}`);
        const route = this.routes.find(r => r.path === pathname && r.method === req.method);
        if (route) {
            route.callback(req, res);
        } else {
            this.notFoundHandler(req, res);
        }
    }

    notFoundHandler(req: IncomingMessage, res: ServerResponse) {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.write('<h1>404 Not Found</h1>');
        res.end('<p>The page you are looking for could not be found.</p>');
    }
}

const server = new Server();
server.get('/', (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('GET Request Received!\n');
});

server.post('/test', (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('POST Request Received!TEST\n');
});

server.listen(3000);
server.put('/', (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('PUT Request Received!\n');
});

server.patch('/', (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('PATCH Request Received!\n');
});

server.delete('/', (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('DELETE Request Received!\n');
});

server.listen(3000, () => {
    console.log('Server running at http://localhost:3000/');
});
