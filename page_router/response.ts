import fs from "fs";
import path from "path";
import { Request, Response, Url, deleteCookie, getParams, parseCookies, setCookie } from "../src";
import { getFileContentType, isModuleFile, moduleType } from "./filetype";
import { middleware } from "./middleware";
import { err } from "./errors";

export class ResponseHandler extends middleware {
    #root: string;
    #file_type: string;
    constructor(root: string, type: string) {
        super(root, type);
        this.#root = root;
        this.#file_type = type;
        // console.log(this.findMiddlewareFiles(this.#root))
    }

    protected async handleFileName(filePath: string, req: Request, res: Response): Promise<void> {
        // if () {
        //     console.log(this.#accessFile(`${filePath}`, req, res, (req, res) => {
        //         console.log(filePath.match(/.ts/gi))
        //     }))
        //     // return this.#handleFileName(`${filePath}.${this.#file_type}.${this.#file_type}`, req, res);
        //     this.#notFoundHandler(req, res);
        // }
        // else {
        // const filePath = filePath?.endsWith(`.${this.#file_type}`) ? `${filePath}.ts` : filePath;
        // const filePath = filePath.replace(new RegExp(`\\.${this.#file_type}(?!.*\\.${this.#file_type})`), '');

        return new Promise<void>((resolve, reject) => {
            fs.stat(filePath, (err, stats) => {
                if (err) {
                    if (filePath.endsWith(this.#file_type)) {
                        this.notFoundHandler(req, res);
                    }
                    else {
                        const indexPath = path.resolve(`${filePath}${this.#file_type}`);
                        this.handleFileName(indexPath, req, res)
                            .then(() => resolve())
                            .catch(reject);
                    }
                }
                else {
                    if (stats.isDirectory()) {
                        const indexPath = path.resolve(`${filePath}/index${this.#file_type}`);
                        this.#checkPath(indexPath, req, res);
                    }
                    else {
                        this.#checkPath(filePath, req, res);
                    }
                }
            });
        });
        // }
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
                this.notFoundHandler(req, res);
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
    async #checkPath(pathname: string, req: Request, res: Response): Promise<void> {
        // Route points to a file, try to execute it
        const module = isModuleFile(pathname);
        return new Promise<void>((resolve, reject) => {
            fs.access(pathname, fs.constants.F_OK, (err) => {
                if (err) {
                    this.notFoundHandler(req, res);
                }
                else {
                    if (module) {
                        this.#moduleHandler(pathname, req, res).then(() => resolve()).catch(reject);
                    }
                    else {
                        const fileContentType = getFileContentType(pathname)?.type;
                        if (moduleType.includes(fileContentType)) {
                            return this.notFoundHandler(req, res);
                        }
                        else {
                            this.#responseHandler(req, res, (req, res) => {
                                return res.sendFile(pathname);
                            });
                        }
                    }
                }
            });
        });
    }
    async #moduleHandler(pathname: string, req: Request, res: Response): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            fs.stat(pathname, (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    const { GET, POST, PUT, DELETE, PATCH, middleware } = require(pathname);
                    switch (req.method) {
                        case 'GET':
                            this.#responseHandler(req, res, [middleware, GET])
                                .then(() => resolve())
                                .catch(reject);
                            break;
                        case 'POST':
                            this.#responseHandler(req, res, [middleware, POST])
                                .then(() => resolve())
                                .catch(reject);
                            break;
                        case 'DELETE':
                            this.#responseHandler(req, res, [middleware, DELETE])
                                .then(() => resolve())
                                .catch(reject);
                            break;
                        case 'PUT':
                            this.#responseHandler(req, res, [middleware, PUT])
                                .then(() => resolve())
                                .catch(reject);
                            break;
                        case 'PATCH':
                            this.#responseHandler(req, res, [middleware, PATCH])
                                .then(() => resolve())
                                .catch(reject);
                            break;
                        default:
                            resolve(); // Resolve the promise for other HTTP methods
                            break;
                    }
                }
            });
        });
    }


    // protected async withResponseCode(req: Request, res: Response, callback: () => void) {
    //     const response = await this.retry(async () => await callback());
    //     if (!response?.success) {
    //         return await this.notFoundServerErrorHandler(req, res, response?.status)
    //     }

    // }
    protected async serverErrorHandler(req: Request, res: Response): Promise<void> {
        try {
            // let filename = status!=404? '50'
            const notfound = require(path.resolve(this.#root, `404${this.#file_type}`))?.default;
            if (typeof notfound == 'function') {
                this.#responseHandler(req, res, notfound);
            }
            else {
                this.#notfound(req, res);
            }
        } catch (error) {
            this.#notfound(req, res);
        }
    }
    protected async notFoundHandler(req: Request, res: Response, status: number = 404): Promise<void> {
        try {
            // let filename = status!=404? '50'
            const notfound = require(path.resolve(this.#root, `404${this.#file_type}`))?.default;
            if (typeof notfound == 'function') {
                this.#responseHandler(req, res, notfound);
            }
            else {
                this.#notfound(req, res);
            }
        } catch (error) {
            this.#notfound(req, res);
        }
    }
    async #retry(callback: () => void) {
        try {
            await callback();
            return await { success: true }
        }
        catch (error: any) {
            // console.log(error)
            const get: { status: number, description: string } = err[error?.code];
            return await { success: false, err: error, status: get?.status }
        }
    }
    #notfound(req: Request, res: Response): void {
        this.#responseHandler(req, res, (req, res) => {
            const { path } = new Url(req?.url || "")?.urlParse;
            res.text(`${req?.method}: '${path}' could not find\n`);
        });
    }
}