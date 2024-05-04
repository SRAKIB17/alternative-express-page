import http, { createServer } from "http";
import https, { createServer as createSecureServer } from "https";
import path from "path";
import { readDirectoryRecursive } from "./files";
import { ResponseHandler } from "./response";
import { Request, Response, ServerOptionsProps } from "./types";
import { Url, err, getFileContentType, isModuleFile, moduleType } from "./utils";


// const rootPath = path.dirname(require?.main?.filename || "");
// console.log(process.env.APP_ROOT_PATH)

// console.log((require.main?.path || ""))
// console.log(process.cwd(), 'sdff')





// Create a server
export class Server extends ResponseHandler {
    server: https.Server | http.Server;
    #option: ServerOptionsProps;
    #root: string;
    #file_type: string;
    // protected _config: Array<(req: Request, res: Response, next: (err?: any) => any) => void> = [];
    constructor(option: ServerOptionsProps = { enableSsl: false }) {
        super('./routes', '.ts');
        this.#file_type = '.ts';
        this.#root = 'routes';
        // readDirectoryRecursive(this.#root, (files, folder) => {
        //     // this.routes, this.folder
        //     this.routes = files;
        //     this.folder = folder;
        // })
        readDirectoryRecursive(this.#root, this.routes, this.folder)
        // .then(() => {
        //     // this.routes = filesArray;
        //     console.log(this.routes)
        //     console.log(this.folder)
        // });

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

    async #handleRequest(req: Request, res: Response) {
        const url = new Url(req.url || "").urlParse;

        this.routes?.find(r => {
            // console.log(r, path.join(this.#root, url?.path || ""));
            // console.log(r)
            // console.log(/^index\.(ts|js|html)$/.test(r));
        })


        // const z = { path: "routes" }; // Assuming url is an object with a path property
        // const regexPattern = `${z?.path?.replace(/\//g, "\\/")}\\/index\\.(ts|js|html)$`;
        // const regex = new RegExp(regexPattern);
        // const filteredRoutes = this.routes.filter(route => regex.test(route));
        // console.log(filteredRoutes)


        const rootPath = path.join(this.#root, `${decodeURIComponent(url?.path || "")}`)?.replace(/\\/gi, "/").replace(/\/$/, '');
        // console.log(new RegExp(`${rootPath.replace(/\//gi, "\\/")}\\/index\\.(ts|js|html)$`));

        // const pathname = (url?.path && url?.path?.lastIndexOf('/') > 0 && url?.path?.lastIndexOf('/') == url?.path?.length - 1) ? url?.path?.slice(0, -1) : url?.path;

        // Constructing the regular expression pattern
        const tsJSregexPattern = new RegExp(`${rootPath.replace(/\//gi, "\\/")}\\/index\\.(ts|js)$`);
        const htmlRegexPattern = new RegExp(`${rootPath.replace(/\//gi, "\\/")}\\/index\\.(htm|html)$`);

        // const urxl = "/jsref//fsdfss/fsdfl/index";
        // const regex = /\/([^\/]+)$/;

        const forFile = new RegExp(`${rootPath}.(ts|js)$`);
        // Filtering routes based on the regex
        const filteredRoutes = this.routes.filter(route => {
            const r = route.replace(/\\/gi, "/");
            return r.match(tsJSregexPattern)?.[0] || r.match(forFile)?.[0] || r?.match(htmlRegexPattern) || r == rootPath;
        });
        // const length = filteredRoutes?.length || 0;
        const module = filteredRoutes?.filter(r => isModuleFile(r));

        const staticHtml = filteredRoutes?.filter(r => {
            const fileContentType = getFileContentType(r)?.type;
            return !isModuleFile(r) && !moduleType.includes(fileContentType)
        });

        const forRootMiddleware = new RegExp(`${path.join(this.#root)?.replace(/\\/gi, "/").replace(/\/$/, '')}\\/middleware\\.(ts|js)$`);

        const rootMiddleware = this.routes.filter(route => {
            const r = route.replace(/\\/gi, "/");
            return r.match(forRootMiddleware);
        })?.filter(r => isModuleFile(r));


        if (module?.length > 1 || rootMiddleware?.length > 1) {
            const getErr = err['CONFLICT'];
            console.log(getErr?.title)
            console.log(getErr?.link)
            console.error(new Error(`
            ${getErr?.title}
            ${getErr?.link}
            `))
            return await this.serverErrorHandler(req, res, {
                message: {
                    status: 409,
                    subtitle: ["Filename", `${module?.length > 1 ? module?.join(", ") : ""} ⚠️ ${rootMiddleware?.length > 1 ? rootMiddleware?.join(", ") : ""}`],
                    type: "CONFLICT"
                }
            });
        }
        else if (module?.length == 1) {
            const pathname = path.resolve(module?.[0]);
            return await this.moduleHandler(pathname, req, res, rootMiddleware);
        }
        else if (staticHtml?.length) {
            const pathname = path.resolve(staticHtml?.[0]);
            return await this.responseHandler(req, res, (req, res) => {
                return res.sendFile(pathname);
            });
        }
        else {
            return await this.notFoundHandler(req, res);
        }
        // else if (length == 1) {
        //     // const module = isModuleFile(pathname);
        //     // if (module) {

        //     // }
        //     // else {

        //     //     if () {
        //     //         return this.notFoundHandler(req, res);
        //     //     }
        //     //     else {
        //     //         this.responseHandler(req, res, (req, res) => {
        //     //             return res.sendFile(pathname);
        //     //         });
        //     //     }
        //     // }
        // }
        // else {
        // }

        // const filePath = path.resolve(`${this.#root}${decodeURIComponent(url?.path || "")}`);

        // // const pathname = (url?.path && url?.path?.lastIndexOf('/') > 0 && url?.path?.lastIndexOf('/') == url?.path?.length - 1) ? url?.path?.slice(0, -1) : url?.path;
        // // const pathname = filePath.replace(new RegExp(`\\.${this.#file_type}(?!.*\\.${this.#file_type})`), '');
        // // Constructing the regular expression pattern dynamically
        // // const regexPattern = new RegExp(`\\${this.#file_type.replace('.', '\\.')}$`);
        // // // const filePath = `./routes${pathname}`;
        // // const newPath = filePath.replace(regexPattern, ''); // Remove the last occurrence of .ts
        // // console.log(newPath, 'fsdfdfxxcxccccccc');
        // // const { success, status, err } = await this.#retry(async () => {
        // //     console.log(await this.getDirectories(filePath))
        // // });
        // // console.log(status)
        // return this.handleFileName(filePath, req, res);
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



