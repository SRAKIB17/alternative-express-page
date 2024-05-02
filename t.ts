import fs from "fs";
import http, { IncomingMessage, ServerResponse, createServer } from "http";
import https, { ServerOptions, createServer as createSecureServer } from "https";
import { CookieOptions, deleteCookie, parseCookies, setCookie } from "./cookies";
import { getParams } from "./params";
import Url from "./url";

export interface ParsedCookie {
    [key: string]: string;
}

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
    status?: number
}
interface bufferOption extends option {
    contentType?: ContentType
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
export interface Response extends ServerResponse, ResponseMethod {
    status: (status: number) => ResponseMethod;
    deleteCookie: (cookieName: string, options?: CookieOptions) => void
    setCookie: (cookieName: string, cookieValue: string, options?: CookieOptions) => void
}
type file = {
    field: string;
    filename: string;
    name: string;
    type: string;
    size: number;
    buffer: Buffer;
}
export interface Request extends IncomingMessage {
    params: {
        [key: string]: string
    },
    cookies: ParsedCookie,
    query: {
        [key: string]: string
    },
    body: {
        [key: string]: string
    },
    file: file,
    files: file[],
    location: {
        hash: string | null,
        protocol: string | null,
        origin: string | null,
        username: string | null,
        password: string | null,
        hostname: string | null,
        port: string | null,
        href: string | null,
        query: {
            [key: string]: string
        },
        path: string | null
    }
}

interface Route {
    path: string;
    method: string;
    callback: (req: Request, res: Response) => void;
}

export class Server {
    server: https.Server | http.Server;
    #option: ServerOptionsProps
    #routes: Route[] = [];
    #config: Array<((req: Request, res: Response, next: () => void) => void)> = [];
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

    config(middlewares: ((req: Request, res: Response, next: () => void) => void)[]): void;
    config(middleware: (req: Request, res: Response, next: () => void) => void): void
    config(...args: any[]): void {
        const middlewares = Array.isArray(args[0]) ? args[0] : typeof args[0] === 'function' ? [args[0]] : [];
        this.#config = this.#config.concat(middlewares);
        // this.server.on("request", (req: Request, res: Response) => {
        //     let index = 0;
        //     const next = () => {
        //         if (index < middlewares.length) {
        //             const middleware = middlewares[index++];
        //             if (middleware.length == 3) {
        //                 middleware(req, res, next);
        //             }
        //             else {
        //                 console.log(new Error(("Next middleware function or the final request handler is missing.");
        //             }
        //         }
        //         else {
        //         }
        //     };
        //     next();
        // })
    }

    get(path: string, callback: (req: Request, res: Response) => void): void;
    get(path: string, middlewares: ((req: Request, res: Response, next: () => void) => void)[], callback: (req: Request, res: Response) => void): void;
    get(path: string, middlewares: (req: Request, res: Response, next: () => void) => void, callback: (req: Request, res: Response) => void): void;
    get(path: string, ...args: any[]): void {
        this.#route_middleware_handler("GET", path, ...args);
    }
    //? FOR POST METHOD
    post(path: string, callback: (req: Request, res: Response) => void): void;
    post(path: string, middlewares: ((req: Request, res: Response, next: () => void) => void)[], callback: (req: Request, res: Response) => void): void;
    post(path: string, middlewares: (req: Request, res: Response, next: () => void) => void, callback: (req: Request, res: Response) => void): void;
    post(path: string, ...args: any[]): void {
        this.#route_middleware_handler("POST", path, ...args);
    }

    //? FOR PUT METHOD
    put(path: string, callback: (req: Request, res: Response) => void): void;
    put(path: string, middlewares: ((req: Request, res: Response, next: () => void) => void)[], callback: (req: Request, res: Response) => void): void;
    put(path: string, middlewares: (req: Request, res: Response, next: () => void) => void, callback: (req: Request, res: Response) => void): void;
    put(path: string, ...args: any[]): void {
        this.#route_middleware_handler("PUT", path, ...args);
    }

