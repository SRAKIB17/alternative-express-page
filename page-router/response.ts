import fs from "fs";
import path from "path";
import { ParseFormData } from "./parse_form_data";
import { Request, Response, } from "./types";
import { ServerErrorType, Url, deleteCookie, err, errorMsgHtmlGen, getParams, isModuleFile, parseCookies, setCookie } from "./utils";

export class ResponseHandler extends ParseFormData {
    #root: string;
    #file_type: string;
    protected routes: string[] = [];
    protected folder: string[] = [];
    constructor(root: string, type: string) {
        super(root, type);
        this.#root = root;
        this.#file_type = type;
        // console.log(this.findMiddlewareFiles(this.#root))
        const directoryPath = './routes';
        const filesArray: string[] = [];
        const directoriesArray: string[] = [];
    }

    // protected async handleFileName(filePath: string, req: Request, res: Response): Promise<void> {
    //     // if () {
    //     //     console.log(this.#accessFile(`${filePath}`, req, res, (req, res) => {
    //     //         console.log(filePath.match(/.ts/gi))
    //     //     }))
    //     //     // return this.#handleFileName(`${filePath}.${this.#file_type}.${this.#file_type}`, req, res);
    //     //     this.#notFoundHandler(req, res);
    //     // }
    //     // else {
    //     // const filePath = filePath?.endsWith(`.${this.#file_type}`) ? `${filePath}.ts` : filePath;
    //     // const filePath = filePath.replace(new RegExp(`\\.${this.#file_type}(?!.*\\.${this.#file_type})`), '');

    //     return new Promise<void>((resolve, reject) => {
    //         fs.stat(filePath, (err, stats) => {
    //             if (err) {
    //                 if (filePath.endsWith(this.#file_type)) {
    //                     this.notFoundHandler(req, res);
    //                 }
    //                 else {
    //                     const indexPath = path.resolve(`${filePath}${this.#file_type}`);
    //                     this.handleFileName(indexPath, req, res)
    //                         .then(() => resolve())
    //                         .catch(reject);
    //                 }
    //             }
    //             else {
    //                 if (stats.isDirectory()) {
    //                     const indexPath = path.resolve(`${filePath}/index${this.#file_type}`);
    //                     this.#checkPath(indexPath, req, res);
    //                 }
    //                 else {
    //                     this.#checkPath(filePath, req, res);
    //                 }
    //             }
    //         });
    //     });
    //     // }
    // }

