import fs from "fs";
import http, { createServer } from "http";
import https, { createServer as createSecureServer } from "https";
import path from "path";
import { Request, Response, ServerOptionsProps, Url, deleteCookie, getParams, parseCookies, setCookie } from "../src";
import { getFileContentType, isModuleFile, moduleType } from "./filetype";
import { middleware } from "./middleware";

// Create a server
export class CreateServer extends middleware {
    server: https.Server | http.Server;
    #option: ServerOptionsProps;
    #root: string;
    #file_type: string;
    // protected _config: Array<(req: Request, res: Response, next: (err?: any) => any) => void> = [];
    constructor(option: ServerOptionsProps = { enableSsl: false }) {
        super();
        this.#root = 'routes';
        this.#file_type = 'ts';
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
    async #response(req: Request, res: Response) {

    }

    async #responseHandler(req: Request, res: Response, args: ((req: Request, res: Response) => void)[] | ((req: Request, res: Response) => void), option?: any) {
        let statusCode = 0;
        const url = new Url(req.url || "").urlParse;
        const params = getParams("pathname", "r?.path");
        req.params = params;
        req.query = url?.query;
        req.cookies = parseCookies(req?.headers?.cookie || "")
        req.location = url;

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

        const middleware = Array.isArray(args) ? args[0] : undefined;
        const callback = Array.isArray(args) ? args[1] : args;
        res.next = () => {
            callback(req, res);
        }

        if (['POST', "PUT", "PATCH"]?.includes(req?.method || "")) {
            await this.parseFormData(req, async () => {
                this.#callback(req, res, middleware, callback);
            })
        }
        else {
            this.#callback(req, res, middleware, callback);
        }
    }
    async #callback(req: Request, res: Response, middleware: ((req: Request, res: Response) => void) | undefined, callback: (req: Request, res: Response) => void) {
        this.#commonMiddlewareCall(req, res, middleware, async () => {
            if (typeof callback == 'function') {
                await callback(req, res);
            }
            else {
                this.#notFoundHandler(req, res);
            }
        });
    }

    #commonMiddlewareCall(req: Request, res: Response, middleware: ((req: Request, res: Response) => void) | undefined, callback: () => void) {
        if (middleware) {
            middleware(req, res)
            // this.#responseHandler(req, res, middleware);
            // let i = 0;
            // const handing = () => {
            //     if (i < middlewares?.length) {
            //         const middleware = middlewares[i++];
            //         if (middleware.length == 3) {
            //             middleware(req, res, handing);
            //         }
            //         else {
            //             console.log(new Error("Next middleware function or the final request handler is missing."));
            //         }
            //     }
            //     else {
            //     }
            // };
        }
        else {
            callback();
        }
    }

    #handleRequest(req: Request, res: Response) {
        const url = new Url(req.url || "").urlParse;
        const pathname = (url?.path && url?.path?.lastIndexOf('/') > 0 && url?.path?.lastIndexOf('/') == url?.path?.length - 1) ? url?.path?.slice(0, -1) : url?.path;
        const filePath = path.resolve(`${this.#root}${pathname}`);
        // const filePath = `./routes${pathname}`;
        return fs.stat(filePath, (err, stats) => {
            if (err) {
                return this.#notFoundHandler(req, res);
            }
            if (stats.isDirectory()) {
                // const pathname = (filePath && filePath?.lastIndexOf('/') > 0 && filePath?.lastIndexOf('/') == filePath?.length - 1) ? filePath?.slice(0, -1) : filePath;
                // Route points to a directory, try to find an index.js file
                const indexPath = path.resolve(`${filePath}/index.${this.#file_type}`);
                return this.#checkPath(indexPath, req, res);
            }
            else {
                this.#checkPath(filePath, req, res);
            }
        });
    }
    #checkPath(pathname: string, req: Request, res: Response) {
        // Route points to a file, try to execute it
        const module = isModuleFile(pathname);
        return fs.access(pathname, fs.constants.F_OK, (err) => {
            if (err) {
                return this.#notFoundHandler(req, res);
            }
            if (module) {
                return this.#moduleHandler(pathname, req, res);
            }
            else {
                if (moduleType.includes(getFileContentType(pathname)?.type)) {
                    return this.#notFoundHandler(req, res);
                }
                else {
                    return this.#responseHandler(req, res, (req, res) => {
                        res.sendFile(pathname);
                    });
                }
            }
        });
    }
    async  #moduleHandler(pathname: string, req: Request, res: Response) {
        const { GET, POST, PUT, DELETE, PATCH, middleware } = require(pathname);
        switch (req.method) {
            case 'GET':
                return this.#responseHandler(req, res, [middleware, GET]);
            case 'POST':
                return this.#responseHandler(req, res, [middleware, POST]);
            case 'DELETE':
                return this.#responseHandler(req, res, [middleware, DELETE]);
            case 'PUT':
                return this.#responseHandler(req, res, [middleware, PUT]);
            case 'PATCH':
                return this.#responseHandler(req, res, [middleware, PATCH]);
            default:
                break;
        }
    }
    #accessFile(filename: string, req: Request, res: Response, callback: (req: Request, res: Response) => void) {
        const pathname = path.resolve(this.#root, filename);
        return fs.access(pathname, fs.constants.F_OK, (err) => {
            if (err) {
                callback(req, res)
            }
            else {
                return this.#responseHandler(req, res, (req, res) => {
                    res.sendFile(pathname);
                });
            }
        });
    }
    #notFoundHandler(req: Request, res: Response) {
        try {
            const notfound = require(path.resolve(this.#root, `404.${this.#file_type}`))?.default;
            if (typeof notfound == 'function') {
                this.#responseHandler(req, res, notfound)
            }
            else {
                this.#notfound(req, res);
            }
        }
        catch {
            this.#notfound(req, res);
        }
    }
    #notfound(req: Request, res: Response) {
        this.#responseHandler(req, res, (req, res) => {
            const { path } = new Url(req?.url || "")?.urlParse;
            res.text(`${req?.method}: '${path}' could not find\n`)
        })
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


