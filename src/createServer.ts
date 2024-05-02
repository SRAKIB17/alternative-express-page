import fs from "fs";
import http, { createServer } from "http";
import https, { createServer as createSecureServer } from "https";
import path from "path";
import { Request, Response, Route, ServerOptionsProps, Url, deleteCookie, file, getParams, parseCookies, setCookie } from ".";

export class CreateServer {
    server: https.Server | http.Server;
    protected _routes: Route[] = [];
    protected _config: Array<(req: Request, res: Response, next: (err?: any) => any) => void> = [];
    constructor(option: ServerOptionsProps = { enableSsl: false }) {
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

    protected static_serve(...args: any[]): void {
        const route = args?.length == 2 ? args[0] : null;
        const pathname = args?.length == 2 ? args[1] : args?.[0];
        const fullPath = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
        fs.stat(fullPath, (err, stats) => {
            if (err) {
                console.log(new Error(`File not found!! Path: ${fullPath}`))
            }
            if (stats.isDirectory()) {
                fs.readdir(fullPath, (err, files) => {
                    if (err) {
                        console.log(new Error(`Index file not found! Path: ${fullPath}`))
                    }
                    files.forEach(file => {
                        this._routes.push({
                            method: "GET", path: `${route ? route : "/"}${file}`, callback(req, res) {
                                res.sendFile(`${fullPath}/${file}`)
                            },
                        })
                    });
                });
            }
            else {
                const fileName = path.basename(fullPath);
                this._routes.push({
                    method: "GET", path: `${route ? route : "/"}${fileName}`, callback(req, res) {
                        res.sendFile(fullPath)
                    },
                })
            }
        });
    }
    protected route_middleware_handler(method: string, path: string, ...args: any[]): void {
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
            this._routes.push({ path, method, callback: handler });
        }
        else {
            console.log(new Error("Route callback function is missing."));
        }
    }

    #responseHandler(route: Route, req: Request, res: Response) {
        let statusCode = 0;
        res.status = (status) => {
            statusCode = status;
            return res
        }

        res.json = (data, option, headers) => {
            const status = statusCode || option?.status || 200;
            res.writeHead(status, {
                ...headers,
                'Content-Type': 'application/json'
            });
            res.end(JSON.stringify(data));
        };

        res.deleteCookie = (cookieName: string, options) => {
            deleteCookie(res, cookieName, options)
        };
        res.setCookie = (cookieName: string, cookieValue: string, options) => {
            setCookie(res, cookieName, cookieValue, options)
        };

        res.buffer = (buffer, bufferOption, headers) => {
            const status = statusCode || bufferOption?.status || 200;
            let option = {};
            if (bufferOption?.contentType) {
                option = { 'Content-Type': bufferOption?.contentType }
            }
            res.writeHead(status, {
                ...headers,
                ...option
            });
            res.end(buffer);
        };

        res.text = (data, option, headers) => {
            const status = statusCode || option?.status || 200;
            res.writeHead(status, {
                ...headers,
                'Content-Type': 'text/plain'
            });
            res.end(data);
        };

        res.html = (data, option, headers) => {
            const status = statusCode || option?.status || 200;
            res.writeHead(status, {
                ...headers,
                'Content-Type': 'text/html'
            });
            res.end(data);
        };
        res.xml = (data, option, headers) => {
            const status = statusCode || option?.status || 200;
            res.writeHead(status, {
                ...headers,
                'Content-Type': 'application/xml'
            });
            res.end(data);
        };

        res.redirect = (url, option, headers) => {
            const status = statusCode || option?.status || 302;
            res.writeHead(status, {});
            res.writeHead(status, {
                ...headers,
                'Location': url
            });
            res.end();
        };

        res.sendFile = (filePath) => {
            const fileStream = fs.createReadStream(filePath);
            fileStream.pipe(res);
        };

        res.error = (status, message, headers) => {
            res.writeHead(statusCode || status, {
                ...headers,
                'Content-Type': 'application/json'
            });
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
        const route = this._routes.find(r => {
            const path = (r?.path && r?.path?.lastIndexOf('/') > 0 && r?.path?.lastIndexOf('/') == r?.path?.length - 1) ? r?.path?.slice(0, -1) : r?.path;
            const params = getParams(pathname, r?.path);
            req.params = params;
            req.query = url?.query;
            req.cookies = parseCookies(req?.headers?.cookie || "")
            req.location = url;
            return (path === pathname || Object.values(params)?.length) && (r.method === req.method || r?.method == "ALL");
        });
        if (route) {
            this.#responseHandler(route, req, res);
        }
        else {
            this.#notFoundHandler(req, res);
        }
    }

    #commonMiddlewareCall(req: Request, res: Response, callback: () => void) {
        const middlewares = this._config;
        let i = 0;
        const handing = () => {
            if (i < middlewares?.length) {
                const middleware = middlewares[i++];
                if (middleware.length == 3) {
                    middleware(req, res, handing);
                }
                else {
                    console.log(new Error("Next middleware function or the final request handler is missing."));
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
        const find = this._routes.find(r => r.path == "*" && (r.method === req.method || r?.method == "ALL"));
        if (find) {
            this.#responseHandler(find, req, res);
        }
        else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            const { path } = new Url(req?.url || "")?.urlParse;
            res.end(`${req?.method}: '${path}' could not find\n`);
        }
    }
}