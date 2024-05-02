import fs from "fs";
import http, { IncomingMessage, ServerResponse, createServer } from "http";
import https, { ServerOptions, createServer as createSecureServer } from "https";
import path from "path";
import { getParams } from "./params";
import Url from "./url";

interface SecureOption extends ServerOptions {
    enableSsl?: true;
}

interface Option extends ServerOptions {
    enableSsl?: false;
}

type ServerOptionsProps = SecureOption | Option;

enum ContentType {
    PlainText = 'text/plain',
    HTML = 'text/html',
    JSON = 'application/json',
    XML = 'application/xml',
    CSS = 'text/css',
    JavaScript = 'application/javascript',
    Markdown = 'text/markdown',
    CSV = 'text/csv',
    PDF = 'application/pdf',
    ImageJPEG = 'image/jpeg',
    ImagePNG = 'image/png',
    ImageGIF = 'image/gif',
    SVG = 'image/svg+xml',
    AudioMPEG = 'audio/mpeg',
    AudioWAV = 'audio/wav',
    VideoMP4 = 'video/mp4',
    BinaryData = 'application/octet-stream'
}

interface option {
    status?: number;
}

interface bufferOption extends option {
    contentType?: ContentType;
}

interface ResponseMethod {
    json: (data: any, option?: option) => void;
    html: (data: string, option?: option) => void;
    xml: (data: string, option?: option) => void;
    text: (data: string, option?: option) => void;
    sendFile: (filePath: string) => void;
    buffer: (buffer: Buffer, option?: bufferOption) => void;
    error: (status: number, message: string) => void;
    redirect: (url: string, option?: option) => void;
}

interface Response extends ServerResponse, ResponseMethod {
    status: (status: number) => ResponseMethod;
}

type file = {
    field: string;
    filename: string;
    name: string;
    type: string;
    size: number;
    buffer: Buffer;
}

interface Request extends IncomingMessage {
    params: { [key: string]: string };
    query: { [key: string]: string };
    body: { [key: string]: string };
    file: file;
    files: file[];
    urlParse: {
        hash: string | null;
        protocol: string | null;
        origin: string | null;
        username: string | null;
        password: string | null;
        hostname: string | null;
        port: string | null;
        href: string | null;
        query: { [key: string]: string };
        path: string | null;
    }
}

interface Route {
    path: string;
    method: string;
    callback: (req: Request, res: Response) => void;
}

class Server {
    server: https.Server | http.Server;
    #option: ServerOptionsProps;
    #routes: Route[] = [];

    constructor(option: ServerOptionsProps = { enableSsl: false }) {
        this.#option = option;
        if (option.enableSsl) {
            const { enableSsl, ...sslOptions } = option;
            const handleRequest: any = this.#handleRequest.bind(this);
            this.server = createSecureServer(sslOptions, handleRequest);
        }
        else {
            const { enableSsl, ...httpOptions } = option;
            const handleRequest: any = this.#handleRequest.bind(this);
            this.server = createServer(httpOptions, handleRequest);
        }
    }

    // Middleware to handle CORS
    corsMiddleware(req: Request, res: Response, next: () => void) {
        res.setHeader('Access-Control-Allow-Origin', '*'); // Allow requests from any origin
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS'); // Allow specified HTTP methods
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Allow specified headers
        next();
    }