    async responseHandler(req: Request, res: Response, args: ((req: Request, res: Response) => void)[] | ((req: Request, res: Response) => void), option?: any) {

        let statusCode = 0;
        // console.log(findMiddlewareFiles('./routes'))

        const used = process.memoryUsage().heapUsed / 1024 / 1024;
        console.log(`The script uses approximately ${Math.round(used * 100) / 100} MB`);

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
            this.parseFormData(req, async () => {
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
                callback(req, res);
            }
            else {
                this.notFoundHandler(req, res);
            }
        });
    }

    async #commonMiddlewareCall(
        req: Request, res: Response,
        middlewares: ((req: Request, res: Response) => void)[] | ((req: Request, res: Response) => void) | any,
        callback: () => void) {

        if (middlewares) {
            let i = 0;
            if (i < middlewares?.length) {
                const middleware = middlewares[i++];
                console.log(middleware(req, res))
                console.log(middleware)
                await this.responseHandler(req, res, [middlewares[i]], (req: Request, res: Response) => {
                    callback();
                    console.log(345435)
                })
            }
        }
        else {
            callback();
        }
    }
    // async #checkPath(pathname: string, req: Request, res: Response): Promise<void> {
    //     // Route points to a file, try to execute it
    //     const module = isModuleFile(pathname);
    //     return new Promise<void>((resolve, reject) => {
    //         fs.access(pathname, fs.constants.F_OK, (err) => {
    //             if (err) {
    //                 this.notFoundHandler(req, res);
    //             }
    //             else {
    //                 if (module) {
    //                     this.moduleHandler(pathname, req, res).then(() => resolve()).catch(reject);
    //                 }
    //                 else {
    //                     const fileContentType = getFileContentType(pathname)?.type;
    //                     if (moduleType.includes(fileContentType)) {
    //                         return this.notFoundHandler(req, res);
    //                     }
    //                     else {
    //                         this.responseHandler(req, res, (req, res) => {
    //                             return res.sendFile(pathname);
    //                         });
    //                     }
    //                 }
    //             }
    //         });
    //     });
    // }

    protected async moduleHandler(
        pathname: string,
        req: Request,
        res: Response,
        rootMiddleware: string[]
    ): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            fs.stat(pathname, (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    const { GET, POST, PUT, DELETE, PATCH, middleware } = require(pathname);
                    const rootMid = rootMiddleware?.length ? require(path.resolve(rootMiddleware?.[0]))?.default : undefined;

                    switch (req.method) {
                        case 'GET':
                            this.responseHandler(req, res, [
                                [rootMid, middleware],
                                GET
                            ])
                                .then(() => resolve())
                                .catch(reject);
                            break;
                        case 'POST':
                            this.responseHandler(req, res, [
                                [rootMid, middleware],
                                POST
                            ])
                                .then(() => resolve())
                                .catch(reject);
                            break;
                        case 'DELETE':
                            this.responseHandler(req, res, [
                                [rootMid, middleware],
                                DELETE
                            ])
                                .then(() => resolve())
                                .catch(reject);
                            break;
                        case 'PUT':
                            this.responseHandler(req, res, [
                                [rootMid, middleware],
                                PUT
                            ])
                                .then(() => resolve())
                                .catch(reject);
                            break;
                        case 'PATCH':
                            this.responseHandler(req, res, [
                                [rootMid, middleware],
                                PATCH
                            ])
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
    protected async serverErrorHandler(
        req: Request,
        res: Response,
        option: ServerErrorType
    ): Promise<void> {
        const errorRegExp = new RegExp(`${path.join(this.#root)?.replace(/\\/gi, "/").replace(/\/$/, '')}\\/error\\.(ts|js)$`);

        const errorRes = this.routes.filter(route => {
            const r = route.replace(/\\/gi, "/");
            return r.match(errorRegExp);
        })?.filter(r => isModuleFile(r));

        try {
            const errors = require(path.resolve(errorRes?.[0]))?.default;
            if (typeof errors == 'function') {
                req.error = option;
                this.responseHandler(req, res, errors);
            }
            else {
                this.#serverError(req, res, option);
            }
        }
        catch (error) {
            this.#serverError(req, res, option);
        }
    }
    #serverError(req: Request, res: Response, option: ServerErrorType): void {
        this.responseHandler(req, res, (req, res) => {
            res.html(errorMsgHtmlGen({
                status: option?.message?.status,
                subtitle: option?.message?.subtitle,
                type: option?.message?.type
            }))
        });
    }

    protected async notFoundHandler(req: Request, res: Response, status: number = 404): Promise<void> {

        const notFoundRegExp = new RegExp(`${path.join(this.#root)?.replace(/\\/gi, "/").replace(/\/$/, '')}\\/notfound\\.(ts|js)$`);
        const notfoundRes = this.routes.filter(route => {
            const r = route.replace(/\\/gi, "/");
            return r.match(notFoundRegExp);
        })?.filter(r => isModuleFile(r));

        try {
            const notfound = require(path.resolve(notfoundRes?.[0]))?.default;
            if (typeof notfound == 'function') {
                this.responseHandler(req, res, notfound);
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
            callback();
            return { success: true }
        }
        catch (error: any) {
            const type = error?.code
            const get: { status: number, description: string } = err?.[type];
            return { success: false, err: error, status: get?.status }
        }
    }

    #notfound(req: Request, res: Response): void {
        this.responseHandler(req, res, (req, res) => {
            const { path } = new Url(req?.url || "")?.urlParse;
            res.text(`${req?.method}: '${path}' could not find\n`);
        });
    }
}