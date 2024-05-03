import http, { createServer } from "http";
import https, { createServer as createSecureServer } from "https";
import path from "path";
import { Request, Response, ServerOptionsProps, Url } from "../src";
import { ResponseHandler } from "./response";

interface Handlers {
    GET?: (req: Request, res: Response) => void;
    POST?: (req: Request, res: Response) => void;
    PUT?: (req: Request, res: Response) => void;
    DELETE?: (req: Request, res: Response) => void;
    PATCH?: (req: Request, res: Response) => void;
    middleware?: (req: Request, res: Response, next: () => void) => void;
}

const rootPath = path.dirname(require?.main?.filename || "");
console.log(process.env.APP_ROOT_PATH)

console.log((require.main?.path || ""))
console.log(process.cwd(), 'sdff')


// Create a server
export class CreateServer extends ResponseHandler {
    server: https.Server | http.Server;
    #option: ServerOptionsProps;
    #root: string;
    #file_type: string;
    // protected _config: Array<(req: Request, res: Response, next: (err?: any) => any) => void> = [];
    constructor(option: ServerOptionsProps = { enableSsl: false }) {
        super('./routes', '.ts');
        this.#file_type = '.ts';
        this.#root = 'routes';
        console.log()
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
        // const pathname = (url?.path && url?.path?.lastIndexOf('/') > 0 && url?.path?.lastIndexOf('/') == url?.path?.length - 1) ? url?.path?.slice(0, -1) : url?.path;
        const filePath = path.resolve(`${this.#root}${decodeURIComponent(url?.path || "")}`);
        // const pathname = filePath.replace(new RegExp(`\\.${this.#file_type}(?!.*\\.${this.#file_type})`), '');
        // Constructing the regular expression pattern dynamically
        // const regexPattern = new RegExp(`\\${this.#file_type.replace('.', '\\.')}$`);
        // // const filePath = `./routes${pathname}`;
        // const newPath = filePath.replace(regexPattern, ''); // Remove the last occurrence of .ts
        // console.log(newPath, 'fsdfdfxxcxccccccc');
        // const { success, status, err } = await this.#retry(async () => {
        //     console.log(await this.getDirectories(filePath))
        // });
        // console.log(status)
        return this.handleFileName(filePath, req, res);
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