    //? FOR PATCH METHOD
    patch(path: string, callback: (req: Request, res: Response) => void): void;
    patch(path: string, middlewares: ((req: Request, res: Response, next: () => void) => void)[], callback: (req: Request, res: Response) => void): void;
    patch(path: string, middlewares: (req: Request, res: Response, next: () => void) => void, callback: (req: Request, res: Response) => void): void;
    patch(path: string, ...args: any[]): void {
        this.#route_middleware_handler("PATCH", path, ...args);
    }

    //? FOR DELETE METHOD
    delete(path: string, callback: (req: Request, res: Response) => void): void;
    delete(path: string, middlewares: ((req: Request, res: Response, next: () => void) => void)[], callback: (req: Request, res: Response) => void): void;
    delete(path: string, middlewares: (req: Request, res: Response, next: () => void) => void, callback: (req: Request, res: Response) => void): void;
    delete(path: string, ...args: any[]): void {
        this.#route_middleware_handler("DELETE", path, ...args);
    }

    //? FOR ALL METHOD
    all(path: string, callback: (req: Request, res: Response) => void): void;
    all(path: string, middlewares: ((req: Request, res: Response, next: () => void) => void)[], callback: (req: Request, res: Response) => void): void;
    all(path: string, middlewares: (req: Request, res: Response, next: () => void) => void, callback: (req: Request, res: Response) => void): void;
    all(path: string, ...args: any[]): void {
        this.#route_middleware_handler("ALL", path, ...args);
    }

