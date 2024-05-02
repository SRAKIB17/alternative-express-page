import http, { IncomingMessage, ServerResponse, createServer } from "http";
import https, { ServerOptions, createServer as createSecureServer } from "https";

interface SecureOption extends ServerOptions {
    enableSsl?: true;
}

interface Option extends ServerOptions {
    enableSsl?: false;
}

type ServerOptionsProps = SecureOption | Option;

class Server {
    server: https.Server | http.Server;
    #option: ServerOptionsProps;

    constructor(option: ServerOptionsProps = { enableSsl: false }) {
        this.#option = option;
        if (option.enableSsl) {
            const { enableSsl, ...sslOptions } = option;
            this.server = createSecureServer(sslOptions);
        }
        else {
            const { enableSsl, ...httpOptions } = option;
            this.server = createServer(httpOptions);
        }
    }

    get(path: string, callback: (req: IncomingMessage, res: ServerResponse) => void) {
        this.server.on('request', (req, res) => {
            if (req.method === 'GET' && req.url === path) {
                callback(req, res);
            }
        });
    }

    // Add similar methods for other HTTP methods (post, put, patch, delete)

    listen(port: number, callback?: () => void) {
        this.server.listen(port, () => {
            console.log(`Server running at ${this.#option.enableSsl ? "https" : "http"}://localhost:${port}/`);
            if (typeof callback == 'function') {
                callback();
            }
        });
    }
}

const server = new Server();
server.get('/', (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('GET Request Received!\n');
});

server.get('/test', (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('GET Request Received!TEST\n');
});

// Add similar handlers for other paths and methods

server.listen(3000, () => {
    console.log('Server running at http://localhost:3000/');
});