    // Middleware to parse request body
    bodyParserMiddleware(req: Request, res: Response, next: () => void) {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk;
        });
        req.on('end', () => {
            try {
                req.body = JSON.parse(body);
            } catch (error) {
                req.body = {};
            }
            next();
        });
    }

    // Method to handle requests
    #handleRequest(req: Request, res: Response) {
        const url = new Url(req.url || "").urlParse;
        const pathname = (url?.path && url?.path?.lastIndexOf('/') > 0 && url?.path?.lastIndexOf('/') == url?.path?.length - 1) ? url?.path?.slice(0, -1) : url?.path;

        const route = this.#routes.find(r => {
            const params = getParams(pathname, r?.path);
            req.params = params;
            req.query = url?.query;
            req.urlParse = url;
            return (r.path === pathname || Object.values(params)?.length) && (r.method === req.method || r?.method == "ALL");
        });

        if (route) {
            let statusCode = 0;
            res.status = (status) => {
                statusCode = status;
                return res;
            }

            res.json = (data, option) => {
                const status = statusCode || option?.status || 200;
                res.writeHead(status, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(data));
            };

            res.buffer = (buffer, bufferOption) => {
                const status = statusCode || bufferOption?.status || 200;
                let option = {};
                if (bufferOption?.contentType) {
                    option = { 'Content-Type': bufferOption?.contentType }
                }
                res.writeHead(status, option);
                res.end(buffer);
            };

            res.html = (data, option) => {
                const status = statusCode || option?.status || 200;
                res.writeHead(status, { 'Content-Type': 'text/html' });
                res.end(data);
            };

            res.xml = (data, option) => {
                const status = statusCode || option?.status || 200;
                res.writeHead(status, { 'Content-Type': 'application/xml' });
                res.end(data);
            };

            res.text = (data, option) => {
                const status = statusCode || option?.status || 200;
                res.writeHead(status, { 'Content-Type': 'text/plain' });
                res.end(data);
            };

            res.sendFile = (filePath) => {
                fs.readFile(filePath, (err, data) => {
                    if (err) {
                        res.error(500, err.message || "Internal Server Error");
                    } else {
                        const contentType = path.extname(filePath) === '.html' ? ContentType.HTML : ContentType.BinaryData;
                        res.writeHead(200, { 'Content-Type': contentType });
                        res.end(data);
                    }
                });
            };

            res.error = (status, message) => {
                res.writeHead(status, { 'Content-Type': 'text/plain' });
                res.end(message);
            };

            res.redirect = (url, option) => {
                const status = statusCode || option?.status || 302;
                res.writeHead(status, { 'Location': url });
                res.end();
            };

            route.callback(req, res);
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
        }
    }

    // Method to start the server
    listen(port: number, hostname?: string, backlog?: number, callback?: () => void) {
        this.server.listen(port, hostname, backlog, callback);
    }

    // Method to add middleware globally
    use(middleware: (req: Request, res: Response, next: () => void) => void) {
        this.#routes.push({ path: "*", method: "ALL", callback: middleware });
    }

    // Method to add route for specific HTTP method
    route(method: string, path: string, callback: (req: Request, res: Response) => void): void;
    route(method: string, path: string, middlewares: ((req: Request, res: Response, next: () => void) => void)[], callback: (req: Request, res: Response) => void): void;
    route(method: string, path: string, middlewares: (req: Request, res: Response, next: () => void) => void, callback: (req: Request, res: Response) => void): void;
    route(method: string, path: string, ...args: any[]): void {
        const middlewares = Array.isArray(args[0]) ? args[0] : typeof args[0] == 'function' ? [args[0]] : [];
        const callback = typeof args[args.length - 1] === 'function' ? args[args.length - 1] : undefined;
        if (callback) {
            // Create a handler function that chains the middlewares and the route callback
            const handler = (req: Request, res: Response) => {
                let index = 0;
                const next = () => {
                    if (index < middlewares.length) {
                        // Call the next middleware in the chain
                        middlewares[index++](req, res, next);
                    }
                    else {
                        // All middlewares have been executed, call the route callback
                        callback(req, res);
                    }
                };
                // Start the middleware chain
                next();
            };
            // Add the route with the combined handler to the routes array
            this.#routes.push({ path, method, callback: handler });
        }
        else {
            console.log(new Error(("Route callback function is missing.");
        }
    }

    // Methods to add routes for specific HTTP methods
    get(path: string, ...args: any[]): void {
        this.route("GET", path, ...args);
    }

    post(path: string, ...args: any[]): void {
        this.route("POST", path, ...args);
    }

    put(path: string, ...args: any[]): void {
        this.route("PUT", path, ...args);
    }

    delete(path: string, ...args: any[]): void {
        this.route("DELETE", path, ...args);
    }
}

export { Server, Request, Response, ContentType };