    #route_middleware_handler(method: string, path: string, ...args: any[]): void {
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
            console.log(new Error("Route callback function is missing."));
        }
    }

    use(middleware: (req: Request, res: Response, next: (err?: any) => any) => void) {
        if (middleware.length == 3) {
            this.#config.push(middleware);
        }
        else {
            console.log(new Error("Next middleware function or the final request handler is missing."));
        }
    }

    #responseHandler(route: Route, req: Request, res: Response) {
        let statusCode = 0;
        res.status = (status) => {
            statusCode = status;
            return res
        }

        res.json = (data, option) => {
            const status = statusCode || option?.status || 200;
            res.writeHead(status, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(data));
        };

        res.deleteCookie = (cookieName: string, options) => {
            deleteCookie(res, cookieName, options)
        };
        res.setCookie = (cookieName: string, cookieValue: string, options) => {
            setCookie(res, cookieName, cookieValue, options)
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

        res.text = (data, option) => {
            const status = statusCode || option?.status || 200;
            res.writeHead(status, { 'Content-Type': 'text/plain' });
            res.end(data);
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

        res.redirect = (url, option) => {
            const status = statusCode || option?.status || 302;
            res.writeHead(status, { 'Location': url });
            res.end();
        };

        res.sendFile = (filePath) => {
            const fileStream = fs.createReadStream(filePath);
            fileStream.pipe(res);
        };

        res.error = (status, message) => {
            res.writeHead(statusCode || status, { 'Content-Type': 'text/plain' });
            res.end(message);
        };


        this.#commonMiddlewareCall(req, res, () => {
            if (['POST', "PUT", "PATCH"]?.includes(req?.method || "")) {
                this.#parseFormData(req, () => {
                    route.callback(req, res);
                });
            }
            else {
                route.callback(req, res);
            }
        })
    }

    #handleRequest(req: Request, res: Response) {
        const url = new Url(req.url || "").urlParse;
        const pathname = (url?.path && url?.path?.lastIndexOf('/') > 0 && url?.path?.lastIndexOf('/') == url?.path?.length - 1) ? url?.path?.slice(0, -1) : url?.path;

        const route = this.#routes.find(r => {
            const params = getParams(pathname, r?.path);
            req.params = params;
            req.query = url?.query;
            req.cookies = parseCookies(req?.headers?.cookie || "")
            req.location = url;
            return (r.path === pathname || Object.values(params)?.length) && (r.method === req.method || r?.method == "ALL");
        });
        if (route) {
            this.#responseHandler(route, req, res);
        }
        else {
            this.#notFoundHandler(req, res);
        }
    }

    #commonMiddlewareCall(req: Request, res: Response, callback: () => void) {
        const middlewares = this.#config;
        let i = 0;
        const handing = () => {
            if (i < middlewares?.length) {
                const middleware = middlewares[i++];
                if (middleware.length == 3) {
                    middleware(req, res, handing);
                }
                else {
                    console.log(new Error(("Next middleware function or the final request handler is missing.");
                }
            }
            else {
                callback();
            }
        };
        handing();
    }

    #parseFormData(req: Request, callback: () => void) {
        let body = '';

        const contentType: any = req.headers['content-type'];
        const parts: Buffer[] = [];
        // Collect the request body
        req.on('data', (chunk) => {
            body += chunk;
            parts.push(chunk)
        });

        // Parse the form data when all data is received
        req.on('end', () => {
            try {
                if (contentType == 'application/JSON') {
                    req.body = JSON.parse(body);
                }
                else if (contentType == "application/x-www-form-urlencoded") {
                    const pairs = body.split('&');
                    const formData: { [key: string]: string } = {};
                    pairs.forEach(pair => {
                        const [key, value] = pair.split('=');
                        formData[decodeURIComponent(key)] = decodeURIComponent(value || '');
                    });
                    req.body = formData;
                }
                else if (contentType?.includes("multipart/form-data")) {
                    const formDataField: any = {};
                    const formDataFieldParts = body.split('----------------------------');
                    formDataFieldParts.forEach((part: string) => {
                        const match = part.match(/Content-Disposition: form-data; name="(.*)"\r\n\r\n(.*)\r\n/);
                        if (match && match.length === 3) {
                            const name = match[1];
                            const value = match[2];
                            formDataField[name] = value;
                        }
                    });
                    req.body = formDataField;
                    const boundary = contentType.split('; ')[1].split('=')[1];
                    const formData = Buffer.concat(parts);
                    const formDataString = formData.toString('binary');
                    // Splitting form data into parts
                    const formDataParts = formDataString.split(`--${boundary}`);
                    const files: file[] = [];
                    for (let part of formDataParts) {
                        if (part.includes('filename')) {
                            // Extracting filename
                            const formInputKey = part.match(/name="([^"]+)"/);

                            const filenameMatch = part.match(/filename="([^"]+)"/);
                            const nameMatch = part.match(/name="([^"]+)"/);
                            const contentTypeMatch = part.match(/Content-Type: ([^\r\n]+)/);
                            // Extracting file content
                            const fileContentStartIndex = part.indexOf('\r\n\r\n') + 4;
                            const fileContent = Buffer.from(part.substring(fileContentStartIndex), 'binary');
                            if (filenameMatch && nameMatch && contentTypeMatch && formInputKey) {
                                const filename = filenameMatch[1],
                                    name = nameMatch[1],
                                    contentType = contentTypeMatch[1];

                                const fileInfo = {
                                    field: formInputKey[1],
                                    filename: filename,
                                    name: name,
                                    type: contentType,
                                    size: Buffer.byteLength(fileContent, 'binary'),
                                    buffer: fileContent
                                };
                                files.push(fileInfo)
                            }
                        }
                    }
                    if (files?.length > 1) {
                        req.files = files;
                    }
                    else {
                        req.file = files[0]
                    }
                }
            }
            catch (error) {
                req.body = {};
            }
            callback();
        });
    }

    #notFoundHandler(req: Request, res: Response) {
        const find = this.#routes.find(r => r.path == "*" && r?.method == "GET");
        if (find) {
            this.#responseHandler(find, req, res);
        }
        else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            const { path } = new Url(req?.url || "")?.urlParse;
            res.end(`${req?.method}: '${path}' could not find\n`);
        }
    }

    listen(port: number, callback?: () => void) {
        this.server.listen(port, () => {
            console.log(`Server running at ${this.#option.enableSsl ? "https" : "http"}://localhost:${port}/`);
            if (typeof callback == 'function') {
                callback();
            }
        });
    }
}

